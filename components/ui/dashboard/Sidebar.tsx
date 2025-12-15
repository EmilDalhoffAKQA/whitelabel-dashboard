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
      <div className="pb-6 md:pb-8 flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative group cursor-pointer">
              {logo ? (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-white flex items-center justify-center mx-auto transition-all group-hover:shadow-md group-hover:scale-105">
                  <div className="max-w-[48px] max-h-[48px] md:max-w-[64px] md:max-h-[64px] w-full h-full flex items-center justify-center">
                    <img
                      src={logo}
                      alt="Logo"
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronDown className="w-3 h-3 text-white" />
                  </div>
                </div>
              ) : (
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-3xl flex items-center justify-center mx-auto transition-all group-hover:shadow-md group-hover:scale-105 relative"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="text-white font-bold text-xl md:text-2xl">
                    D
                  </span>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronDown className="w-3 h-3 text-white" />
                  </div>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="right"
            align="start"
            className="w-72 bg-white border-gray-200 shadow-lg"
          >
            <DropdownMenuLabel className="text-gray-900 font-semibold">
              Switch Workspace
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-200" />
            <div className="max-h-80 overflow-y-auto">
              {workspaces.map((workspace) => {
                const isActive =
                  workspace.id.toString() === currentWorkspaceId;
                return (
                  <DropdownMenuItem
                    key={workspace.id}
                    onClick={() => {
                      if (!isActive) {
                        window.location.href = `/${workspace.id}/dashboard`;
                      }
                    }}
                    className={`cursor-pointer py-3 ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      {workspace.logo_url ? (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <img
                            src={workspace.logo_url}
                            alt={workspace.name}
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <span className="text-white font-semibold text-sm">
                            {workspace.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="flex-1 truncate font-medium">
                        {workspace.name}
                      </span>
                      {isActive && (
                        <Check className="w-4 h-4 text-blue-700 flex-shrink-0" />
                      )}
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </div>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuItem
              onClick={() => {
                window.location.href = "/workspaces";
              }}
              className="text-gray-900 hover:bg-gray-50 cursor-pointer py-3 font-medium"
            >
              View all workspaces →
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
