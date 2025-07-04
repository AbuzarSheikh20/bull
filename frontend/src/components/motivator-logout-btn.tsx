"use client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export default function MotivatorLogoutBtn() {
  const { logout } = useAuth();
  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-red-500 cursor-pointer"
      onClick={logout}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  );
} 