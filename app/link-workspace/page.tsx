"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LinkWorkspacePage() {
  const [email, setEmail] = useState("emil.dalhoff@akqa.com");
  const [workspaceId, setWorkspaceId] = useState("31");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleLink = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/user/link-workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          workspaceId: parseInt(workspaceId),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(`✅ Success! ${data.message}`);
      } else {
        setResult(`❌ Error: ${data.error}`);
      }
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Link User to Workspace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Workspace ID
            </label>
            <Input
              type="number"
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              placeholder="31"
            />
            <p className="text-xs text-gray-500 mt-1">
              Nestlé workspace ID is 31
            </p>
          </div>

          <Button onClick={handleLink} disabled={loading} className="w-full">
            {loading ? "Linking..." : "Link to Workspace"}
          </Button>

          {result && (
            <div
              className={`p-3 rounded ${
                result.startsWith("✅")
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {result}
            </div>
          )}

          <div className="text-xs text-gray-500 mt-4">
            <p>
              <strong>Current setup:</strong>
            </p>
            <p>• User ID 79: emil.dalhoff@akqa.com</p>
            <p>• Workspace ID 20: McDonalds</p>
            <p>• Workspace ID 31: Nestlé</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
