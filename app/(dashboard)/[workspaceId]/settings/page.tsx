"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ColorPicker } from "@/components/ui/color-picker";
import { supabase } from "@/lib/supabase";

interface ThemeFormData {
  logoUrl: string;
  primaryColor: string;
  pageBackgroundColor: string;
}

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params?.workspaceId as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [formData, setFormData] = useState<ThemeFormData>({
    logoUrl: "",
    primaryColor: "#63513D",
    pageBackgroundColor: "#F8F8F8",
  });

  useEffect(() => {
    loadWorkspace();
  }, [workspaceId]);

  const loadWorkspace = async () => {
    try {
      const { data: workspace, error: workspaceError } = await supabase
        .from("workspaces")
        .select("*")
        .eq("id", workspaceId)
        .single();

      if (workspaceError || !workspace) {
        console.error("Workspace error:", workspaceError);
        return;
      }

      setWorkspaceName(workspace.name);

      // Load existing theme config
      if (workspace.theme_config) {
        setFormData({
          logoUrl: workspace.theme_config.logo || workspace.logo_url || "",
          primaryColor: workspace.theme_config.primaryColor || "#63513D",
          pageBackgroundColor:
            workspace.theme_config.pageBackgroundColor || "#F8F8F8",
        });
      } else if (workspace.logo_url) {
        setFormData((prev) => ({ ...prev, logoUrl: workspace.logo_url }));
      }
    } catch (error) {
      console.error("Error loading workspace:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof ThemeFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Update workspace theme in Supabase
      const { error: updateError } = await supabase
        .from("workspaces")
        .update({
          logo_url: formData.logoUrl || null,
          theme_config: {
            primaryColor: formData.primaryColor,
            pageBackgroundColor: formData.pageBackgroundColor,
            logo: formData.logoUrl || "",
            favicon: formData.logoUrl || "",
          },
        })
        .eq("id", workspaceId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setSuccess(true);

      // Refresh the page to apply new theme
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to save theme");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Customize your workspace branding and appearance
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
          Theme saved successfully! Refreshing to apply changes...
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Theme Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <Card>
          <CardHeader>
            <CardTitle>Workspace Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Organization Logo
              </label>
              <div className="border border-gray-200 rounded-lg p-6 text-center">
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
                onChange={(e) => updateFormData("logoUrl", e.target.value)}
                placeholder="https://example.com/logo.png"
                className="mt-2 border border-gray-300"
              />
              <p className="text-xs text-gray-500 mt-2">
                If set, this is the logo that will be displayed to end-users for
                this organization in any interaction with them.
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
              onChange={(color) => updateFormData("pageBackgroundColor", color)}
              label="Page Background Color"
              description="If set, this will be the page background color that will be displayed to end-users for this organization in your application's authentication flows."
            />

            <Button
              onClick={handleSave}
              className="w-full text-white"
              style={{ backgroundColor: formData.primaryColor }}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Right: Preview */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
