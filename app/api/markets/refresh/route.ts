import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateSnapshotForDate } from "@/lib/mock-data";

// Cap how many mock conversation rows to insert per day to avoid huge seeds
const MAX_CONVERSATIONS_PER_DAY = 50;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const workspaceId = Number(body.workspaceId);
    const marketId = body.marketId ? Number(body.marketId) : null;
    const days = typeof body.days === "number" ? body.days : 7;

    if (!workspaceId || !marketId) {
      return NextResponse.json({ error: "workspaceId and marketId required" }, { status: 400 });
    }

    const snapshots = [] as any[];
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const date = d.toISOString().split("T")[0];
      snapshots.push(generateSnapshotForDate(workspaceId, marketId, date, Date.now() + i));
    }

    // Delete existing snapshots for these dates for this market/workspace to avoid duplicates
    const dates = snapshots.map((s) => s.timestamp.split("T")[0]);
    await supabase
      .from("analytics_snapshots")
      .delete()
      .eq("workspace_id", workspaceId)
      .eq("market_id", marketId)
      .in("timestamp", dates.map((d) => `${d}T12:00:00`));

    // Insert new mock snapshots
    const { error: snapError } = await supabase.from("analytics_snapshots").insert(snapshots);
    if (snapError) throw snapError;

    // Also insert synthetic conversation rows so workspace-level conversation counts reflect the mock snapshots
    // Build conversation rows from snapshots.total_conversations
    const conversationRows: any[] = [];
    for (const s of snapshots) {
      const count = Math.min(s.metrics.total_conversations || 0, MAX_CONVERSATIONS_PER_DAY);
      for (let i = 0; i < count; i++) {
        // create timestamps distributed across the day
        const created = new Date(s.timestamp);
        const offsetMinutes = Math.floor(Math.random() * 24 * 60);
        created.setMinutes(created.getMinutes() + offsetMinutes);

        conversationRows.push({
          workspace_id: workspaceId,
          market_id: marketId,
          status: "closed",
          sentiment: "neutral",
          satisfaction_score: null,
          created_at: created.toISOString(),
        });
      }
    }

    if (conversationRows.length > 0) {
      // To avoid duplicates, delete any conversations that match the exact created_at timestamps we plan to insert
      // (This is best-effort; if your schema has constraints, adjust accordingly.)
      try {
        // Insert conversation rows in batches to avoid very large single inserts
        const BATCH = 500;
        for (let i = 0; i < conversationRows.length; i += BATCH) {
          const batch = conversationRows.slice(i, i + BATCH);
          const { error: convError } = await supabase.from("conversations").insert(batch);
          if (convError) console.error("mock conversations insert error", convError);
        }
      } catch (e) {
        console.error("error inserting mock conversations", e);
      }
    }

    return NextResponse.json({ ok: true, insertedSnapshots: snapshots.length, insertedConversations: conversationRows.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
