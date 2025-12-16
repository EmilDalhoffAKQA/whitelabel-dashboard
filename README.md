This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Testing magic links (Auth0)

Two quick ways to start a Passwordless (magic link) flow that work with Classic Universal Login:

1. In-browser widget (recommended)

   - Start the dev server:

     ```bash
     npm run dev
     ```

   - Open the page that loads Auth0's Lock Passwordless widget:

     http://localhost:3001/magic

     Note: Next may pick a different port if 3000 is busy (check the terminal output).

   - Enter your email in the widget, then open the email in the same browser and click the magic link. You should be redirected to `/api/auth/callback` and authenticated.

2. Server-side proxy (useful for testing from Postman or a link)

   - The app exposes a convenience GET endpoint that forwards to Auth0's `/passwordless/start`:

     GET /api/auth/passwordless/start?email=you@example.com

   - This endpoint expects these environment variables to be set (locally or in your deployment):

     - AUTH0_ISSUER_BASE_URL (or AUTH0_DOMAIN)
     - AUTH0_CLIENT_ID
     - AUTH0_CLIENT_SECRET
     - AUTH0_BASE_URL (optional, used to build redirect URI; defaults to http://localhost:3000)

   - Example in the browser or Postman:

     http://localhost:3001/api/auth/passwordless/start?email=you@example.com

   - Important: For Classic magic links, open the email link in the same browser you used to hit the start URL.

---

## Guide til censorer og test-flow

- Gå til `/welcome` for at starte. Herfra bliver du ført til `/onboarding`.
- Du skal bruge en ægte emailadresse for at modtage en mail via Mailjet (Kan ende i spam)
- Auth0 sørger desværre for, at du ikke bliver redirectet automatisk efter login. Hvis du oplever problemer, kan du altid gå direkte til `/login`.
- Dashboardet bruger mock-data til testformål.
- **Superadmin-adgang er deaktiveret** for at beskytte følsomme data. Forskelle mellem roller og Superadmin er beskrevet i rapporten.

Har du spørgsmål, kan du finde flere detaljer i rapporten.

---
