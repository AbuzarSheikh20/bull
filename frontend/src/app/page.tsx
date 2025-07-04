import Link from "next/link";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { MessageCircle, Users, Heart, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background border-b">
        <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <div className="font-semibold text-lg">Comfort</div>
          <div className="ml-auto flex items-center space-x-4">
            <Link href="/login">
              <Button className="cursor-pointer" variant="ghost">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="cursor-pointer">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted/50">
          <div className=" px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  Safe & Anonymous
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Share your thoughts anonymously
                </h1>
                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  A safe space to express yourself and receive support without
                  revealing your identity.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/signup">
                    <Button size="lg" className="group cursor-pointer">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button
                      className="cursor-pointer"
                      size="lg"
                      variant="outline"
                    >
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
                <div className="aspect-square overflow-hidden rounded-xl bg-muted/50 p-2">
                  <div className="animate-pulse-slow flex h-full items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 via-primary/10 to-muted">
                    <MessageCircle className="h-24 w-24 text-primary/40" />
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-4 aspect-square w-24 animate-bounce-slow rounded-xl bg-primary/10 p-2">
                  <div className="flex h-full items-center justify-center rounded-lg bg-yellow-300 ">
                    <Heart className="h-10 w-10 text-red-600" />
                  </div>
                </div>
                <div className="absolute -right-4 -top-4 aspect-square w-24 animate-bounce-slow animation-delay-500 rounded-xl bg-primary/10 p-2">
                  <div className="flex h-full items-center justify-center rounded-lg bg-background">
                    <Heart className="h-10 w-10 text-primary/60" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className=" px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  How It Works
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Simple, Secure, Supportive
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform connects people seeking support with
                  compassionate motivators who are here to listen and help.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 text-center shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Share Anonymously</h3>
                <p className="text-muted-foreground">
                  Express your thoughts, feelings, and concerns without
                  revealing your identity.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 text-center shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Get Matched</h3>
                <p className="text-muted-foreground">
                  Our system matches you with a motivator who can best support
                  your needs.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 text-center shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Receive Support</h3>
                <p className="text-muted-foreground">
                  Get thoughtful responses and guidance from trained motivators
                  who care.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className=" px-4 md:px-6">
            <div className="mx-auto grid max-w-sm items-start gap-6 sm:max-w-4xl sm:grid-cols-2 md:gap-8">
              <Card className="transform transition-transform hover:scale-105">
                <CardHeader>
                  <CardTitle>Anonymous Sharing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Share your thoughts, struggles, or stories without revealing
                    your identity.
                  </p>
                </CardContent>
              </Card>
              <Card className="transform transition-transform hover:scale-105">
                <CardHeader>
                  <CardTitle>Supportive Responses</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Receive thoughtful responses from dedicated motivators who
                    care.
                  </p>
                </CardContent>
              </Card>
              <Card className="transform transition-transform hover:scale-105">
                <CardHeader>
                  <CardTitle>Media Sharing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Express yourself through text, images, audio, or video
                    uploads.
                  </p>
                </CardContent>
              </Card>
              <Card className="transform transition-transform hover:scale-105">
                <CardHeader>
                  <CardTitle>Complete Privacy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Your identity remains protected throughout the entire
                    process.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className=" flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2025 Anonymous Support. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
