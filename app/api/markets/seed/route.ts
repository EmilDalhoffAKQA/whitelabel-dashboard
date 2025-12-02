import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/markets/seed
// Seeds default markets for a workspace if none exist
export async function POST(req: NextRequest) {
  try {
    const { workspaceId } = await req.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Check if markets already exist
    const { data: existingMarkets } = await supabaseAdmin
      .from("markets")
      .select("id")
      .eq("workspace_id", workspaceId);

    if (existingMarkets && existingMarkets.length > 0) {
      return NextResponse.json({
        message: "Markets already exist for this workspace",
        count: existingMarkets.length,
      });
    }

    // Default markets to seed
    const defaultMarkets = [
      { name: "Denmark", market_code: "DK", language: "Danish" },
      { name: "Sweden", market_code: "SE", language: "Swedish" },
      { name: "Norway", market_code: "NO", language: "Norwegian" },
      { name: "Finland", market_code: "FI", language: "Finnish" },
      { name: "Germany", market_code: "DE", language: "German" },
    ];

    const marketsToInsert = defaultMarkets.map((market) => ({
      workspace_id: parseInt(workspaceId),
      name: market.name,
      market_code: market.market_code,
      language: market.language,
      is_active: true,
    }));

    const { data: insertedMarkets, error: insertError } = await supabaseAdmin
      .from("markets")
      .insert(marketsToInsert)
      .select();

    if (insertError) {
      console.error("Markets insertion error:", insertError);
      return NextResponse.json(
        { error: "Failed to seed markets" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Markets seeded successfully",
      markets: insertedMarkets,
    });
  } catch (error: any) {
    console.error("Seed markets error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
