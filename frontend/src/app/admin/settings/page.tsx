"use client";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart3,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
  const saveSettings = () => {
    toast(
      <>
        <div className="font-semibold">Setting saved</div>
        <div className="text-sm text-muted-foreground">
          Your settings have been saved successfully{" "}
        </div>
      </>
    );
  };

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
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/messages">
              <MessageSquare className="mr-2 h-4 w-4" />
              Messages
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/users">
              <Users className="mr-2 h-4 w-4" />
              User Management
            </Link>
          </Button>
          <Button variant="secondary" className="w-full justify-start" asChild>
            <Link href="/admin/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </nav>
        <div className="border-t pt-4">
          <Button variant="ghost" className="w-full justify-start text-red-500">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
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
            <h1 className="text-2xl font-bold">Settings</h1>
            <Button onClick={saveSettings}>Save Changes</Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>
                  Configure general platform settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="platform-name">Platform Name</Label>
                  <Input id="platform-name" defaultValue="Anonymous Support" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform-description">
                    Platform Description
                  </Label>
                  <Textarea
                    id="platform-description"
                    defaultValue="A safe space to express yourself and receive support without revealing your identity."
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      When enabled, only administrators can access the platform
                    </p>
                  </div>
                  <Switch id="maintenance-mode" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure email notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="new-message-notification">
                    New Message Notifications
                  </Label>
                  <Switch id="new-message-notification" defaultChecked />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="new-response-notification">
                    New Response Notifications
                  </Label>
                  <Switch id="new-response-notification" defaultChecked />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="new-user-notification">
                    New User Notifications
                  </Label>
                  <Switch id="new-user-notification" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure security options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="two-factor-auth">
                    Two-Factor Authentication
                  </Label>
                  <Switch id="two-factor-auth" />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="session-timeout">
                    Session Timeout (minutes)
                  </Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    defaultValue="60"
                    className="w-20"
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="content-filtering">Content Filtering</Label>
                  <Switch id="content-filtering" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>File Upload Settings</CardTitle>
                <CardDescription>Configure file upload options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="allow-file-uploads">Allow File Uploads</Label>
                  <Switch id="allow-file-uploads" defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-file-size">Maximum File Size (MB)</Label>
                  <Input id="max-file-size" type="number" defaultValue="10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowed-file-types">Allowed File Types</Label>
                  <Input
                    id="allowed-file-types"
                    defaultValue="jpg,png,gif,mp3,mp4,pdf"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
