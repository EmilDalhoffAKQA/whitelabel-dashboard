"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Home, BarChart3, Users, Settings, Mail } from "lucide-react";

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

// Map label to icon
const iconMap: Record<string, any> = {
  Dashboard: Home,
  Markets: BarChart3,
  Users: Users,
  "Invite User": Mail,
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
    <Sidebar className="border-none bg-transparent [&_[data-slot=sidebar-inner]]:bg-transparent [&_[data-slot=sidebar-inner]]:border-none [&_[data-slot=sidebar-inner]]:shadow-none">
      {/* Floating container with shadow */}
      <div className="m-4 h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden">
        {/* Header / Logo */}
        <SidebarHeader className="border-none">
          <div className="flex items-center gap-3 px-4 py-6">
            {logo ? (
              <img src={logo} alt="Logo" className="h-10" />
            ) : (
              <>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="text-white font-bold text-lg">D</span>
                </div>
                <span className="font-semibold text-lg">Dashboard</span>
              </>
            )}
          </div>
        </SidebarHeader>

        {/* Navigation */}
        <SidebarContent className="px-3">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {navItems.map((item) => {
                  const Icon = iconMap[item.label] || Home;
                  const isActive = pathname === item.href;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={`h-11 rounded-xl transition-all ${
                          isActive
                            ? "shadow-md hover:shadow-lg"
                            : "hover:bg-gray-50"
                        }`}
                        style={
                          isActive
                            ? {
                                backgroundColor: primaryColor,
                                color: "white",
                              }
                            : {}
                        }
                      >
                        <a href={item.href}>
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* User Profile Footer */}
        <SidebarFooter className="border-none mt-auto">
          <div className="flex items-center gap-3 p-4 mx-3 mb-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors cursor-pointer">
            <Avatar className="w-10 h-10 shadow-sm">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback
                className="font-semibold"
                style={{
                  backgroundColor: primaryColor + "20",
                  color: primaryColor,
                }}
              >
                {user.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground">View profile</p>
            </div>
          </div>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
