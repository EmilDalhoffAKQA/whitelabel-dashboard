export async function getUserByEmail(email: string) {
  const token = await getManagementApiToken();

  // Normalize email to lowercase for consistent Auth0 lookup
  const normalizedEmail = email.toLowerCase();

  const response = await fetch(
    `https://${
      process.env.AUTH0_DOMAIN
    }/api/v2/users-by-email?email=${encodeURIComponent(normalizedEmail)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.message || errorData.error || `HTTP ${response.status}`;
    console.error(
      `Failed to get user by email ${normalizedEmail}:`,
      errorMessage
    );
    throw new Error(`Failed to get user: ${errorMessage}`);
  }

  const users = await response.json();
  console.log(`Found ${users.length} user(s) with email ${normalizedEmail}`);
  return users[0] || null;
}
interface ManagementApiToken {
  access_token: string;
  expires_at: number;
}

let cachedToken: ManagementApiToken | null = null;

export async function getManagementApiToken(): Promise<string> {
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

export async function createAuth0User(
  email: string,
  name: string,
  password: string
) {
  const token = await getManagementApiToken();

  // Normalize email to lowercase for consistent Auth0 storage
  const normalizedEmail = email.toLowerCase();

  const response = await fetch(
    `https://${process.env.AUTH0_DOMAIN}/api/v2/users`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: normalizedEmail,
        name,
        password,
        connection: "Username-Password-Authentication",
        email_verified: false,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    // Auth0 returns error in different formats: { message: "..." } or { error: "...", error_description: "..." }
    const errorMessage =
      error.message ||
      error.error_description ||
      error.error ||
      "Failed to create user";
    const err: any = new Error(errorMessage);
    err.statusCode = error.statusCode || response.status;
    err.originalError = error;
    throw err;
  }

  return await response.json();
}

export async function generatePasswordResetTicket(userId: string) {
  const token = await getManagementApiToken();

  // Construct the full login URL for redirect after password change
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resultUrl = `${baseUrl}/login`;

  const response = await fetch(
    `https://${process.env.AUTH0_DOMAIN}/api/v2/tickets/password-change`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        result_url: resultUrl,
        ttl_sec: 604800,
        mark_email_as_verified: true,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to generate reset ticket");
  }

  return await response.json();
}
