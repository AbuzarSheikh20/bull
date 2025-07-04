"use client";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React from "react";

type User = {
  fullName?: string;
  name?: string;
  profilePicture?: string;
  profilePhoto?: string;
};

export function ClientTopbar() {
  // Always get the latest user data from localStorage
  const [user, setUser] = React.useState<User | null>(null);
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("userData");
      if (stored) setUser(JSON.parse(stored));
    }
  }, []);

  return (
    <header className="sticky top-0 z-10 border-b bg-background w-full">
      <div className="flex h-16 items-center justify-end px-4 md:px-8">
        <Link href="/client/profile">
          <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
            <AvatarImage src={user?.profilePicture || user?.profilePhoto} alt={user?.fullName || user?.name} />
            <AvatarFallback className="text-sm font-medium">
              {user?.fullName?.charAt(0) || user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
} 