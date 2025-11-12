"use client";
import * as React from "react";
import { usePathname } from "next/navigation";
import { Home, Users, Settings } from "lucide-react";

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
  Users: Users,
  Settings: Settings,
};

export function AppSidebar({
  user,
  navItems,
  primaryColor = "#2563eb",
  logo,
}: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className="w-20 h-full bg-white rounded-3xl flex flex-col items-center py-6 flex-shrink-0"
      style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)" }}
    >
      {/* Logo - Bigger at the top */}
      <div className="pb-8">
        {logo ? (
          <img src={logo} alt="Logo" className="object-contain h-20 w-20" />
        ) : (
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ backgroundColor: primaryColor }}
          >
            <span className="text-white font-bold text-2xl">D</span>
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="space-y-4 flex flex-col items-center">
          {navItems.map((item) => {
            const Icon = iconMap[item.label] || Home;
            const isActive = pathname === item.href;

            return (
              <a
                key={item.href}
                href={item.href}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                  isActive
                    ? "text-white shadow-lg"
                    : "text-gray-600 bg-transparent hover:bg-gray-100/50"
                }`}
                style={isActive ? { backgroundColor: primaryColor } : {}}
              >
                <Icon className="w-5 h-5" strokeWidth={2} />
              </a>
            );
          })}
        </div>
      </div>

      {/* Footer - Settings and Logout at bottom */}
      <div className="space-y-3 flex flex-col items-center">
        {/* Settings button */}
        <button
          onClick={() =>
            (window.location.href = `/${pathname.split("/")[1]}/settings`)
          }
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-gray-600 bg-transparent hover:bg-gray-100/50 transition-colors"
        >
          <Settings className="w-5 h-5" strokeWidth={2} />
        </button>

        {/* Logout button */}
        <button
          onClick={() => (window.location.href = "/api/auth/logout")}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-gray-600 bg-transparent hover:bg-gray-100/50 transition-colors"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="w-5 h-5"
          >
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
              d="M11.76 20C7.34001 20 3.76001 17 3.76001 12C3.76001 7 7.34001 4 11.76 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
