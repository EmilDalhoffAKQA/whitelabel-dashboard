import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  createAuth0User,
  generatePasswordResetTicket,
  getUserByEmail,
} from "@/lib/auth0";

interface OnboardingRequest {
  companyName: string;
  adminName: string;
  adminEmail: string;
  primaryColor: string;
  logoUrl?: string;
}

// POST /api/workspace/onboard
export async function POST(req: NextRequest) {
  try {
    const body: OnboardingRequest = await req.json();

    // Validate required fields
    if (!body.companyName || !body.adminName || !body.adminEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure admin client is available
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Step 1: Create the workspace in Supabase
    const { data: workspace, error: workspaceError } = await supabaseAdmin
      .from("workspaces")
      .insert({
        name: body.companyName,
        logo_url: body.logoUrl || null,
        theme_config: {
          primaryColor: body.primaryColor,
          pageBackgroundColor: "#F8F8F8",
          logo: body.logoUrl || "",
          favicon: body.logoUrl || "",
        },
      })
      .select()
      .single();

    if (workspaceError || !workspace) {
      console.error("Workspace creation error:", workspaceError);
      return NextResponse.json(
        { error: "Failed to create workspace" },
        { status: 500 }
      );
    }

    // Step 1.5: Seed default markets for the workspace
    try {
      const defaultMarkets = [
        { name: "Denmark", market_code: "DK", language: "Danish" },
        { name: "Sweden", market_code: "SE", language: "Swedish" },
        { name: "Norway", market_code: "NO", language: "Norwegian" },
        { name: "Finland", market_code: "FI", language: "Finnish" },
        { name: "Germany", market_code: "DE", language: "German" },
      ];

      const marketsToInsert = defaultMarkets.map((market) => ({
        workspace_id: workspace.id,
        name: market.name,
        market_code: market.market_code,
        language: market.language,
        is_active: true,
      }));

      const { error: marketsError } = await supabaseAdmin
        .from("markets")
        .insert(marketsToInsert);

      if (marketsError) {
        console.error("Markets seeding error:", marketsError);
        // Don't fail the whole onboarding if markets fail
      }
    } catch (marketsErr) {
      console.error("Markets seeding exception:", marketsErr);
      // Continue with onboarding even if markets fail
    }

    // Step 2: Create user in Auth0
    let auth0User;
    let inviteLink = null;

    try {
      // Generate a strong random password
      const randomPassword = generateStrongPassword();

      auth0User = await createAuth0User(
        body.adminEmail,
        body.adminName,
        randomPassword
      );

      // Generate password reset ticket (used as invite link)
      const ticket = await generatePasswordResetTicket(auth0User.user_id);
      inviteLink = ticket.ticket;
    } catch (auth0Error: any) {
      console.error("Auth0 error (create):", auth0Error?.message || auth0Error);
      // If user already exists in Auth0, try to fetch the existing user by email
      const errorMsg = (auth0Error.message || "").toLowerCase();
      const isAlreadyExists =
        errorMsg.includes("already exists") ||
        errorMsg.includes("user already exists") ||
        auth0Error.statusCode === 409;

      if (isAlreadyExists) {
        console.log(
          `User ${body.adminEmail} already exists in Auth0, attempting to fetch existing user...`
        );
        try {
          const existing = await getUserByEmail(body.adminEmail);
          console.log("Fetched existing user:", existing?.user_id);
          if (!existing || !existing.user_id) {
            console.error("Failed to retrieve existing user details");
            return NextResponse.json(
              { error: "Auth0 user exists but could not be retrieved" },
              { status: 500 }
            );
          }
          auth0User = existing;
          console.log("Reusing existing Auth0 user:", auth0User.user_id);

          // Generate password reset ticket for existing user
          try {
            const ticket = await generatePasswordResetTicket(auth0User.user_id);
            inviteLink = ticket.ticket;
            console.log("Generated password reset ticket for existing user");
          } catch (ticketErr) {
            console.error(
              "Failed to generate ticket, continuing anyway:",
              ticketErr
            );
            // Continue without ticket - user can request password reset manually
          }
        } catch (fetchErr: any) {
          console.error("Auth0 fetch error:", fetchErr);
          return NextResponse.json(
            {
              error: `Failed to fetch existing user: ${
                fetchErr.message || fetchErr
              }`,
            },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: `Auth0 error: ${auth0Error.message}` },
          { status: 500 }
        );
      }
    }

    // Step 3: Create or update user in Supabase
    let { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .upsert(
        {
          email: body.adminEmail,
          name: body.adminName,
          auth0_id: auth0User?.user_id,
        },
        {
          onConflict: "auth0_id", // Update existing user if auth0_id already exists
          ignoreDuplicates: false, // Always update, don't ignore
        }
      )
      .select()
      .single();

    // If upsert didn't return the user object (some Supabase responses can vary), fetch by auth0_id
    if (userError || !user || !user.id) {
      if (userError) console.warn("Supabase upsert user warning:", userError);
      const { data: fetchedUser, error: fetchErr } = await supabaseAdmin
        .from("users")
        .select()
        .eq("auth0_id", auth0User?.user_id)
        .single();

      if (fetchErr || !fetchedUser) {
        console.error("User creation/fetch error:", userError || fetchErr);
        return NextResponse.json(
          { error: "Failed to create or fetch user" },
          { status: 500 }
        );
      }
      user = fetchedUser;
    }

    // Step 4: Assign admin role to user in this workspace (use upsert to avoid duplicates)
    try {
      const { data: uwData, error: uwError } = await supabaseAdmin
        .from("user_workspaces")
        .upsert({
          user_id: user.id,
          workspace_id: workspace.id,
          role: "admin",
        })
        .select();

      if (uwError) {
        console.error("User workspace assignment error:", uwError);
        return NextResponse.json(
          { error: "Failed to assign user to workspace" },
          { status: 500 }
        );
      }
    } catch (err) {
      console.error("User workspace assignment exception:", err);
      return NextResponse.json(
        { error: "Failed to assign user to workspace" },
        { status: 500 }
      );
    }

    // Note: Widgets are now global (workspace_id = NULL) and shared across all workspaces
    // No need to copy widgets per workspace anymore

    // Step 5: Send invitation email with password setup link
    if (inviteLink) {
      try {
        const { sendInviteEmail } = await import("@/lib/mailjet");
        const result = await sendInviteEmail({
          to: body.adminEmail,
          name: body.adminName,
          inviteLink,
          workspaceName: workspace.name,
        });
      } catch (emailError) {
        console.error("Email sending error (full details):", emailError);
        console.error(
          "Error message:",
          emailError instanceof Error ? emailError.message : String(emailError)
        );
        // Continue anyway - user can request password reset
      }
    }

    return NextResponse.json({
      success: true,
      workspace: {
        id: workspace.id,
        name: workspace.name,
      },
      message:
        "Workspace created successfully. Check your email to set your password.",
    });
  } catch (error: any) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

function generateStrongPassword(length = 24): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?";
  let pwd = "";
  for (let i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Ensure at least one of each type
  if (!/[A-Z]/.test(pwd)) pwd += "A";
  if (!/[a-z]/.test(pwd)) pwd += "a";
  if (!/[0-9]/.test(pwd)) pwd += "1";
  if (!/[!@#$%^&*()\-_=+\[\]{}|;:,.<>?]/.test(pwd)) pwd += "!";
  return pwd;
}
