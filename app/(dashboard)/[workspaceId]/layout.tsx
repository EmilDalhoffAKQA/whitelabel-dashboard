// app/(dashboard)/[workspaceId]/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { AppSidebar } from "@/components/ui/dashboard/Sidebar";

async function getWorkspaceData(workspaceId: string, userEmail: string) {
  if (!supabaseAdmin) {
    console.error("Supabase admin client not available");
    return null;
  }

  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", userEmail)
    .single();

  if (userError || !user) {
    console.error("User fetch error:", userError);
    return null;
  }

  const { data: userWorkspace, error: uwError } = await supabaseAdmin
    .from("user_workspaces")
    .select("role, workspace_id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .single();

  if (uwError || !userWorkspace) {
    console.error("User workspace error:", uwError);
    return null;
  }

  const { data: workspace, error: wsError } = await supabaseAdmin
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .single();

  if (wsError || !workspace) {
    console.error("Workspace error:", wsError);
    return null;
  }

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
  const sidebarStateCookie = cookieStore.get("sidebar_state");

  if (!userInfoCookie) {
    redirect("/login");
  }

  const userInfo = JSON.parse(userInfoCookie.value);
  const data = await getWorkspaceData(workspaceId, userInfo.email);

  if (!data) {
    redirect("/workspaces");
  }

  const sidebarOpen = sidebarStateCookie
    ? sidebarStateCookie.value === "true"
    : false;

  const user = {
    name: userInfo.name || userInfo.email,
    avatarUrl: userInfo.picture || undefined,
  };

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
      href: `/${workspaceId}/users`,
      label: "Users",
      roles: ["admin"],
    },
    {
      href: `/${workspaceId}/settings`,
      label: "Settings",
      roles: ["admin"],
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(data.role)
  );

  const themeConfig = data.workspace.theme_config;
  const theme = {
    primaryColor: themeConfig?.primaryColor || "#2563eb",
    pageBackgroundColor: themeConfig?.pageBackgroundColor || "#F9FAFB",
    logo: themeConfig?.logo || data.workspace.logo_url || "",
    favicon:
      themeConfig?.favicon ||
      themeConfig?.logo ||
      data.workspace.logo_url ||
      "",
  };

  return (
    <>
      {theme.favicon && (
        <head>
          <link rel="icon" href={theme.favicon} type="image/x-icon" />
          <link rel="shortcut icon" href={theme.favicon} type="image/x-icon" />
          <link rel="apple-touch-icon" href={theme.favicon} />
        </head>
      )}

      <div
        className="flex w-full min-h-screen md:h-screen gap-0 md:gap-4 p-0 md:p-4"
        style={{ backgroundColor: theme.pageBackgroundColor }}
      >
        {/* Sidebar - Hidden on mobile, shown on tablet+ */}
        <div className="hidden md:block flex-shrink-0">
          <AppSidebar
            user={user}
            navItems={filteredNavItems}
            primaryColor={theme.primaryColor}
            logo={theme.logo}
          />
        </div>

        {/* Mobile Sidebar - Sheet overlay */}
        <div className="md:hidden">
          <AppSidebar
            user={user}
            navItems={filteredNavItems}
            primaryColor={theme.primaryColor}
            logo={theme.logo}
          />
        </div>

        {/* Main Content - Full width on mobile, flex-1 on desktop */}
        <main className="flex-1 w-full overflow-y-auto px-4 py-6 md:px-0 md:py-0">
          {children}
        </main>
      </div>
    </>
  );
}
