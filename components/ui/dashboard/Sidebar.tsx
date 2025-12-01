// components/ui/dashboard/Sidebar.tsx
"use client";
import * as React from "react";
import { usePathname } from "next/navigation";
import { Home, UserRoundPlus, Brush, Cog, Earth, Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
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
    <>
      {/* Logo - Responsive sizing */}
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

      {/* Navigation - Centered */}
      <div className="flex-1 flex items-center justify-center overflow-y-auto">
        <div className="space-y-3 md:space-y-4 flex flex-col items-center py-4">
          {navItems.map((item) => {
            const Icon = iconMap[item.label] || Home;
            const isActive = pathname === item.href;

            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => isMobile && setOpen(false)}
                className={`w-10 h-10 md:w-10 md:h-10 rounded-2xl flex items-center justify-center transition-all ${
                  isActive
                    ? "text-white shadow-lg scale-110"
                    : "text-gray-600 bg-transparent hover:bg-gray-100/50 hover:scale-105"
                }`}
                style={isActive ? { backgroundColor: primaryColor } : {}}
              >
                <Icon className="w-5 h-5" strokeWidth={2} />
              </a>
            );
          })}
        </div>
      </div>

      {/* Footer - Dashboard Settings and Logout */}
      <div className="space-y-3 flex flex-col items-center flex-shrink-0 pb-6">
        <button
          onClick={() => {
            window.location.href = `/${
              pathname.split("/")[1]
            }/dashboard-settings`;
            if (isMobile) setOpen(false);
          }}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-gray-600 bg-transparent hover:bg-gray-100/50 transition-colors"
          title="Dashboard Settings"
        >
          <Cog className="w-5 h-5" strokeWidth={2} />
        </button>

        <button
          onClick={() => {
            window.location.href = "/api/auth/logout";
          }}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-gray-600 bg-transparent hover:bg-gray-100/50 transition-colors"
          title="Logout"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M17.4399 14.62L19.9999 12.06L17.4399 9.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9.76001 12.0601H19.93"
              stroke="currentColor"
              strokeWidth="2"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11.76 20C7.34001 20 3.76001 17 3.76001 4 11.76 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </>
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
