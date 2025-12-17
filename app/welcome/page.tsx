import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OnboardingLandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f8f8] p-4 sm:p-6 md:p-8">
      <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 md:p-12 max-w-2xl w-full text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6">
          Welcome to your dashboard
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto mb-6 sm:mb-8">
          Set up your workspace in minutes. Start your free onboarding now and
          unlock multi-market, white-label analytics for your brand.
        </p>
        <div className="pt-2">
          <Link href="/onboarding">
            <Button variant="black" size="lg" className="w-full sm:w-auto px-8">
              Start Free Setup
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
