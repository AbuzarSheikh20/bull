"use client";

import React from "react";
import { useState, useEffect } from "react";

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
import { useAuth } from "../../contexts/auth-context";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated, user, error, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === "client") {
        router.push("/client/dashboard");
      } else if (user.role === "motivator") {
        router.push("/motivator/dashboard");
      } else if (user.role === "admin") {
        router.push("/admin/dashboard");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
    } catch (error) {
      console.log("Login Error: ", error);
    }
  };
  return (
    <>
      <div className="flex h-screen w-screen flex-col items-center justify-center">
        <Link href={"/"} className="absolute left-4 top-4 md:left-8 md:top-8">
          <Button variant="ghost">Back</Button>
        </Link>
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter you email and password to sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="abuzarsheikh@gmail.com"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <Link
                  href={"/forgot-password"}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button disabled={isLoading} className="w-full" type="submit">
                {isLoading ? "Signing in..." : "Sign in"}
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
            <Button variant="outline" asChild>
              <Link href="/signup">Create an account</Link>
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="text-xs text-muted-foreground text-center mt-2">
              By signing in, you agree out{" "}
              <Link
                href={"/terms"}
                className="underline underline-offset-4 hover:text-primary"
              >
                Privary Policy
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
