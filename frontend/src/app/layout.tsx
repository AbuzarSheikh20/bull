// src/app/layout.tsx
import "../styles/globals.css";

import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "../styles/globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/auth-context";
import { AuthDebugger } from "@/components/auth-debugger";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Anonymous Support",
  description: "A platform for anonymous support and motivation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html>
        <body className={`${inter.variable} font-inter`}>
          <AuthProvider>
            {children}
            <Toaster />
            {process.env.NODE_ENV !== "production" && <AuthDebugger />}
          </AuthProvider>
        </body>
      </html>
    </>
  );
}
