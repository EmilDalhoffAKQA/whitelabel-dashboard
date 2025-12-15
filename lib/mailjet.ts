import mailjet from "node-mailjet";

let mailjetClient: ReturnType<typeof mailjet.apiConnect> | null = null;

function getMailjetClient() {
  if (!mailjetClient) {
    if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_API_SECRET) {
      throw new Error("Mailjet API credentials are not configured");
    }
    mailjetClient = mailjet.apiConnect(
      process.env.MAILJET_API_KEY,
      process.env.MAILJET_API_SECRET
    );
  }
  return mailjetClient;
}

export async function sendInviteEmail({
  to,
  name,
  inviteLink,
  workspaceName,
}: {
  to: string;
  name: string;
  inviteLink: string;
  workspaceName?: string;
}) {
  const client = getMailjetClient();
  const companyName = workspaceName || "Your Company";

  const result = await client.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: process.env.MAILJET_FROM_EMAIL!,
          Name: companyName,
        },
        To: [
          {
            Email: to,
            Name: name || to,
          },
        ],
        Subject: `Welcome to ${companyName}! Set your password`,
        TextPart: `Hi ${
          name || ""
        },\n\nWelcome to ${companyName}! Click the link below to set your password and get started:\n\n${inviteLink}\n\nThis link will expire in 7 days.`,
        HTMLPart: `
          <h2>Welcome to ${companyName}!</h2>
          <p>Hi ${name || "there"},</p>
          <p>Your account has been created. Click the button below to set your password and access your dashboard.</p>
          <p style="margin: 30px 0;">
            <a href="${inviteLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Set Your Password</a>
          </p>
          <p style="color: #666; font-size: 14px;">This link will expire in 7 days.</p>
          <p style="color: #666; font-size: 14px;">If you didn't expect this email, you can safely ignore it.</p>
        `,
      },
    ],
  });
  return result.body;
}

export async function sendExistingUserInviteEmail({
  to,
  name,
  workspaceName,
  loginUrl,
}: {
  to: string;
  name: string;
  workspaceName: string;
  loginUrl?: string;
}) {
  const client = getMailjetClient();
  const login =
    loginUrl || process.env.NEXTAUTH_URL || "http://localhost:3000/login";

  const result = await client.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: process.env.MAILJET_FROM_EMAIL!,
          Name: workspaceName,
        },
        To: [
          {
            Email: to,
            Name: name || to,
          },
        ],
        Subject: `You've been added to ${workspaceName}`,
        TextPart: `Hi ${
          name || ""
        },\n\nYou've been added to ${workspaceName}.\n\nLog in with your existing credentials at: ${login}\n\nOnce logged in, you'll see ${workspaceName} in your workspace list.`,
        HTMLPart: `
          <h2>You've been added to ${workspaceName}</h2>
          <p>Hi ${name || "there"},</p>
          <p>Good news! You've been given access to <strong>${workspaceName}</strong>.</p>
          <p>Since you already have an account, simply log in with your existing credentials to access the new workspace.</p>
          <p style="margin: 30px 0;">
            <a href="${login}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Go to Login</a>
          </p>
          <p style="color: #666; font-size: 14px;">After logging in, you'll find ${workspaceName} in your workspace list.</p>
        `,
      },
    ],
  });
  return result.body;
}
