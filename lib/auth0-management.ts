interface ManagementApiToken {
  access_token: string;
  expires_at: number;
}

let cachedToken: ManagementApiToken | null = null;

async function getManagementApiToken(): Promise<string> {
  if (cachedToken && cachedToken.expires_at > Date.now()) {
    return cachedToken.access_token;
  }

  const response = await fetch(
    `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.AUTH0_MGMT_CLIENT_ID,
        client_secret: process.env.AUTH0_MGMT_CLIENT_SECRET,
        audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
        grant_type: "client_credentials",
      }),
    }
  );

  const data = await response.json();

  cachedToken = {
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000 - 60000,
  };

  return cachedToken.access_token;
}

export async function getUserByEmail(email: string) {
  const token = await getManagementApiToken();

  console.log("🔍 Looking up user:", email);

  const response = await fetch(
    `https://${
      process.env.AUTH0_DOMAIN
    }/api/v2/users-by-email?email=${encodeURIComponent(email)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get user");
  }

  const users = await response.json();
  return users[0] || null;
}

export async function createPasswordlessUser(email: string) {
  const token = await getManagementApiToken();

  const response = await fetch(
    `https://${process.env.AUTH0_DOMAIN}/api/v2/users`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        connection: "email",
        email_verified: false,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("Failed to create user:", error);
    throw new Error(error.message || "Failed to create user");
  }

  return await response.json();
}

export async function isUserInOrganization(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const token = await getManagementApiToken();

  const response = await fetch(
    `https://${process.env.AUTH0_DOMAIN}/api/v2/organizations/${organizationId}/members?fields=user_id&include_fields=true`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    return false;
  }

  const members = await response.json();
  return members.some((m: any) => m.user_id === userId);
}

export async function addUserToOrganization(
  userId: string,
  organizationId: string
) {
  const token = await getManagementApiToken();

  const response = await fetch(
    `https://${process.env.AUTH0_DOMAIN}/api/v2/organizations/${organizationId}/members`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        members: [userId],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("Failed to add user to organization:", error);
    throw new Error(error.message || "Failed to add user to organization");
  }

  return await response.json();
}
