import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OnboardingLandingPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#F8F8F8" }}
    >
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg border border-gray-200">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Welcome to your dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Set up your workspace in minutes. Start your free onboarding now and
            unlock multi-market, white-label analytics for your brand.
          </p>
        </div>
        <div>
          <Link href="/onboarding">
            <Button variant="black" size="default" className="w-full">
              Start Free Setup
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
