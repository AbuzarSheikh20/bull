"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { type Message, sendMessage } from "../../../lib/api";
import { ProtectedRoute } from "@/components/protected-route";
import {
  MessageSquare,
  CheckCircle,
  Clock,
  RefreshCw,
  Send,
  X,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

function ClientDashboard() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [followUpContent, setFollowUpContent] = useState("");
  const [sendingFollowUp, setSendingFollowUp] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();

  const fetchMessages = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const apiUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/api/v1/";
      const response = await fetch(`${apiUrl}messages/user-messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // The backend returns data in the 'data' field, not 'messages'
        const messagesData = data.data || [];
        setMessages(messagesData);
        if (!showLoading) {
          toast.success("Messages refreshed successfully!");
        }
      } else {
        console.error("Failed to fetch messages:", data.message);
        if (data.message && data.message.includes("jwt expired")) {
          toast.error("Session expired. Please login again.");
          router.push("/login");
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  const handleRefresh = () => {
    fetchMessages(false);
  };

  const handleSendFollowUp = async () => {
    if (!followUpContent.trim() || !selectedMessage) return;

    setSendingFollowUp(true);
    try {
      const newMessage = await sendMessage(
        followUpContent,
        selectedFile || undefined
      );

      // Add new message to the local state
      setMessages([newMessage, ...messages]);

      // Clear the form
      setFollowUpContent("");
      setSelectedFile(null);
      setSelectedMessage(null);

      toast.success("Follow-up message sent successfully!");
    } catch (error) {
      console.error("Error sending follow-up:", error);
      toast.error("Failed to send follow-up message");
    } finally {
      setSendingFollowUp(false);
    }
  };

  const openFollowUpModal = (message: Message) => {
    setSelectedMessage(message);
    setFollowUpContent("");
    setSelectedFile(null);
  };

  const closeFollowUpModal = () => {
    setSelectedMessage(null);
    setFollowUpContent("");
    setSelectedFile(null);
  };

  useEffect(() => {
    fetchMessages();
  }, [user, fetchMessages]);

  // Refresh messages when user changes
  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user, fetchMessages]);

  // Auto-refresh messages every 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchMessages(false);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user, fetchMessages]);

  // Helper function to check if a message has a response
  const hasResponse = (message: Message) => {
    return (
      message.hasResponse || message.response || message.status === "responded"
    );
  };

  const respondedMessages = messages?.filter(hasResponse) || [];
  const pendingMessages = messages?.filter((msg) => !hasResponse(msg)) || [];

  return (
    <>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome, {user?.name || user?.fullName || "Client"}
              </h1>
              <p className="text-muted-foreground">
                Your messages will be responded by the motivator matches to your
                gender
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-red-600">
                Pending Messages
              </CardTitle>
              <CardDescription>Waiting for response</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-12 w-12 text-red-500 mr-4" />
                <div>
                  <div className="text-3xl font-bold text-red-600">
                    {loading ? "..." : pendingMessages.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Waiting</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-green-600">
                Responses
              </CardTitle>
              <CardDescription>Messages with Responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle className="h-12 w-12 text-green-500 mr-4" />
                <div>
                  <div className="text-3xl font-bold text-green-600">
                    {loading ? "..." : respondedMessages.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Responded</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-blue-600">
                Total Messages
              </CardTitle>
              <CardDescription>All messages you have sent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <MessageSquare className="h-12 w-12 text-blue-500 mr-4" />
                <div>
                  <div className="text-3xl font-bold text-blue-600">
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
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Messages</CardTitle>
                <CardDescription>Your most recent messages</CardDescription>
              </div>
              <Link href={"/client/messages"}>
                <Button className="cursor-pointer">New Message</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading messages...</div>
              ) : !messages || messages.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  You haven&apos;t sent any messages. Click &quot;New Message&quot; to get
                  started
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.slice(0, 3).map((message) => (
                    <Card
                      key={message.id || message._id}
                      className={cn(
                        "cursor-pointer",
                        hasResponse(message)
                          ? "bg-green-100 border border-green-200 hover:bg-green-200 transition-colors"
                          : "bg-red-100 border border-red-200 hover:bg-red-200 hover:bg-red-200 transition-colors"
                      )}
                      onClick={() => openFollowUpModal(message)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-medium">You</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(
                              message.date || message.createdAt || Date.now()
                            ).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-sm">{message.content}</p>
                        {hasResponse(message) && message.response && (
                          <div className="bg-green-100 p-3 rounded-md mt-3 border border-green-200">
                            <div className="flex justify-between items-start mb-1">
                              <div className="font-medium text-xs text-green-700">
                                Motivator Response
                              </div>
                              <div className="text-xs text-green-600">
                                {new Date(
                                  message.response.date ||
                                    message.response.createdAt ||
                                    Date.now()
                                ).toLocaleDateString()}
                              </div>
                            </div>
                            <p className="text-sm text-green-800">
                              {message.response.content}
                            </p>
                          </div>
                        )}
                        {!hasResponse(message) && (
                          <div className="mt-3 text-xs text-red-600 font-medium">
                            ⏳ Waiting for response...
                          </div>
                        )}
                        <div className="mt-3 text-xs text-blue-600 font-medium">
                          Click to send follow-up message →
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {messages.length > 3 && (
                    <div className="text-center">
                      <Link href={"/client/messages"}>
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
              <CardTitle>Getting started</CardTitle>
              <CardDescription>How to use Anonymous support</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary rounded-full p-2">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Send a Message</h3>
                    <p className="text-sm text-muted-foreground">
                      Share your thoughts and concerns anonymously. Your message
                      will be seen by the motivator of your gender
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
                    <p className="text-sm text-muted-foreground">
                      Read the motivator&apos;s response and feel free to
                      continue the conversation with follow-up messages
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Follow-up Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Send Follow-up Message</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeFollowUpModal}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Original Message */}
            <div className="bg-muted p-4 rounded-md mb-4">
              <div className="flex items-start justify-between mb-2">
                <div className="font-medium text-sm">Original Message</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(
                    selectedMessage.date ||
                      selectedMessage.createdAt ||
                      Date.now()
                  ).toLocaleDateString()}
                </div>
              </div>
              <p className="text-sm">{selectedMessage.content}</p>
              {hasResponse(selectedMessage) && selectedMessage.response && (
                <div className=" p-3 rounded-md mt-3">
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium text-xs text-green-700">
                      Motivator Response
                    </div>
                    <div className="text-xs text-green-600">
                      {new Date(
                        selectedMessage.response.date ||
                          selectedMessage.response.createdAt ||
                          Date.now()
                      ).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-sm text-green-800">
                    {selectedMessage.response.content}
                  </p>
                </div>
              )}
            </div>

            {/* Follow-up Form */}
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="follow-up-content"
                  className="text-sm font-medium"
                >
                  Your Follow-up Message
                </Label>
                <Textarea
                  id="follow-up-content"
                  className="min-h-[120px] mt-1"
                  value={followUpContent}
                  onChange={(e) => setFollowUpContent(e.target.value)}
                  placeholder="Write your follow-up message here..."
                />
              </div>

              {/* File attachment */}
              <div className="space-y-2">
                <Label htmlFor="follow-up-file" className="text-sm font-medium">
                  Attach File (Optional)
                </Label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="follow-up-file"
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setSelectedFile(file);
                      }}
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      className="pr-10"
                    />
                    <Paperclip className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {selectedFile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {selectedFile && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Paperclip className="h-4 w-4" />
                    <span>
                      Selected: {selectedFile.name} (
                      {(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={closeFollowUpModal}
                  disabled={sendingFollowUp}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendFollowUp}
                  disabled={!followUpContent.trim() || sendingFollowUp}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {sendingFollowUp ? "Sending..." : "Send Follow-up"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function ClientDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["client"]}>
      <ClientDashboard />
    </ProtectedRoute>
  );
}
