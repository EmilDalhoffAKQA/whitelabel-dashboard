import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// You will need to set AUTH0_MGMT_CLIENT_ID, AUTH0_MGMT_CLIENT_SECRET, AUTH0_DOMAIN in your env
async function getAuth0ManagementToken() {
  const res = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: process.env.AUTH0_MGMT_CLIENT_ID,
      client_secret: process.env.AUTH0_MGMT_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
    }),
  });
  if (!res.ok) throw new Error("Failed to get Auth0 management token");
  return (await res.json()).access_token;
}

// POST /api/user/invite
// Body: { email: string, name?: string, workspaceId: string, role?: string }
export async function POST(req: NextRequest) {
  try {
    const { email, name, workspaceId, role } = await req.json();
    if (!email || !workspaceId) {
      return NextResponse.json(
        { error: "Missing email or workspaceId" },
        { status: 400 }
      );
    }

    // 1. Create user in Auth0 (send invite email)
    let mgmtToken, userRes, auth0User;
    let isNewUser = false;
    try {
      mgmtToken = await getAuth0ManagementToken();
      // Generate a strong password (20+ chars, upper/lower/number/symbol)
      function strongPassword(length = 24) {
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
      const randomPassword = strongPassword();
      userRes = await fetch(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/users`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${mgmtToken}`,
          },
          body: JSON.stringify({
            email,
            name,
            password: randomPassword,
            connection: "Username-Password-Authentication",
            email_verified: false,
          }),
        }
      );
      if (!userRes.ok) {
        const err = await userRes.json();
        console.error("Auth0 user creation error:", err);

        // If user already exists, fetch existing user instead
        if (
          err.message?.toLowerCase().includes("already exists") ||
          err.statusCode === 409
        ) {
          try {
            const existingUserRes = await fetch(
              `https://${
                process.env.AUTH0_DOMAIN
              }/api/v2/users-by-email?email=${encodeURIComponent(email)}`,
              {
                headers: {
                  authorization: `Bearer ${mgmtToken}`,
                },
              }
            );
            if (!existingUserRes.ok) {
              return NextResponse.json(
                { error: "Auth0 user exists but could not be retrieved" },
                { status: 500 }
              );
            }
            const existingUsers = await existingUserRes.json();
            auth0User = existingUsers[0];
            console.log("Reusing existing Auth0 user:", auth0User.user_id);
          } catch (fetchErr) {
            console.error("Failed to fetch existing Auth0 user:", fetchErr);
            return NextResponse.json(
              { error: `Auth0 error: ${fetchErr}` },
              { status: 500 }
            );
          }
        } else {
          return NextResponse.json(
            { error: `Auth0 error: ${JSON.stringify(err)}` },
            { status: 500 }
          );
        }
      } else {
        auth0User = await userRes.json();
        isNewUser = true; // Successfully created new user
      }

      // Fetch workspace name for the email
      let workspaceName = "Your Company";
      if (supabaseAdmin) {
        try {
          const { data: workspace } = await supabaseAdmin
            .from("workspaces")
            .select("name")
            .eq("id", workspaceId)
            .single();
          if (workspace?.name) {
            workspaceName = workspace.name;
          }
        } catch (wsErr) {
          console.error("Failed to fetch workspace name:", wsErr);
        }
      }

      // Send appropriate email based on user type
      try {
        if (isNewUser) {
          // Generate password reset ticket for new users
          const ticketRes = await fetch(
            `https://${process.env.AUTH0_DOMAIN}/api/v2/tickets/password-change`,
            {
              method: "POST",
              headers: {
                "content-type": "application/json",
                authorization: `Bearer ${mgmtToken}`,
              },
              body: JSON.stringify({
                user_id: auth0User.user_id,
                result_url:
                  process.env.NEXTAUTH_URL || "http://localhost:3000/login",
              }),
            }
          );

          let inviteLink = null;
          if (ticketRes.ok) {
            const ticket = await ticketRes.json();
            inviteLink = ticket.ticket;
          }

          if (inviteLink) {
            const { sendInviteEmail } = await import("@/lib/mailjet");
            await sendInviteEmail({
              to: email,
              name,
              inviteLink,
              workspaceName,
            });
            console.log("Sent new user invite email");
          }
        } else {
          // Existing user - send notification
          const { sendExistingUserInviteEmail } = await import("@/lib/mailjet");
          await sendExistingUserInviteEmail({
            to: email,
            name,
            workspaceName,
          });
          console.log("Sent existing user notification");
        }
      } catch (mailErr) {
        console.error("Failed to send invite email:", mailErr);
      }
    } catch (err) {
      console.error("Auth0 user creation exception:", err);
      return NextResponse.json(
        { error: `Auth0 exception: ${err}` },
        { status: 500 }
      );
    }

    // 2. Upsert user in Supabase
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase admin client not initialized" },
        { status: 500 }
      );
    }

    let dbUser, userError;
    try {
      const upsertResult = await supabaseAdmin
        .from("users")
        .upsert({ email, name: name || email, auth0_id: auth0User.user_id })
        .select()
        .single();
      dbUser = upsertResult.data;
      userError = upsertResult.error;
      console.log("Supabase upsert user result:", upsertResult);
    } catch (err) {
      console.error("Supabase upsert user exception:", err);
      return NextResponse.json(
        { error: `Supabase upsert user exception: ${err}` },
        { status: 500 }
      );
    }
    if (userError || !dbUser) {
      console.error("Supabase upsert user error:", userError, dbUser);
      return NextResponse.json(
        {
          error: `Failed to upsert user: ${
            userError?.message || userError || "unknown error"
          }`,
        },
        { status: 500 }
      );
    }

    // 3. Add user to workspace
    try {
      const { error: uwError } = await supabaseAdmin
        .from("user_workspaces")
        .upsert({
          user_id: dbUser.id,
          workspace_id: workspaceId,
          role: role || "editor",
        });
      if (uwError) {
        console.error("Supabase user_workspaces error:", uwError);
        return NextResponse.json(
          {
            error: `Failed to add user to workspace: ${
              uwError?.message || uwError || "unknown error"
            }`,
          },
          { status: 500 }
        );
      }
    } catch (err) {
      console.error("Supabase user_workspaces exception:", err);
      return NextResponse.json(
        { error: `Supabase user_workspaces exception: ${err}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: dbUser,
      auth0User,
      isNewUser,
      message: isNewUser
        ? "User invited successfully. They will receive an email to set their password."
        : "User added to workspace successfully. They will receive a notification email.",
    });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
