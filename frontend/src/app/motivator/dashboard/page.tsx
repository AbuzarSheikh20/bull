"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type Message, getMessages } from "../../../lib/api";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare, CheckCircle, Clock } from "lucide-react";

function MotivatorDashboard() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await getMessages();
        setMessages(data);
      } catch {
        toast("Failed to load messages. Please try again");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const newMessages = Array.isArray(messages)
    ? messages.filter((msg) => !msg.hasResponse)
    : [];

  const respondedMessages = Array.isArray(messages)
    ? messages.filter((msg) => msg.hasResponse)
    : [];

  // Helper function to get message background color based on response status
  const getMessageBackgroundColor = (message: Message) => {
    if (!message.hasResponse) {
      return "bg-red-50 border-red-200 hover:bg-red-100"; // Red for no response
    }
    
    if (message.response) {
      // Check if the current user responded to this message
      const responderId = typeof message.response.motivatorId === 'object' 
        ? message.response.motivatorId._id 
        : message.response.motivatorId;
      
      if (user?.id === responderId) {
        return "bg-green-50 border-green-200 hover:bg-green-100"; // Green for current user's response
      } else {
        return "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"; // Yellow for someone else's response
      }
    }
    
    return "bg-gray-50 border-gray-200 hover:bg-gray-100"; // Default fallback
  };

  // Helper function to get message status text
  const getMessageStatusText = (message: Message) => {
    if (!message.hasResponse) {
      return "No Response";
    }
    
    if (message.response) {
      const responderId = typeof message.response.motivatorId === 'object' 
        ? message.response.motivatorId._id 
        : message.response.motivatorId;
      
      if (user?.id === responderId) {
        return "You Responded";
      } else {
        return "Responded by Others";
      }
    }
    
    return "Unknown Status";
  };

  return (
    <>
      <div className="mx-auto p-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {user?.name || user?.fullName || "Motivator"}
          </h1>
          <p className="text-muted-foreground">
            You are helping users of your gender ({user?.gender}). Thank you for
            your support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">New Messages</CardTitle>

              <CardDescription>Messages waiting for response</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-12 w-12 text-orange-500 mr-4" />
                <div>
                  <div className="text-3xl font-bold">
                    {" "}
                    {loading ? "..." : newMessages.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Responses</CardTitle>
              <CardDescription>Messages you&apos;ve Responsed to</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle className="h-12 w-12 text-green-500 mr-4" />
                <div>
                  <div className="text-3xl font-bold">
                    {loading ? "..." : respondedMessages.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Total Messages</CardTitle>
              <CardDescription>All messages assigned to you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <MessageSquare className="h-12 w-12 text-blue-500 mr-4" />
                <div>
                  <div className="text-3xl font-bold">
                    {loading ? "..." : messages?.length ?? 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex items-center justify">
              <CardTitle>Recent Messages</CardTitle>
              <CardDescription>
                Latest messages waiting for response
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading messages...</div>
              ) : !messages || messages.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No new messages
                </div>
              ) : (
                <div className="space-y-4">
                  {newMessages.slice(0, 3).map((message) => (
                    <Card key={message.id.toString()} className={getMessageBackgroundColor(message)}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between items-start mb-2">
                          <div className="font-medium">Anonymous User</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(message.date).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                  {messages.length > 3 && (
                    <div className="text-center">
                      <Link href={"/motivator/messages"}>
                        <Button variant="link" className="cursor-pointer">
                          View All Messages
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your recent responses</CardTitle>
              <CardDescription>
                Messages you&apos;ve recently respnded to
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading Messages...</div>
              ) : respondedMessages.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No responses yet
                </div>
              ) : (
                <div className="space-y-4">
                  {respondedMessages.slice(0, 3).map((message) => (
                    <Card key={message.id} className={getMessageBackgroundColor(message)}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium">Anonymous User</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(message.date).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-sm line-clamp-1">
                          {message.content}
                        </p>
                        {message.response && (
                          <div className="bg-white/50 p-2 rounded-md mt-2 border">
                            <p className="text-xs line-clamp-2">
                              {message.response.content}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {respondedMessages.length > 3 && (
                    <div className="text-center">
                      <Link href="/motivator/messages">
                        <Button variant="link">View All responses</Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-4 mt-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary rounded-full p-2">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Send a Message</h3>
                    <p className="text-sm text-muted-foreground">
                      Share your thoughts and concerns anonymously. Your message
                      will be seen by the motivater of your gender
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary rounded-full p-2">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Wait for Response</h3>
                    <p className="text-sm text-muted-foreground">
                      A motivator will respond to your message, ususally withing
                      24 hours.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary rounded-full p-2">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Get Support</h3>
                    <p className="text-s, text-muted-foreground">
                      Read the motivator&apos;s response and feel free to continue
                      the conversation with follow-up messages
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export default function MotivatorDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["motivator"]}>
      <MotivatorDashboard />
    </ProtectedRoute>
  );
}
