import mailjet from "node-mailjet";

const mailjetClient = mailjet.apiConnect(
  process.env.MAILJET_API_KEY!,
  process.env.MAILJET_API_SECRET!
);

export async function sendInviteEmail({
  to,
  name,
  inviteLink,
}: {
  to: string;
  name: string;
  inviteLink: string;
}) {
  const result = await mailjetClient.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: process.env.MAILJET_FROM_EMAIL!,
          Name: "Your Company",
        },
        To: [
          {
            Email: to,
            Name: name || to,
          },
        ],
        Subject: "You are invited! Set your password",
        TextPart: `Hi ${
          name || ""
        },\n\nYou have been invited. Set your password here: ${inviteLink}`,
        HTMLPart: `<h3>Hi ${
          name || ""
        },</h3><p>You have been invited. <a href="${inviteLink}">Set your password here</a>.</p>`,
      },
    ],
  });
  return result.body;
}
