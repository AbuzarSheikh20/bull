"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Check,
  Home,
  LogOut,
  MessageSquare,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import apiClient from "@/lib/api-client";

type Application = {
  _id: string;
  fullName: string;
  email: string;
  gender: string;
  joinDate: string;
  bio?: string;
  experience?: string;
  specialities?: string;
  reason?: string;
  createdAt: string;
  // add other fields as needed
};

export default function AdminApplications() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<string | null>(
    null
  );
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    const fetchPendingMotivators = async () => {
      try {
        const res = await apiClient.get("/users");
        // Accept both res.data, res.data.data, and res.data.message (for array)
        let userList = [];
        if (Array.isArray(res.data)) {
          userList = res.data;
        } else if (Array.isArray(res.data.data)) {
          userList = res.data.data;
        } else if (Array.isArray(res.data.message)) {
          userList = res.data.message;
        }
        const pendingMotivators = userList.filter(
          (user: { role: string; status: string }) =>
            user.role === "motivator" && user.status === "pending"
        );
        setApplications(pendingMotivators);
      } catch {
        toast.error("Failed to load applications");
      }
    };
    fetchPendingMotivators();
  }, []);

  const filteredApplications = applications.filter(
    (app) =>
      app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.specialities || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const approveMotivator = async (id: string) => {
    try {
      await apiClient.get(`/users/${id}/approve`);
      toast.success("Motivator approved successfully");
      setApplications((prev) => prev.filter((app) => app._id !== id));
      setSelectedApplication(null);
      // Notify dashboard to refresh pending applications
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("pendingApplicationsUpdated"));
      }
    } catch {
      toast.error("Failed to approve motivator");
    }
  };

  const rejectMotivator = async (id: string) => {
    try {
      await apiClient.get(`/users/${id}/reject`);
      toast.success("Motivator rejected successfully");
      setApplications((prev) => prev.filter((app) => app._id !== id));
      setSelectedApplication(null);
      // Notify dashboard to refresh pending applications
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("pendingApplicationsUpdated"));
      }
    } catch {
      toast.error("Failed to reject motivator");
    }
  };

  const selected = applications.find((a) => a._id === selectedApplication);

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

      {/* Main content */}
      <div className="flex-1">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <div className="font-semibold">Admin Dashboard</div>
          <div className="ml-auto flex items-center gap-4">
            <Avatar>
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 md:gap-8 md:p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Motivator Applications</h1>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search applications..."
                className="w-full rounded-md pl-8 md:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Pending Applications</CardTitle>
                <CardDescription>Review motivator applications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((app) => (
                    <div
                      key={app._id}
                      className={`cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
                        selectedApplication === app._id
                          ? "bg-muted/50 border-primary"
                          : ""
                      }`}
                      onClick={() => setSelectedApplication(app._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {app.fullName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{app.fullName}</p>
                            <p className="text-xs text-muted-foreground">
                              {app.email}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {app.gender}
                        </Badge>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Applied on {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "N/A"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
                    <p className="text-muted-foreground">
                      No applications found
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Details */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
                <CardDescription>
                  {selected
                    ? "Review the motivator's qualifications and experience"
                    : "Select an application from the left"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selected ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="text-xl">
                          {selected.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">
                          {selected.fullName}
                        </h3>
                        <p className="text-muted-foreground">
                          {selected.email}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {selected.gender}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Applied on {selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Tabs defaultValue="qualifications">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="qualifications">
                          Qualifications
                        </TabsTrigger>
                        <TabsTrigger value="application">
                          Application
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent
                        value="qualifications"
                        className="mt-4 space-y-4"
                      >
                        <div>
                          <h4 className="font-medium">Bio</h4>
                          <p className="mt-1">{selected.bio}</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Experience</h4>
                          <p className="mt-1">{selected.experience}</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Specialties</h4>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {selected.specialities?.split(",").map((s, i) => (
                              <span
                                key={i}
                                className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                              >
                                {s.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent
                        value="application"
                        className="mt-4 space-y-4"
                      >
                        <div>
                          <h4 className="font-medium">
                            Why do you want to be a motivator?
                          </h4>
                          <p className="mt-1">{selected.reason}</p>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="notes">Admin Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          placeholder="Add any notes about this applicant..."
                          className="mt-1"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          className="gap-1 text-red-500"
                          onClick={() => rejectMotivator(selected._id)}
                        >
                          <X className="h-4 w-4" /> Reject
                        </Button>
                        <Button
                          className="gap-1"
                          onClick={() => approveMotivator(selected._id)}
                        >
                          <Check className="h-4 w-4" /> Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
                    <div className="text-center">
                      <Users className="mx-auto h-8 w-8 text-muted-foreground" />
                      <h3 className="mt-2 text-lg font-semibold">
                        No Application Selected
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Select an application from the left to review
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
