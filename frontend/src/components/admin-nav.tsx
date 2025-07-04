"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageSquare,
  Users,
  Settings,
  BarChart3,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export function AdminNav() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const routes = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: Home,
      active: pathname === "/admin/dashboard",
    },
    {
      href: "/admin/messages",
      label: "Messages",
      icon: MessageSquare,
      active: pathname === "/admin/messages",
    },
    {
      href: "/admin/users",
      label: "Users",
      icon: Users,
      active: pathname === "/admin/users",
    },
    {
      href: "/admin/applications",
      label: "Applications",
      icon: UserCheck,
      active: pathname === "/admin/applications",
    },
    {
      href: "/admin/analytics",
      label: "Analytics",
      icon: BarChart3,
      active: pathname === "/admin/analytics",
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/admin/settings",
    },
  ];

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            route.active ? "text-primary" : "text-muted-foreground"
          )}
        >
          <route.icon className="mr-2 h-4 w-4" />
          {route.label}
        </Link>
      ))}
      <Button variant="ghost" onClick={() => logout()}>
        Logout
      </Button>
    </nav>
  );
}
