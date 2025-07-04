import type React from "react";
import { AdminNav } from "../../components/admin-nav";
import { MobileNav } from "@/components/mobile-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <MobileNav role="admin" />
            <div className="font-bold">Anonymous Support - Admin</div>
          </div>
          <div className="hidden md:block">
            <AdminNav />
          </div>
        </div>
      </header>
      <main className="flex-1 py-6">{children}</main>
    </div>
  );
}
