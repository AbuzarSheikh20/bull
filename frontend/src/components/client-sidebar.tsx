"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, User, Menu, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";

export const ClientSidebar = () => {
  const pathName = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuth();

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
    <>
      {/* Mobile overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-40 md:hidden",
          isCollapsed ? "hidden" : "block"
        )}
        onClick={() => setIsCollapsed(true)}
      />
      
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-50 w-64 h-screen flex flex-col bg-background border-r shadow-sm transition-transform duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0",
        isCollapsed ? "-translate-x-full" : "translate-x-0"
      )}>
        <div className="flex flex-col h-full min-h-0">
          {/* Header */}
          <div className="px-4 pt-6 pb-2">
            <span className="font-bold text-xl block mb-2">Client Dashboard</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-4 block">Navigation</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4 pt-0">
            {routes.map((route) => (
              <Button 
                key={route.href}
                variant="outline" 
                className={cn(
                  "w-full justify-start cursor-pointer",
                  route.active ? "bg-primary text-primary-foreground" : ""
                )}
                asChild
              >
                <Link 
                  href={route.href} 
                  className="flex items-center"
                  onClick={() => setIsCollapsed(true)}
                >
                  <route.icon className="mr-2 h-4 w-4" />
                  {route.label}
                </Link>
              </Button>
            ))}
          </nav>

          {/* Logout at the bottom */}
          <div className="border-t pt-4 p-4 mt-auto">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 cursor-pointer"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile toggle button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsCollapsed(false)}
        className="fixed top-4 left-4 z-30 md:hidden"
      >
        <Menu className="h-4 w-4" />
      </Button>
    </>
  );
}; 