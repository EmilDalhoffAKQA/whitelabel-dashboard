import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      console.error("Supabase admin client not available");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const userInfo = req.cookies.get("user_info")?.value;
    if (!userInfo) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = JSON.parse(decodeURIComponent(userInfo));

    // Check if superadmin
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("is_superadmin")
      .eq("email", parsed.email)
      .single();

    if (!user?.is_superadmin) {
      return NextResponse.json(
        { error: "Only superadmins can access this" },
        { status: 403 }
      );
    }

    // Get all workspaces
    const { data: workspaces, error } = await supabaseAdmin
      .from("workspaces")
      .select("id, name, logo_url")
      .order("id", { ascending: false });

    if (error) {
      console.error("Error fetching workspaces:", error);
      return NextResponse.json(
        { error: "Failed to fetch workspaces" },
        { status: 500 }
      );
    }

    return NextResponse.json({ workspaces: workspaces || [] });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      console.error("Supabase admin client not available");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const userInfo = req.cookies.get("user_info")?.value;
    if (!userInfo) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = JSON.parse(decodeURIComponent(userInfo));

    // Check if superadmin
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("is_superadmin")
      .eq("email", parsed.email)
      .single();

    if (!user?.is_superadmin) {
      return NextResponse.json(
        { error: "Only superadmins can delete workspaces" },
        { status: 403 }
      );
    }

    const { workspaceId } = await req.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID required" },
        { status: 400 }
      );
    }

    console.log(`Deleting workspace ${workspaceId}...`);

    // Get all users in this workspace BEFORE deleting memberships
    const { data: members } = await supabaseAdmin
      .from("user_workspaces")
      .select("user_id, users(auth0_id, email)")
      .eq("workspace_id", workspaceId);

    console.log(`Found ${members?.length || 0} users to delete`);

    // Delete in correct order (foreign keys)
    await supabaseAdmin
      .from("conversations")
      .delete()
      .eq("workspace_id", workspaceId);
    await supabaseAdmin
      .from("workspace_widget_layouts")
      .delete()
      .eq("workspace_id", workspaceId);
    await supabaseAdmin
      .from("user_workspaces")
      .delete()
      .eq("workspace_id", workspaceId);
    await supabaseAdmin
      .from("markets")
      .delete()
      .eq("workspace_id", workspaceId);

    const { error } = await supabaseAdmin
      .from("workspaces")
      .delete()
      .eq("id", workspaceId);

    if (error) {
      console.error("Error deleting workspace:", error);
      return NextResponse.json(
        { error: "Failed to delete workspace" },
        { status: 500 }
      );
    }

    // Delete users from Auth0 and Supabase
    if (members && members.length > 0) {
      console.log(
        `Deleting ${members.length} users from Auth0 and Supabase...`
      );

      for (const member of members) {
        const userData = member.users as {
          auth0_id?: string;
          email?: string;
        } | null;
        if (!userData) continue;

        try {
          // Delete from Auth0
          if (userData.auth0_id) {
            console.log(`Attempting to delete Auth0 user: ${userData.email}`);

            // Get Auth0 Management API token
            const tokenRes = await fetch(
              `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  grant_type: "client_credentials",
                  client_id: process.env.AUTH0_MGMT_CLIENT_ID,
                  client_secret: process.env.AUTH0_MGMT_CLIENT_SECRET,
                  audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
                }),
              }
            );

            if (!tokenRes.ok) {
              const errorText = await tokenRes.text();
              console.error(`Failed to get Auth0 token: ${errorText}`);
              throw new Error(`Auth0 token error: ${errorText}`);
            }

            const tokenData = await tokenRes.json();
            const access_token = tokenData.access_token;

            if (!access_token) {
              console.error("No access token received from Auth0");
              throw new Error("No Auth0 access token");
            }

            console.log(
              `Got Auth0 token, deleting user ${userData.auth0_id}...`
            );

            // Delete user from Auth0
            const deleteRes = await fetch(
              `https://${
                process.env.AUTH0_DOMAIN
              }/api/v2/users/${encodeURIComponent(userData.auth0_id)}`,
              {
                method: "DELETE",
                headers: { Authorization: `Bearer ${access_token}` },
              }
            );

            if (!deleteRes.ok) {
              const errorText = await deleteRes.text();
              console.error(`Failed to delete Auth0 user: ${errorText}`);
              throw new Error(`Auth0 delete error: ${errorText}`);
            }

            console.log(`✅ Deleted Auth0 user: ${userData.email}`);
          } else {
            console.log(
              `⚠️ User ${userData.email} has no auth0_id, skipping Auth0 deletion`
            );
          }

          // Delete from Supabase
          await supabaseAdmin.from("users").delete().eq("id", member.user_id);
          console.log(
            `✅ Deleted Supabase user: ${userData.email || "unknown"}`
          );
        } catch (err: any) {
          console.error(
            `❌ Failed to delete user ${userData.email || "unknown"}:`,
            err.message || err
          );
        }
      }
    }

    console.log(`✅ Workspace ${workspaceId} deleted successfully`);

    return NextResponse.json({
      success: true,
      message: "Workspace deleted successfully",
    });
  } catch (error) {
    console.error("Delete workspace error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
