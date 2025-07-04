"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "@/contexts/auth-context";

export const ClientNav = () => {
  const pathName = usePathname();
  const { logout, user } = useAuth();

  const routes = [
    {
      href: "/client/dashboard",
      label: "Dashboard",
      icon: Home,
      active: pathName === "/client/dashboard",
    },
    {
      href: "/client/messages",
      label: "Messages",
      icon: MessageSquare,
      active: pathName === "/client/messages",
    },
    {
      href: "/client/profile",
      label: "Profile",
      icon: User,
      active: pathName === "/client/profile",
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
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => logout()} size="sm">
          <LogOut className="mr-2 h-4 w-4" />
          LogOut
        </Button>
        <Link href="/client/profile">
          <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
            <AvatarImage src={user?.profilePicture || user?.profilePhoto} alt={user?.fullName || user?.name} />
            <AvatarFallback className="text-sm font-medium">
              {user?.fullName?.charAt(0) || user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </nav>
  );
};
