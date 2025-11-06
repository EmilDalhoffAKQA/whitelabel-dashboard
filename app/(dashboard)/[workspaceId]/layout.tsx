import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { Sidebar } from "@/components/ui/dashboard/Sidebar";
import ClientRoot from "@/components/ClientRoot";

async function getWorkspaceData(workspaceId: string, userEmail: string) {
  const { data: userWorkspace } = await supabaseAdmin
    .from("user_workspaces")
    .select("role, users!inner(email), workspace:workspaces(*)")
    .eq("workspace_id", workspaceId)
    .eq("users.email", userEmail)
    .single();

  if (!userWorkspace) {
    return null;
  }

  return {
    workspace: userWorkspace.workspace,
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

  // Extract workspace theme config and provide sensible defaults
  const theme = (data.workspace as any)?.theme_config ?? {
    primaryColor: "#2563eb",
    secondaryColor: "#06b6d4",
    logo: "",
    favicon: "",
  };

  // Set CSS variables so components using var(--primary) etc. pick up the theme
  const cssVars: React.CSSProperties = {
    ["--primary" as any]: theme.primaryColor,
    ["--secondary" as any]: theme.secondaryColor,
  };

  return (
    <div className="flex h-screen" style={cssVars}>
      {/* Wrap in ClientRoot (client-side ThemeProvider) so client components can use useTheme() */}
      <ClientRoot theme={theme}>
        <Sidebar user={user} navItems={filteredNavItems} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </ClientRoot>
    </div>
  );
}
