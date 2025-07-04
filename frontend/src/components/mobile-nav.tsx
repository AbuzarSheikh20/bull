"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  X,
  Home,
  MessageSquare,
  User,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "./ui/sheet";
import { useAuth } from "@/contexts/auth-context";

type Route = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
};

export function MobileNav({
  role,
}: {
  role: "client" | "motivator" | "admin";
}) {
  const pathName = usePathname();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  let routes: Route[] = [];
  if (role === "client") {
    routes = [
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
  } else if (role === "motivator") {
    routes = [
      {
        href: "/motivator/dashboard",
        label: "Dashboard",
        icon: Home,
        active: pathName === "/motivator/dashboard",
      },
      {
        href: "/motivator/messages",
        label: "Messages",
        icon: MessageSquare,
        active: pathName === "/motivator/messages",
      },
      {
        href: "/motivator/profile",
        label: "Profile",
        icon: User,
        active: pathName === "/motivator/profile",
      },
    ];
  } else if (role === "admin") {
    routes = [
      {
        href: "/admin/dashboard",
        label: "Dashboard",
        icon: Home,
        active: pathName === "/admin/dashboard",
      },
      {
        href: "/admin/messages",
        label: "Messages",
        icon: MessageSquare,
        active: pathName === "/admin/messages",
      },
      {
        href: "/admin/profile",
        label: "Profile",
        icon: User,
        active: pathName === "/admin/profile",
      },
    ];
  }
  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] sm:w-[300px] ">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>Navigation menu for your account.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Close Menu</span>
              </Button>
            </div>
            <nav className="flex flex-col ga-4">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => {
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                    route.active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {route.icon && <route.icon className="h-5 w-5" />}
                  {route.label}
                </Link>
              ))}
              <Button
                variant="ghost"
                className="flex items-center justify-start gap-2 text-sm font-medium"
                onClick={async () => {
                  await logout();
                  setOpen(false);
                }}
              >
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
