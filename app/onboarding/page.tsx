"use client";

import "@/app/globals.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface OnboardingFormData {
  companyName: string;
  adminName: string;
  adminEmail: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  markets: Array<{
    countryCode: string;
    name: string;
    languageCode: string;
  }>;
}

const AVAILABLE_MARKETS = [
  { countryCode: "DK", name: "Denmark", languageCode: "da" },
  { countryCode: "SE", name: "Sweden", languageCode: "sv" },
  { countryCode: "NO", name: "Norway", languageCode: "no" },
  { countryCode: "FI", name: "Finland", languageCode: "fi" },
  { countryCode: "DE", name: "Germany", languageCode: "de" },
  { countryCode: "FR", name: "France", languageCode: "fr" },
  { countryCode: "ES", name: "Spain", languageCode: "es" },
  { countryCode: "IT", name: "Italy", languageCode: "it" },
  { countryCode: "GB", name: "United Kingdom", languageCode: "en" },
  { countryCode: "NL", name: "Netherlands", languageCode: "nl" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<OnboardingFormData>({
    companyName: "",
    adminName: "",
    adminEmail: "",
    primaryColor: "#2563eb",
    secondaryColor: "#8b5cf6",
    markets: [],
  });

  const updateFormData = (field: keyof OnboardingFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleMarket = (market: (typeof AVAILABLE_MARKETS)[0]) => {
    setFormData((prev) => ({
      ...prev,
      markets: prev.markets.some((m) => m.countryCode === market.countryCode)
        ? prev.markets.filter((m) => m.countryCode !== market.countryCode)
        : [...prev.markets, market],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/workspace/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create workspace");
      }

      const { workspace } = await response.json();

      // Redirect to the new workspace
      router.push(`/${workspace.id}/dashboard?onboarding=complete`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 =
    formData.companyName && formData.adminName && formData.adminEmail;
  const canProceedStep3 = formData.markets.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-3xl">Welcome to Your Dashboard</CardTitle>
          <CardDescription>
            Let's set up your workspace in just a few steps (Step {step} of 3)
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Step 1: Company Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Company Information</h3>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Company Name
                </label>
                <Input
                  value={formData.companyName}
                  onChange={(e) =>
                    updateFormData("companyName", e.target.value)
                  }
                  placeholder="e.g., Nestlé Nordic"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Admin Name
                </label>
                <Input
                  value={formData.adminName}
                  onChange={(e) => updateFormData("adminName", e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Admin Email
                </label>
                <Input
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => updateFormData("adminEmail", e.target.value)}
                  placeholder="admin@company.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You'll receive an invitation to set your password
                </p>
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="w-full"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: Branding */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Customize Your Branding</h3>
              <p className="text-sm text-gray-600">
                Set your brand colors to personalize the dashboard experience
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Primary Color
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) =>
                        updateFormData("primaryColor", e.target.value)
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) =>
                        updateFormData("primaryColor", e.target.value)
                      }
                      placeholder="#2563eb"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Secondary Color
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) =>
                        updateFormData("secondaryColor", e.target.value)
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      value={formData.secondaryColor}
                      onChange={(e) =>
                        updateFormData("secondaryColor", e.target.value)
                      }
                      placeholder="#8b5cf6"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div
                className="border rounded-lg p-6"
                style={{ backgroundColor: formData.primaryColor + "10" }}
              >
                <h4
                  className="font-semibold mb-4"
                  style={{ color: formData.primaryColor }}
                >
                  Preview - {formData.companyName || "Your Company"}
                </h4>
                <div className="flex gap-2">
                  <Button style={{ backgroundColor: formData.primaryColor }}>
                    Primary Action
                  </Button>
                  <Button
                    variant="outline"
                    style={{
                      borderColor: formData.secondaryColor,
                      color: formData.secondaryColor,
                    }}
                  >
                    Secondary Action
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Markets */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Select Your Markets
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Choose which markets this workspace will support. You can add
                  more later.
                </p>

                <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                  {AVAILABLE_MARKETS.map((market) => (
                    <label
                      key={market.countryCode}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.markets.some(
                          (m) => m.countryCode === market.countryCode
                        )
                          ? "bg-blue-50 border-blue-300"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.markets.some(
                          (m) => m.countryCode === market.countryCode
                        )}
                        onChange={() => toggleMarket(market)}
                        className="w-4 h-4"
                      />
                      <div>
                        <div className="font-medium">{market.name}</div>
                        <div className="text-xs text-gray-500">
                          {market.countryCode} • {market.languageCode}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {formData.markets.length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✓ {formData.markets.length} market
                      {formData.markets.length !== 1 ? "s" : ""} selected
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1"
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1"
                  disabled={!canProceedStep3 || loading}
                >
                  {loading ? "Creating..." : "Create Workspace"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
