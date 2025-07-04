"use client";

import React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";

export default function ClientProfile() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [userData, setUserData] = useState(user);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      setUserData({
        ...user,
      });
    }
  }, [user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);

    localStorage.setItem("userData", JSON.stringify(userData));

    toast("Profile Updated: Your Profile has been successfully updated");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (!password || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setPasswordLoading(true);
    try {
      // TODO: Replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPasswordSuccess("Password changed successfully!");
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordModal(false);
    } catch (err) {
      setPasswordError("Failed to change password. Try again.");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground mb-4">Manage your personal information and account settings</p>
      </div>
      <div className="grid gap-8">
        <Card className="shadow-lg border-0">
          <CardHeader className="flex flex-col items-center gap-2 pb-0">
            <Avatar className="h-20 w-20 mb-2">
              <AvatarFallback className="text-2xl">
                {userData?.fullName?.charAt(0) || userData?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl font-semibold">
              {userData?.fullName || userData?.name || "User"}
            </CardTitle>
            <CardDescription className="text-center">
              {userData?.email || "user@example.com"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={userData?.fullName || userData?.name || ""}
                    onChange={(e) =>
                      setUserData((prev) =>
                        prev
                          ? {
                              ...prev,
                              fullName: e.target.value,
                              id: prev.id ?? "",
                              email: prev.email ?? "",
                              gender: prev.gender ?? "",
                            }
                          : prev
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userData?.email || ""}
                    onChange={(e) =>
                      setUserData((prev) =>
                        prev
                          ? {
                              ...prev,
                              email: e.target.value,
                              id: prev.id ?? "",
                              fullName: prev.fullName ?? "",
                              gender: prev.gender ?? "",
                            }
                          : prev
                      )
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <RadioGroup
                  value={userData?.gender}
                  onValueChange={(value) =>
                    setUserData((prev) =>
                      prev
                        ? {
                            ...prev,
                            gender: value,
                            id: prev.id ?? "",
                            fullName: prev.fullName ?? "",
                            email: prev.email ?? "",
                          }
                        : prev
                    )
                  }
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account preferences and security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Account Type</Label>
              <p className="text-sm text-muted-foreground">Client</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Member Since</Label>
              <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <p className="text-sm text-green-600 font-medium">Active</p>
            </div>
            <div className="pt-4">
              <Button variant="outline" className="w-full" onClick={() => setShowPasswordModal(true)}>
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Change Password Modal */}
      <Sheet open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <SheetContent side="right" className="max-w-md w-full">
          <SheetHeader>
            <SheetTitle>Change Password</SheetTitle>
            <SheetDescription>Enter your current and new password below.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {passwordError && <p className="text-red-600 text-sm">{passwordError}</p>}
            {passwordSuccess && <p className="text-green-600 text-sm">{passwordSuccess}</p>}
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setShowPasswordModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? "Changing..." : "Change Password"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
