"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/auth-context";

export function MotivatorNav() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const routes = [
    {
      href: "/motivator/dashboard",
      label: "Dashboard",
      icon: Home,
      active: pathname === "/motivator/dashboard",
    },
    {
      href: "/motivator/messages",
      label: "Messages",
      icon: MessageSquare,
      active: pathname === "/motivator/messages",
    },
    {
      href: "/motivator/profile",
      label: "Profile",
      icon: User,
      active: pathname === "/motivator/profile",
    },
    {
      href: "/motivator/settings",
      label: "Profile",
      icon: User,
      active: pathname === "/motivator/settings",
    },
  ];

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          // cn ---> to conditionally combine and merge Tailwind class names
          className={cn(
            "flex items-center text-sm font-mediumtransition-colors hover:text-primary",
            route.active ? "text-primary" : "text-muted-foreground"
          )}
        >
          <route.icon className="mr-2 h-4 w-4" />
          {route.label}
        </Link>
      ))}
      <Button variant="ghost" onClick={() => logout()}>
        LogOut
      </Button>
    </nav>
  );
}
