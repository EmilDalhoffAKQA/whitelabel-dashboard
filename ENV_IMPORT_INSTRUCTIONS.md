How to import environment variables (Vercel and local)

This file shows two simple ways to apply the variables in `.env.import` to your environments.

1) Quick manual (recommended for Vercel UI)
- Open Vercel → Project → Settings → Environment Variables.
- For each line in `.env.import`, click "Add" and paste the NAME and VALUE.
  - For `AUTH0_CLIENT_SECRET` and `AUTH0_SECRET` mark the variable as a secret/private value.
  - Choose the Environment scope: Preview (for preview URL), Production (for production URL), or All.
- After adding variables, redeploy the project (Redeploy deployment or push an empty commit).

2) Local development
- Copy `.env.import` to `.env.local` and replace placeholders with real values.
  cp .env.import .env.local
  # Edit .env.local and fill the secret values
- Restart the dev server:
  npm run dev

3) Optional: use Vercel CLI to set a variable (advanced)
- Install/vercel login and run (example):
  vercel env add AUTH0_CLIENT_SECRET production
  # Then paste the secret value when prompted
- Repeat for each variable. This is interactive but keeps secrets in Vercel.

4) Debug flow
- Temporarily set DEBUG_AUTH0=1 for Preview to make the API return which keys are missing (useful when troubleshooting missing env values).
- Remove DEBUG_AUTH0 after debugging.

Security notes
- Never commit files containing real secrets to git. Keep `.env.local` in `.gitignore`.
- Use Vercel's secret/preview/prod scopes correctly so secrets are not exposed to client builds.

If you want I can also:
- Add a small script to apply these values via the Vercel CLI (requires you to be logged into Vercel locally).
- Or commit the server-side `/api/auth/passwordless/verify` endpoint so you can test OTP exchange without exposing client_secret.
