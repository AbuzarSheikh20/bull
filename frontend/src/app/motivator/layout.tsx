import type React from "react"
import Link from "next/link"
import { Home, MessageSquare, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MotivatorTopbar } from "@/components/motivator-topbar"
import MotivatorLogoutBtn from "@/components/motivator-logout-btn"

export default function MotivatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex w-64 flex-col bg-background border-r shadow-sm">
        <div className="px-4 pt-6 pb-2">
          <span className="font-bold text-xl block mb-2">Motivator Dashboard</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider mb-4 block">Navigation</span>
        </div>
        <nav className="flex-1 space-y-2 p-4 pt-0">
          <Button variant="outline" className="w-full justify-start cursor-pointer" asChild>
            <Link href="/motivator/dashboard" className="flex items-center">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start cursor-pointer" asChild>
            <Link href="/motivator/messages" className="flex items-center">
              <MessageSquare className="mr-2 h-4 w-4" />
              Messages
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start cursor-pointer" asChild>
            <Link href="/motivator/profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start cursor-pointer" asChild>
            <Link href="/motivator/settings" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </nav>
        <div className="border-t pt-4 p-4">
          <MotivatorLogoutBtn />
        </div>
      </div>
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top navbar for all screens */}
        <MotivatorTopbar />
        <main className="flex-1 py-6">{children}</main>
      </div>
    </div>
  )
}
