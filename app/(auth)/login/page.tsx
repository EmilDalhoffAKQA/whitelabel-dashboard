"use client";

import { Suspense } from "react";

function LoginPageInner() {
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const baseUrl =
      process.env.NEXT_PUBLIC_NEXTAUTH_URL || window.location.origin;
    const params = new URLSearchParams({
      client_id:
        process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID ||
        "ev0QQqC5UH9gZXLQslLRaWAEHX0qJRxE",
      response_type: "code",
      scope: "openid profile email",
      redirect_uri: `${baseUrl}/api/auth/callback`,
    });
    window.location.href = `https://${
      process.env.NEXT_PUBLIC_AUTH0_DOMAIN ||
      "dev-5pkmczfntibnqqfu.us.auth0.com"
    }/authorize?${params.toString()}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Sign in to Dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in with your email and password to access your workspaces.
          </p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <button
            type="submit"
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
          >
            Continue with Email & Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageInner />
    </Suspense>
  );
}
