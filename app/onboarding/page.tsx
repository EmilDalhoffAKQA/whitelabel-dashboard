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
import { ColorPicker } from "@/components/ui/color-picker";
import { toast } from "sonner";

interface OnboardingFormData {
  companyName: string;
  adminName: string;
  adminEmail: string;
  primaryColor: string;
  pageBackgroundColor: string;
  logoUrl: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<OnboardingFormData>({
    companyName: "",
    adminName: "",
    adminEmail: "",
    primaryColor: "#63513D",
    pageBackgroundColor: "#F8F8F8",
    logoUrl: "",
  });

  const updateFormData = (field: keyof OnboardingFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Prepare data for API - ensure all required fields are present
      const submitData = {
        ...formData,
        logoUrl: formData.logoUrl || undefined, // Convert empty string to undefined
      };

      const response = await fetch("/api/workspace/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create workspace");
      }

      const { workspace } = await response.json();

      // Show success message and redirect to login
      toast.success("Workspace created successfully!", {
        description: `Please check your email (${formData.adminEmail}) to set your password and log in.`,
        duration: 5000,
      });
      router.push(`/login`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 =
    formData.companyName && formData.adminName && formData.adminEmail;
  const canProceedStep2 = formData.logoUrl && formData.primaryColor;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl border-gray-200">
        <CardHeader>
          <CardTitle className="text-3xl">Welcome to Your Dashboard</CardTitle>
          <CardDescription>
            Let's set up your workspace in just a few steps (Step {step} of 2)
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
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-semibold mb-2">
                  Company Information
                </h3>
                <p className="text-sm text-gray-600">
                  Let's start with your basic company details.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Company Name
                  </label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) =>
                      updateFormData("companyName", e.target.value)
                    }
                    placeholder="e.g., Nestlé Nordic"
                    className="border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Admin Name
                  </label>
                  <Input
                    value={formData.adminName}
                    onChange={(e) =>
                      updateFormData("adminName", e.target.value)
                    }
                    placeholder="Your full name"
                    className="border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Admin Email
                  </label>
                  <Input
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) =>
                      updateFormData("adminEmail", e.target.value)
                    }
                    placeholder="admin@company.com"
                    className="border-gray-300"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    You'll receive an invitation to set your password
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                variant="blue"
                className="w-full"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: Branding */}
          {step === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold mb-2">Branding</h3>
                  <p className="text-sm text-gray-600">
                    These are branding settings associated with your
                    organization.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Organization Logo
                    </label>
                    <div className="border-1 border-gray-200 rounded-lg p-6 text-center">
                      {formData.logoUrl ? (
                        <div className="space-y-3">
                          <img
                            src={formData.logoUrl}
                            alt="Logo preview"
                            className="max-h-24 mx-auto"
                          />
                          <div className="flex items-center gap-2 text-sm text-gray-600 justify-center">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                              />
                            </svg>
                            <span className="truncate max-w-xs">
                              {formData.logoUrl}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-400">No logo uploaded</div>
                      )}
                    </div>
                    <Input
                      type="url"
                      value={formData.logoUrl}
                      onChange={(e) =>
                        updateFormData("logoUrl", e.target.value)
                      }
                      placeholder="https://example.com/logo.png"
                      className="mt-2 border border-gray-300"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      If set, this is the logo that will be displayed to
                      end-users for this organization in any interaction with
                      them.
                    </p>
                  </div>

                  <ColorPicker
                    color={formData.primaryColor}
                    onChange={(color) => updateFormData("primaryColor", color)}
                    label="Primary Color"
                    description="If set, this will be the primary color for CTAs that will be displayed to end-users for this organization in your application's authentication flows."
                  />

                  <ColorPicker
                    color={formData.pageBackgroundColor}
                    onChange={(color) =>
                      updateFormData("pageBackgroundColor", color)
                    }
                    label="Page Background Color"
                    description="If set, this will be the page background color that will be displayed to end-users for this organization in your application's authentication flows."
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="dashboard"
                    onClick={() => setStep(1)}
                    className="flex-1"
                    disabled={loading}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="flex-1 text-white"
                    style={{
                      backgroundColor: formData.primaryColor,
                    }}
                    disabled={!canProceedStep2 || loading}
                  >
                    {loading ? "Creating..." : "Create Workspace"}
                  </Button>
                </div>
              </div>

              {/* Preview Panel */}
              <div className="hidden lg:block">
                <div className="sticky top-6">
                  <div
                    className="rounded-lg shadow-lg overflow-hidden"
                    style={{ backgroundColor: formData.pageBackgroundColor }}
                  >
                    <div className="bg-white p-8 mx-8 mt-8 rounded-lg shadow-sm">
                      {formData.logoUrl ? (
                        <img
                          src={formData.logoUrl}
                          alt="Logo"
                          className="h-12 mb-8 mx-auto"
                        />
                      ) : (
                        <div className="h-12 mb-8 bg-gray-200 rounded w-32 mx-auto" />
                      )}

                      <div className="space-y-4">
                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-full" />
                        <div className="h-3 bg-gray-200 rounded w-5/6" />
                      </div>

                      <div className="mt-8">
                        <div
                          className="h-12 rounded-lg flex items-center justify-center text-white font-medium"
                          style={{ backgroundColor: formData.primaryColor }}
                        >
                          Primary Button
                        </div>
                      </div>
                    </div>

                    <p className="text-center text-sm text-gray-600 py-6">
                      Mock UI Preview
                    </p>
                    <p className="text-center text-xs text-gray-500 pb-6 px-4">
                      For organization branding representation only,
                      <br />
                      any other customization will not be visible.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
