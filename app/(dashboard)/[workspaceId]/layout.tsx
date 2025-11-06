import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { AppSidebar } from "@/components/ui/dashboard/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

async function getWorkspaceData(workspaceId: string, userEmail: string) {
  // First get the user_workspace relationship
  const { data: userWorkspace, error: uwError } = await supabaseAdmin
    .from("user_workspaces")
    .select("role, workspace_id")
    .eq("workspace_id", workspaceId)
    .eq(
      "user_id",
      (
        await supabaseAdmin
          .from("users")
          .select("id")
          .eq("email", userEmail)
          .single()
      ).data?.id
    )
    .single();

  if (uwError || !userWorkspace) {
    console.error("User workspace error:", uwError);
    return null;
  }

  // Then get the full workspace data separately
  const { data: workspace, error: wsError } = await supabaseAdmin
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .single();

  if (wsError || !workspace) {
    console.error("Workspace error:", wsError);
    return null;
  }

  console.log("Workspace data:", workspace);
  console.log("Theme config:", workspace.theme_config);

  return {
    workspace,
    role: userWorkspace.role,
  };
}

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const cookieStore = await cookies();
  const userInfoCookie = cookieStore.get("user_info");

  if (!userInfoCookie) {
    redirect("/login");
  }

  const userInfo = JSON.parse(userInfoCookie.value);
  const data = await getWorkspaceData(workspaceId, userInfo.email);

  if (!data) {
    redirect("/workspaces");
  }

  // Build user and navItems for Sidebar
  const user = {
    name: userInfo.name || userInfo.email,
    avatarUrl: userInfo.picture || undefined,
  };

  // Define nav items with allowed roles
  const navItems = [
    {
      href: `/${workspaceId}/dashboard`,
      label: "Dashboard",
      roles: ["admin", "editor"],
    },
    {
      href: `/${workspaceId}/markets`,
      label: "Markets",
      roles: ["admin", "editor"],
    },
    {
      href: `/${workspaceId}/settings/admin`,
      label: "Users",
      roles: ["admin"],
    },
    {
      href: `/${workspaceId}/settings/admin/invite-user`,
      label: "Invite User",
      roles: ["admin"],
    },
    { href: `/${workspaceId}/settings`, label: "Settings", roles: ["admin"] },
  ];

  // Only show nav items allowed for the user's role
  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(data.role)
  );

  // Extract workspace theme config with proper typing
  const themeConfig = data.workspace.theme_config;
  const theme = {
    primaryColor: themeConfig?.primaryColor || "#2563eb",
    secondaryColor: themeConfig?.secondaryColor || "#06b6d4",
    logo: themeConfig?.logo || data.workspace.logo_url || "",
    favicon: themeConfig?.favicon || "",
  };

  console.log("Applied theme:", theme);

  return (
    <SidebarProvider>
      <div className="flex w-full h-screen bg-gray-50/30">
        <AppSidebar
          user={user}
          navItems={filteredNavItems}
          primaryColor={theme.primaryColor}
          logo={theme.logo}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <SidebarTrigger className="mb-4" />
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
