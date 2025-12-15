// components/ui/dashboard/Sidebar.tsx
"use client";
import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Home,
  UserRoundPlus,
  Brush,
  Cog,
  Earth,
  Menu,
  X,
  LogOut,
  MessageSquare,
  ChevronDown,
  Check,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/lib/supabase";

type NavItem = {
  href: string;
  label: string;
};

type User = {
  name: string;
  avatarUrl?: string;
};

type Workspace = {
  id: number;
  name: string;
  logo_url?: string;
};

type AppSidebarProps = {
  user: User;
  navItems: NavItem[];
  primaryColor?: string;
  logo?: string;
  currentWorkspaceId: string;
  currentWorkspaceName: string;
};

const iconMap: Record<string, any> = {
  Dashboard: Home,
  Markets: Earth,
  Users: UserRoundPlus,
  Settings: Brush,
  Chat: MessageSquare,
  "Chat Simulator": MessageSquare,
};

export function AppSidebar({
  user,
  navItems,
  primaryColor = "#2563eb",
  logo,
  currentWorkspaceId,
  currentWorkspaceName,
}: AppSidebarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);
  const [loadingWorkspaces, setLoadingWorkspaces] = React.useState(false);

  // Fetch user's workspaces
  React.useEffect(() => {
    const fetchWorkspaces = async () => {
      setLoadingWorkspaces(true);
      try {
        const response = await fetch("/api/workspaces");
        if (response.ok) {
          const data = await response.json();
          setWorkspaces(data.workspaces || []);
        }
      } catch (error) {
        console.error("Error fetching workspaces:", error);
      } finally {
        setLoadingWorkspaces(false);
      }
    };

    fetchWorkspaces();
  }, []);

  const SidebarContent = () => (
    <TooltipProvider delayDuration={300}>
      <div className="pb-6 md:pb-8 flex-shrink-0 relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative group cursor-pointer focus:outline-none w-full">
              {logo ? (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-white flex items-center justify-center mx-auto transition-all duration-200 group-hover:rounded-2xl border-2 border-transparent group-hover:border-gray-200">
                  <img
                    src={logo}
                    alt="Logo"
                    className="w-12 h-12 md:w-16 md:h-16 object-contain"
                  />
                </div>
              ) : (
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-3xl flex items-center justify-center mx-auto transition-all duration-200 group-hover:rounded-2xl"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="text-white font-bold text-xl md:text-2xl">
                    {currentWorkspaceName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="right"
            align="start"
            className="w-80 bg-white border border-gray-200 shadow-xl rounded-xl p-2"
            sideOffset={12}
          >
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Workspaces
              </p>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-1">
              {workspaces.map((workspace) => {
                const isActive = workspace.id.toString() === currentWorkspaceId;
                return (
                  <DropdownMenuItem
                    key={workspace.id}
                    onClick={() => {
                      if (!isActive) {
                        window.location.href = `/${workspace.id}/dashboard`;
                      }
                    }}
                    className={`rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${
                      isActive ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      {workspace.logo_url ? (
                        <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                          <img
                            src={workspace.logo_url}
                            alt={workspace.name}
                            className="w-7 h-7 object-contain"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: isActive
                              ? primaryColor
                              : "#e5e7eb",
                          }}
                        >
                          <span
                            className={`font-semibold text-sm ${
                              isActive ? "text-white" : "text-gray-600"
                            }`}
                          >
                            {workspace.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium text-sm truncate ${
                            isActive ? "text-gray-900" : "text-gray-700"
                          }`}
                        >
                          {workspace.name}
                        </p>
                      </div>
                      {isActive && (
                        <Check
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: primaryColor }}
                        />
                      )}
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </div>
            <DropdownMenuSeparator className="my-2 bg-gray-200" />
            <DropdownMenuItem
              onClick={() => {
                window.location.href = "/workspaces";
              }}
              className="rounded-lg px-3 py-2.5 cursor-pointer hover:bg-gray-50"
            >
              <span className="text-gray-700 font-medium text-sm">
                View all workspaces →
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="space-y-3 md:space-y-4 flex flex-col items-center py-4">
          {navItems.map((item) => {
            const Icon = iconMap[item.label] || Home;
            const isActive = pathname === item.href;

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <a
                    href={item.href}
                    onClick={() => isMobile && setOpen(false)}
                    className={`w-12 h-12 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all ${
                      isActive
                        ? "text-white shadow-lg scale-105"
                        : "text-gray-600 bg-transparent hover:bg-gray-100/50 hover:scale-105"
                    }`}
                    style={isActive ? { backgroundColor: primaryColor } : {}}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </a>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-gray-900 text-white">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 flex flex-col items-center flex-shrink-0 pb-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              data-onboarding="dashboard-settings"
              onClick={() => {
                window.location.href = `/${
                  pathname.split("/")[1]
                }/dashboard-settings`;
                if (isMobile) setOpen(false);
              }}
              className={`w-12 h-12 rounded-2xl cursor-pointer flex items-center justify-center transition-all ${
                pathname.includes("/dashboard-settings")
                  ? "text-white shadow-lg scale-105"
                  : "text-gray-600 bg-transparent hover:bg-gray-100/50 hover:scale-105"
              }`}
              style={
                pathname.includes("/dashboard-settings")
                  ? { backgroundColor: primaryColor }
                  : {}
              }
            >
              <Cog className="w-5 h-5" strokeWidth={2} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-gray-900 text-white">
            <p>Dashboard Settings</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                window.location.href = "/api/auth/logout";
              }}
              className="w-12 h-12 rounded-2xl cursor-pointer flex items-center justify-center text-gray-600 bg-transparent hover:bg-gray-100/50 transition-all hover:scale-105"
            >
              <LogOut className="w-5 h-5" strokeWidth={2} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-gray-900 text-white">
            <p>Logout</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="default"
            className="fixed top-4 left-4 z-50 md:hidden shadow-lg bg-white border border-gray-200 text-gray-900 hover:bg-gray-50"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-20 p-0 bg-white">
          <div className="h-full flex flex-col py-6">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className="w-20 h-full bg-white rounded-3xl flex flex-col items-center py-6 flex-shrink-0"
      style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)" }}
    >
      <SidebarContent />
    </div>
  );
}
