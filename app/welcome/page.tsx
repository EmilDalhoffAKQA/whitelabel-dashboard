export default function OnboardingLandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-xl shadow-lg p-10 max-w-lg w-full text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to Whitelabel Dashboard
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Set up your workspace in minutes. Start your free onboarding now and
          unlock multi-market, white-label analytics for your brand.
        </p>
        <a
          href="/onboarding"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
        >
          Start Free Setup
        </a>
      </div>
    </div>
  );
}
