"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { updateMotivatorProfile } from "@/lib/api";

export default function MotivatorProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(user);
  const [loading, setLoading] = useState(false);

  // On mount, always sync userData from localStorage (for after refresh)
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("userData");
      if (stored) {
        setUserData(JSON.parse(stored));
      }
    }
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await updateMotivatorProfile({
        fullName: userData?.fullName,
        gender: userData?.gender,
        bio: userData?.bio,
        specialities: userData?.specialities,
      });
      setUserData(updated);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
        <Card className="mb-8 shadow-lg border-0 bg-white/90">
          <CardContent className="flex flex-col md:flex-row items-center gap-8 p-8">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center md:items-start w-full md:w-1/3">
              <Avatar className="h-24 w-24 mb-4 shadow-md">
                <AvatarImage src={userData?.profilePicture || userData?.profilePhoto} alt={userData?.fullName || userData?.name} />
                <AvatarFallback className="text-3xl font-bold">
                  {userData?.fullName?.charAt(0) || userData?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold mb-1">{userData?.fullName || userData?.name}</h2>
                <p className="text-muted-foreground text-sm">{userData?.email}</p>
                <p className="text-muted-foreground text-sm capitalize mt-1">{userData?.gender}</p>
              </div>
            </div>
            {/* Profile Info */}
            <div className="flex-1 w-full">
              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      value={userData?.fullName || userData?.name}
                      onChange={(e) =>
                        setUserData((prev) =>
                          prev ? { ...prev, fullName: e.target.value } : prev
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={userData?.email} disabled />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <RadioGroup
                      value={userData?.gender ?? ""}
                      onValueChange={(value) =>
                        setUserData((prev) =>
                          prev ? { ...prev, gender: value } : prev
                        )
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Female</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={userData?.bio}
                      onChange={(e) =>
                        setUserData((prev) =>
                          prev ? { ...prev, bio: e.target.value } : prev
                        )
                      }
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialities">Specialties</Label>
                    <Input
                      id="specialities"
                      value={userData?.specialities}
                      onChange={(e) =>
                        setUserData((prev) =>
                          prev ? { ...prev, specialities: e.target.value } : prev
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground">Separate with commas</p>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bio</p>
                    <p className="mt-1">{userData?.bio || <span className="italic text-muted-foreground">No bio provided.</span>}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Specialities</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {(userData?.specialities || "")
                        .split(",")
                        .filter((s) => s.trim())
                        .map((speciality, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                          >
                            {speciality.trim()}
                          </span>
                        ))}
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow border-0 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Total Responses</CardTitle>
              <CardDescription>How many responses you have given</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-blue-700">
                  {userData?.responseCount || 0}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow border-0 bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Avg. Response Time</CardTitle>
              <CardDescription>Typical time to respond</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-green-700">8h</div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow border-0 bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Client Satisfaction</CardTitle>
              <CardDescription>Average rating from clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-yellow-700">4.8/5</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Guidelines Section */}
        <Card className="shadow border-0 bg-white/90">
          <CardHeader>
            <CardTitle>Motivator Guidelines</CardTitle>
            <CardDescription>
              Important Information for providing support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <h3 className="font-medium">Confidentiality</h3>
                <p className="text-muted-foreground">
                  All communications with users must remain confidential.
                  Never share any information that could identify a user.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <h3 className="font-medium">Response Time</h3>
                <p className="text-muted-foreground">
                  Try to respond to messages within 24 hours. If you need more
                  time, let the user know.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <h3 className="font-medium">Supportive Communication</h3>
                <p className="text-muted-foreground">
                  Be empathetic, non-judgmental, and supportive in all your
                  communications. Focus on understanding and validating the
                  user&apos;s feelings.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <h3 className="font-medium">Gender based Matching</h3>
                <p className="text-muted-foreground">
                  You will only be matched with users of the same gender to
                  ensure comfort and safety for all parties.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
