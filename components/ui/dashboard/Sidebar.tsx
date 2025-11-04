"use client";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/lib/theme";

type NavItem = {
  href: string;
  label: string;
};

type User = {
  name: string;
  avatarUrl?: string;
};

export function Sidebar({
  user,
  navItems,
}: {
  user: User;
  navItems: NavItem[];
}) {
  const theme = useTheme();
  const logo = theme?.logo;
  const primaryColor = theme?.primaryColor ?? "blue";

  return (
    <aside className="h-screen w-64 bg-white border-r flex flex-col">
      <div className="flex items-center justify-center h-20 border-b">
        {logo ? (
          <img src={logo} alt="Logo" className="h-10" />
        ) : (
          <span className="font-bold text-xl">Dashboard</span>
        )}
      </div>
      <NavigationMenu>
        <NavigationMenuList className="flex flex-col gap-2 p-4">
          {navItems.map((item) => (
            <NavigationMenuItem key={item.href}>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href={item.href}>{item.label}</a>
              </Button>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      <div className="mt-auto p-4 flex items-center gap-2 border-t">
        <Avatar>
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <span>{user.name}</span>
      </div>
    </aside>
  );
}
