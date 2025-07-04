"use client";

import { useAuth } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Shield, Moon, Sun } from "lucide-react";

export default function MotivatorSettings() {
  const { logout } = useAuth();

  const saveSetting = () => {
    // toast("Your settings have been saved successfully"); // Removed toast
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Setting</h1>
        <Button onClick={saveSetting}>Save Changes</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Account Setting</CardTitle>
            <CardDescription>Manage your Account Preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <div className="flex items-center justify-between space-x-2">
                <p className="text-sm text-muted-foreground">
                  Recieve Email Notifications
                </p>
                <Switch id="email-notifications" defaultChecked />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auto-response-message">Auto Response</Label>
              <Textarea
                id="auto-response-message"
                placeholder="Thank you for your message. I'm currently away but will respond as soon as possible."
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy Setting</CardTitle>
            <CardDescription>Manage your privacy Preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <div>
                <p className="font-medium">Gender based Matching</p>
                <p className="text-sm text-muted-foreground">
                  You&apos;ll be matched with the users of the same gender
                </p>
              </div>
              <Switch id="gender-matching" defaultChecked disabled />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div>
                <p className="font-medium">Profile Visibility</p>
                <p className="text-sm text-muted-foreground">
                  Show your profile to other motivators{" "}
                </p>
              </div>
              <Switch id="profile-visibility" defaultChecked disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Motification Setting</CardTitle>
            <CardDescription>
              Manage your Notification preferences{" "}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-x-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="new-message-notification">
                New Messages Notification
              </Label>
              <Switch id="new-message-notification" defaultChecked />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="admin-notification">
                New Messages Notification
              </Label>
              <Switch id="admin-notification" defaultChecked />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="system-notification">
                New Messages Notification
              </Label>
              <Switch id="system-notification" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Setting</CardTitle>
            <CardDescription>
              Manage your security preferences{" "}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-x-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="two-factor-auth">
                Two factor Authentication{" "}
              </Label>
              <Switch id="two-factor-auth" />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="session-timeout">
                Session Timeout (minutes){" "}
              </Label>
              <Input
                id="session-timeout"
                type="number"
                defaultValue="60"
                className="w-20"
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="password-change">Change Pasword </Label>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-red-500">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions for your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Deactivate Account</p>
              <p className="text-sm text-muted-foreground">
                Temporarily disable your account. You can reactivate it later.
              </p>
            </div>
            <Button variant="outline" className="text-red-500">
              Deactivate
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
            </div>
            <Button variant="destructive">Delete</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
