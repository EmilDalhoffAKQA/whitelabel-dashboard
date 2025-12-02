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
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

type NavItem = {
  href: string;
  label: string;
};

type User = {
  name: string;
  avatarUrl?: string;
};

type AppSidebarProps = {
  user: User;
  navItems: NavItem[];
  primaryColor?: string;
  logo?: string;
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
}: AppSidebarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  const SidebarContent = () => (
    <TooltipProvider delayDuration={300}>
      <div className="pb-6 md:pb-8 flex-shrink-0">
        {logo ? (
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-white flex items-center justify-center mx-auto">
            <div className="max-w-[48px] max-h-[48px] md:max-w-[64px] md:max-h-[64px] w-full h-full flex items-center justify-center">
              <img
                src={logo}
                alt="Logo"
                className="object-contain w-full h-full"
              />
            </div>
          </div>
        ) : (
          <div
            className="w-16 h-16 md:w-20 md:h-20 rounded-3xl flex items-center justify-center mx-auto"
            style={{ backgroundColor: primaryColor }}
          >
            <span className="text-white font-bold text-xl md:text-2xl">D</span>
          </div>
        )}
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
