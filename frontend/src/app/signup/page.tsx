"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import React from "react";
import { useEffect, useState } from "react";
import { ProfilePhotoUpload } from "@/components/profile-photo-upload";
import apiClient from "@/lib/api-client";
import { Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { user, isAuthenticated, error, isLoading } = useAuth();
  const [step, setStep] = useState(0);
  const [userType, setUserType] = useState<string | null>("client");
  const [activeTab, setActiveTab] = useState("personal");

  // FormData for Motivator Application
  const [clientData, setClientData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "male",
    profilePhoto: null as File | null,
  });

  // FormData for Motivator Application
  const [motivatorData, setMotivatorData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "male",
    bio: "",
    experience: "",
    specialities: "",
    reason: "",
    profilePhoto: null as File | null,
  });

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Password match
    if (clientData.password !== clientData.confirmPassword) {
      toast.error(
        "Password don't match. Please make sure both passwords are the same."
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append("fullName", clientData.fullName);
      formData.append("email", clientData.email);
      formData.append("password", clientData.password);
      formData.append("gender", clientData.gender);
      formData.append("role", "client");
      
      if (clientData.profilePhoto) {
        formData.append("profilePhoto", clientData.profilePhoto);
      }

      const response = await apiClient.post("auth/register-user/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = response.data;

      if (response.status >= 200 && response.status < 300) {
        
        router.push("/client/dashboard"); // Or a 'Thank you' page
      } else {
        toast.error(data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Client registration error:", error);
      toast.error("Signup failed. Please try again.");
    }
  };

  const handleMotivatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Password match
    if (motivatorData.password !== motivatorData.confirmPassword) {
      toast.error(
        "Password don't match. Please make sure both passwords are the same."
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append("fullName", motivatorData.fullName);
      formData.append("email", motivatorData.email);
      formData.append("password", motivatorData.password);
      formData.append("gender", motivatorData.gender);
      formData.append("bio", motivatorData.bio);
      formData.append("experience", motivatorData.experience);
      formData.append("specialities", motivatorData.specialities);
      formData.append("reason", motivatorData.reason);
      if (motivatorData.profilePhoto) {
        formData.append("profilePhoto", motivatorData.profilePhoto);
      }

      const response = await apiClient.post(
        "auth/register-motivator/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = response.data;

      if (response.status >= 200 && response.status < 300) {
        toast.success("Signup successful!, Your application is under review");
        router.push("motivator/dashboard/");
      } else {
        toast.error(data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Client registration error:", error);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const goToNextTab = () => {
    if (activeTab === "personal") {
      setActiveTab("experience");
    } else if (activeTab === "experience") {
      setActiveTab("review");
    }
  };

  const goToPreviousTab = () => {
    if (activeTab === "experience") {
      setActiveTab("personal");
    } else if (activeTab === "review") {
      setActiveTab("experience");
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === "client") {
        router.push("client/dashboard");
      } else if (user.role === "motivator") {
        router.push("motivator/dashboard");
      } else if (user.role === "admin") {
        router.push("admin/dashboard");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <div className="flex min-h-screen w-screen flex-col items-center justify-center py-8">
      <Link href="/" className="absolute top-4 left-4 md:left-8 md:top-8">
        <Button className="cursor-pointer">Home</Button>
      </Link>
      {step === 0 && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Select Account Type</CardTitle>
            <CardDescription>
              Please choose how you want to register.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button
              className="cursor-pointer"
              onClick={() => {
                setUserType("client");
                setStep(1);
              }}
            >
              I want to be a Client
            </Button>
            <Button
              className="cursor-pointer"
              onClick={() => {
                setUserType("motivator");
                setStep(2);
              }}
            >
              I want to be a Motivator
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 1 && userType === "client" && (
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center">
              <Button
                className="mr-2 cursor-pointer"
                variant="ghost"
                size="sm"
                onClick={() => setStep(0)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-2xl">
                    Client Account
                </CardTitle>
                <CardDescription>
                  Enter your details to create your account
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            <form onSubmit={handleClientSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Abuzar Sheikh"
                  value={clientData.fullName}
                  onChange={(e) =>
                    setClientData({ ...clientData, fullName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="abuzar.sheikh@gmail.com"
                  value={clientData.email}
                  onChange={(e) =>
                    setClientData({ ...clientData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Gender</Label>
                <RadioGroup
                  value={clientData.gender}
                  onValueChange={(value) =>
                    setClientData({ ...clientData, gender: value })
                  }
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="male"
                        id="motivator-male"
                        className="w-4 h-4 border border-gray-300 rounded-full data-[state=checked]:bg-primary data-[state=checked]:border-primary focus:outline-none"
                      />
                      <Label htmlFor="motivator-male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="female"
                        id="motivator-female"
                        className="w-4 h-4 border border-gray-300 rounded-full data-[state=checked]:bg-primary data-[state=checked]:border-primary focus:outline-none"
                      />
                      <Label htmlFor="motivator-female">Female</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={clientData.password}
                    onChange={(e) =>
                      setClientData({ ...clientData, password: e.target.value })
                    }
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs">Password must be atleast 8 characters</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={clientData.confirmPassword}
                    onChange={(e) =>
                      setClientData({
                        ...clientData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <ProfilePhotoUpload
                onPhotoChange={(file) =>
                  setClientData({ ...clientData, profilePhoto: file })
                }
                userName={clientData.fullName}
              />
              <Button
                disabled={isLoading}
                className="w-full mt-2 cursor-pointer"
                type="submit"
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>
            <Button variant="outline" className="cursor-pointer" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </CardContent>

          <CardFooter>
            <div className="text-sm text-muted-foreground w-full text-center">
              By creating an account, you agree out{" "}
              <Link
                href="terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms and Service
              </Link>{" "}
              and{" "}
              <Link
                href="privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
            </div>
          </CardFooter>
        </Card>
      )}

      {step === 2 && userType === "motivator" && (
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center">
              <Button
                className="mr-2 cursor-pointer"
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-2xl">Motivator Account</CardTitle>
                <CardDescription>
                  Apply to become a motivator on our platform
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid w-full gap-3 grid-cols-3">
                <TabsTrigger
                  value="personal"
                  className={`border rounded-md p-1 cursor-pointer hover:bg-gray-100 transition ${
                    activeTab === "personal"
                      ? "bg-primary text-white"
                      : "bg-white"
                  }`}
                  id="personal-tab"
                >
                  Personal
                </TabsTrigger>
                <TabsTrigger
                  value="experience"
                  className={`border rounded-md p-1 cursor-pointer hover:bg-gray-100 transition ${
                    activeTab === "experience"
                      ? "bg-primary text-white"
                      : "bg-white"
                  }`}
                  id="experience-tab"
                >
                  Experience
                </TabsTrigger>
                <TabsTrigger
                  value="review"
                  className={`border rounded-md p-1 cursor-pointer hover:bg-gray-100 transition ${
                    activeTab === "review"
                      ? "bg-primary text-white"
                      : "bg-white"
                  }`}
                  id="review-tab"
                >
                  Review
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="mt-4 grid gap-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="Abuzar Sheikh"
                      value={motivatorData.fullName}
                      onChange={(e) =>
                        setMotivatorData({
                          ...motivatorData,
                          fullName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      placeholder="abuzarsheikh@gmail.com"
                      value={motivatorData.email}
                      onChange={(e) =>
                        setMotivatorData({
                          ...motivatorData,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Gender</Label>
                    <RadioGroup
                      value={motivatorData.gender}
                      onValueChange={(value) =>
                        setMotivatorData({ ...motivatorData, gender: value })
                      }
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="male"
                            id="motivator-male"
                            className="w-4 h-4 border border-gray-300 rounded-full data-[state=checked]:bg-primary data-[state=checked]:border-primary focus:outline-none"
                          />
                          <Label htmlFor="motivator-male">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="female"
                            id="motivator-female"
                            className="w-4 h-4 border border-gray-300 rounded-full data-[state=checked]:bg-primary data-[state=checked]:border-primary focus:outline-none"
                          />
                          <Label htmlFor="motivator-female">Female</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={motivatorData.password}
                        onChange={(e) =>
                          setMotivatorData({
                            ...motivatorData,
                            password: e.target.value,
                          })
                        }
                        required
                        className="pr-4"
                      />
                    </div>
                    <p className="text-xs">
                      Password must be atleast 8 characters
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showPassword ? "text" : "password"}
                        value={motivatorData.confirmPassword}
                        onChange={(e) =>
                          setMotivatorData({
                            ...motivatorData,
                            confirmPassword: e.target.value,
                          })
                        }
                        required
                        className="pr-4"
                      />
                    </div>
                  </div>

                  <ProfilePhotoUpload
                    onPhotoChange={(file) =>
                      setMotivatorData({ ...motivatorData, profilePhoto: file })
                    }
                    userName={motivatorData.fullName}
                  />
                  <Button
                    type="button"
                    onClick={goToNextTab}
                    className="w-full mt-2 cursor-pointer"
                  >
                    Next <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>
                <Button variant="outline" className="cursor-pointer" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
              </TabsContent>
              <TabsContent className="mt-4" value="experience">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      value={motivatorData.bio}
                      onChange={(e) =>
                        setMotivatorData({
                          ...motivatorData,
                          bio: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="experience">Experience</Label>
                    <Textarea
                      id="experience"
                      placeholder="Describe your relevant experience..."
                      value={motivatorData.experience}
                      onChange={(e) =>
                        setMotivatorData({
                          ...motivatorData,
                          experience: e.target.value,
                        })
                      }
                      rows={3}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="specialities">Specialities</Label>
                    <Textarea
                      id="specialities"
                      placeholder="Your specialities.. (Anxiety, Depression, etc.)"
                      value={motivatorData.specialities}
                      onChange={(e) =>
                        setMotivatorData({
                          ...motivatorData,
                          specialities: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reason">Reason for Joining</Label>
                    <Textarea
                      id="reason"
                      placeholder="Why do you want to join?"
                      value={motivatorData.reason}
                      onChange={(e) =>
                        setMotivatorData({
                          ...motivatorData,
                          reason: e.target.value,
                        })
                      }
                      rows={3}
                      required
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <Button
                      type="button"
                      onClick={goToPreviousTab}
                      variant="outline"
                      className="cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      className="cursor-pointer"
                      type="button"
                      onClick={goToNextTab}
                    >
                      Review <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent className="mt-4" value="review">
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <h3 className="font-medium">Personal Information</h3>
                    <div className="mt-2 grid gap-2 grid-cols-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Name:</p>
                        <p>{motivatorData.fullName || "Not Provided"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Email:</p>
                        <p>{motivatorData.email || "Not Provided"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Gender:</p>
                        <p>{motivatorData.gender || "Not Provided"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="`rounded-lg border p-4">
                  <h3 className="font-medium">Experience and Qualification</h3>
                  <div className="mt-2 grid gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Bio:</p>
                      <p>{motivatorData.bio || "Not Provided"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Experience:</p>
                      <p>{motivatorData.experience || "Not Provided"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Specialities:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {motivatorData.specialities
                          ? motivatorData.specialities
                              .split(",")
                              .map((speciality, index) => (
                                <span
                                  key={index}
                                  className="bg-primary/10 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium text-primary"
                                >
                                  {speciality.trim()}
                                </span>
                              ))
                          : "Not Provided"}
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        Reason for Joining:
                      </p>
                      <p>{motivatorData.reason || "Not Provided"}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-2" />
                    <p>Check all information is correct</p>
                  </div>
                </div>

                <div className="flex justify-between mt-4">
                  <Button
                    type="button"
                    className="cursor-pointer"
                    onClick={goToPreviousTab}
                    variant="outline"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>

                  <Button
                    type="button"
                    className="cursor-pointer"
                    onClick={handleMotivatorSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
