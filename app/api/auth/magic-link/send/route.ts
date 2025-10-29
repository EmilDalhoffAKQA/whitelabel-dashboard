import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceByIdentifier } from "@/lib/workspace";
import {
  getUserByEmail,
  createPasswordlessUser,
  isUserInOrganization,
  addUserToOrganization,
} from "@/lib/auth0-management";

export async function POST(req: NextRequest) {
  try {
    const { email, workspace } = await req.json();

    if (!email || !workspace) {
      return NextResponse.json(
        { error: "Email and workspace are required" },
        { status: 400 }
      );
    }

    const workspaceData = await getWorkspaceByIdentifier(workspace);
    const organizationId = workspaceData.auth0_org_id;

    let user = null;
    try {
      user = await getUserByEmail(email);
    } catch (err) {
      // User not found, proceed to create
    }
    if (!user) {
      user = await createPasswordlessUser(email);
    }

    const isMember = await isUserInOrganization(user.user_id, organizationId);

    if (!isMember) {
      const response = await addUserToOrganization(
        user.user_id,
        organizationId
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("Failed to add user to organization:", error);
        throw new Error(error.message || "Failed to add user to organization");
      }

      // If the response is 204 No Content, do not try to parse JSON
      if (response.status === 204) {
        return null;
      }
      return await response.json();
    }

    const callbackUrl = `${process.env.NEXTAUTH_URL}/api/auth/callback?workspace=${workspace}`;

    const response = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/passwordless/start`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
          connection: "email",
          email: email,
          send: "link",
          authParams: {
            scope: "openid profile email",
            redirect_uri: callbackUrl,
            response_type: "code",
            organization: organizationId,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Auth0 passwordless/start error:", error);
      return NextResponse.json(
        { error: error.error_description || "Failed to send magic link" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Magic link sent! Check your email.",
    });
  } catch (error: any) {
    console.error("Send magic link error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send magic link" },
      { status: 500 }
    );
  }
}
