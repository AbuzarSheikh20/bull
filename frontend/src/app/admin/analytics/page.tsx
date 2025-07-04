"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import apiClient from "@/lib/api-client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Extend jsPDF type to include autoTable properties
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

type MessageStats = {
  total: number;
  responded: number;
  pending: number;
  responseRate: string;
};

type UserStats = {
  totalUsers: number;
  clients: number;
  motivators: number;
  admins: number;
  activeUsers: number;
};

export default function AdminAnalytics() {
  const [messageStats, setMessageStats] = useState<MessageStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [messagesRes, usersRes] = await Promise.all([
          apiClient.get("/messages/user-messages"),
          apiClient.get("/users"),
        ]);

        // Robustly extract users array
        let users = [];
        if (Array.isArray(usersRes.data)) {
          users = usersRes.data;
        } else if (Array.isArray(usersRes.data.data)) {
          users = usersRes.data.data;
        } else if (Array.isArray(usersRes.data.message)) {
          users = usersRes.data.message;
        }

        // Robustly extract messages array
        let messages = [];
        if (Array.isArray(messagesRes.data)) {
          messages = messagesRes.data;
        } else if (Array.isArray(messagesRes.data.data)) {
          messages = messagesRes.data.data;
        } else if (Array.isArray(messagesRes.data.message)) {
          messages = messagesRes.data.message;
        }

        const safeMessages = Array.isArray(messages) ? messages : [];
        const safeUsers = Array.isArray(users) ? users : [];

        const messageStats = {
          total: safeMessages.length,
          responded: safeMessages.filter(
            (m: { status: string }) => m.status === "responded"
          ).length,
          pending: safeMessages.filter(
            (m: { status: string }) => m.status === "pending"
          ).length,
          responseRate: safeMessages.length
            ? `${Math.round(
                (safeMessages.filter(
                  (m: { status: string }) => m.status === "responded"
                ).length /
                  safeMessages.length) *
                  100
              )}%`
            : "0%",
        };

        const userStats = {
          totalUsers: safeUsers.length,
          clients: safeUsers.filter(
            (u: { role: string }) => u.role === "client"
          ).length,
          motivators: safeUsers.filter(
            (u: { role: string }) => u.role === "motivator"
          ).length,
          admins: safeUsers.filter((u: { role: string }) => u.role === "admin")
            .length,
          activeUsers: safeUsers.filter(
            (u: { status: string }) => u.status === "active"
          ).length,
        };

        setMessageStats(messageStats);
        setUserStats(userStats);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setMessageStats({
          total: 0,
          responded: 0,
          pending: 0,
          responseRate: "0%",
        });
        setUserStats({
          totalUsers: 0,
          clients: 0,
          motivators: 0,
          admins: 0,
          activeUsers: 0,
        });
      }
    };

    fetchAnalytics();
  }, []);

  // Download report as PDF
  const handleDownloadReport = () => {
    if (!userStats || !messageStats) return;
    const doc = new jsPDF() as jsPDFWithAutoTable;
    doc.setFontSize(18);
    doc.text("Analytics Report", 14, 18);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 26);

    // User Stats Table
    autoTable(doc, {
      startY: 32,
      head: [["User Stats", "Value"]],
      body: [
        ["Total Users", userStats.totalUsers],
        ["Clients", userStats.clients],
        ["Motivators", userStats.motivators],
        ["Admins", userStats.admins],
        ["Active Users", userStats.activeUsers],
      ],
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
    });

    // Message Stats Table
    autoTable(doc, {
      startY: doc.lastAutoTable
        ? doc.lastAutoTable.finalY + 10
        : 42,
      head: [["Message Stats", "Value"]],
      body: [
        ["Total Messages", messageStats.total],
        ["Responded", messageStats.responded],
        ["Pending", messageStats.pending],
        ["Response Rate", messageStats.responseRate],
      ],
      theme: "grid",
      headStyles: { fillColor: [39, 174, 96] },
    });

    doc.save(`analytics-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (!messageStats || !userStats) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar */}
      <div className="hidden w-64 flex-col bg-background p-4 shadow-sm md:flex">
        <div className="flex items-center gap-2 py-4">
          <div className="font-semibold">Admin Dashboard</div>
        </div>
        <nav className="flex-1 space-y-2 py-4">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/dashboard">
              <Home className="mr-2 h-4 w-4" /> Dashboard
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/messages">
              <MessageSquare className="mr-2 h-4 w-4" /> Messages
            </Link>
          </Button>

          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/users">
              <Users className="mr-2 h-4 w-4" /> User Management
            </Link>
          </Button>
          <Button variant="secondary" className="w-full justify-start" asChild>
            <Link href="/admin/applications">
              <Users className="mr-2 h-4 w-4" /> Motivator Applications
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/analytics">
              <BarChart3 className="mr-2 h-4 w-4" /> Analytics
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/settings">
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Link>
          </Button>
        </nav>
        <div className="border-t pt-4">
          <Button variant="ghost" className="w-full justify-start text-red-500">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>

      <div className="flex-1">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <div className="font-semibold">Admin Dashboard</div>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Avatar>
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 md:gap-8 md:p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Analytics</h1>
            <Button
              variant="outline"
              onClick={handleDownloadReport}
              disabled={!userStats || !messageStats}
            >
              Download Report
            </Button>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Total Messages</CardTitle>
                    <CardDescription>All time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {messageStats.total}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Response Rate</CardTitle>
                    <CardDescription>Messages with responses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {messageStats.responseRate}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Total Users</CardTitle>
                    <CardDescription>All user types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {userStats.totalUsers}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Active Users</CardTitle>
                    <CardDescription>Last 30 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {userStats.activeUsers}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="messages" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Total Messages</CardTitle>
                    <CardDescription>All time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {messageStats.total}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Responded</CardTitle>
                    <CardDescription>Messages with responses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {messageStats.responded}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Pending</CardTitle>
                    <CardDescription>Awaiting response</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {messageStats.pending}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="users" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Total Users</CardTitle>
                    <CardDescription>All user types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {userStats.totalUsers}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Clients</CardTitle>
                    <CardDescription>Support seekers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {userStats.clients}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Motivators</CardTitle>
                    <CardDescription>Support providers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {userStats.motivators}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
