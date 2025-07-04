import React from "react";
import { ClientSidebar } from "@/components/client-sidebar";
import { ClientTopbar } from "@/components/client-topbar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar for desktop */}
      <ClientSidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top navbar for all screens */}
        <ClientTopbar />
        <main className="flex-1 py-6">{children}</main>
      </div>
    </div>
  );
}
