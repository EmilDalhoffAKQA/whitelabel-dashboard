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
        Subject: `You are invited to ${companyName}! Set your password`,
        TextPart: `Hi ${
          name || ""
        },\n\nYou have been invited to ${companyName}. Set your password here: ${inviteLink}`,
        HTMLPart: `<h3>Hi ${
          name || ""
        },</h3><p>You have been invited to ${companyName}. <a href="${inviteLink}">Set your password here</a>.</p>`,
      },
    ],
  });
  return result.body;
}
