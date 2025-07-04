"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BarChart3,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  Upload,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { type Message, getMessages, sendResponse } from "../../../lib/api";
import { useAuth } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import apiClient from "@/lib/api-client";

type PendingApplication = {
  _id: string;
  fullName: string;
  email: string;
  gender: string;
  joinDate: string;
  bio?: string;
  experience?: string;
  specialities?: string;
  reason?: string;
};

// Add a custom event listener to refresh pending applications
function usePendingApplicationsRefresh(refetch: () => void) {
  useEffect(() => {
    const handler = () => refetch();
    window.addEventListener("pendingApplicationsUpdated", handler);
    return () => window.removeEventListener("pendingApplicationsUpdated", handler);
  }, [refetch]);
}

function AdminDashboard() {
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingApplications, setPendingApplications] = useState<
    PendingApplication[]
  >([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(
    null
  );
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  console.log("Current user:", user);
  console.log("User role:", user?.role);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await getMessages();
        console.log("Fetched messages:", data);
        console.log("First message structure:", data[0]);
        setMessages(data);
      } catch {
        toast.error("Failed to load messages. Please try again");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  // Move fetchPendingApplications out so it can be called from the event
  const fetchPendingApplications = async () => {
    try {
      const res = await apiClient.get("/users");
      let userList = [];
      if (Array.isArray(res.data)) {
        userList = res.data;
      } else if (Array.isArray(res.data.data)) {
        userList = res.data.data;
      } else if (Array.isArray(res.data.message)) {
        userList = res.data.message;
      }
      const pending = userList.filter(
        (user: any) => user.role === "motivator" && user.status === "pending"
      );
      setPendingApplications(pending);
    } catch {
      setPendingApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApplications();
    // eslint-disable-next-line
  }, [user]);

  usePendingApplicationsRefresh(fetchPendingApplications);

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!response.trim() && !selectedFile) return;
    if (!selectedMessageId) return;

    setIsSubmitting(true);

    try {
      console.log("Sending response for message:", selectedMessageId);
      console.log("Response content:", response);
      console.log("Selected file:", selectedFile);

      const responseData = await sendResponse(
        selectedMessageId,
        response,
        selectedFile || undefined
      );

      console.log("Response sent successfully:", responseData);

      // Update the message in local state
      setMessages(
        messages.map((msg) =>
          msg.id === selectedMessageId
            ? { ...msg, hasResponse: true, response: responseData }
            : msg
        )
      );

      setResponse("");
      setSelectedFile(null);
      setSelectedMessageId(null);

      toast.success("Response sent successfully!");
    } catch (error: any) {
      console.error("Error sending response:", error);

      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);

        if (error.response.status === 403) {
          toast.error(
            "Access denied. You don't have permission to send responses."
          );
        } else if (error.response.status === 400) {
          const errorMessage =
            error.response.data?.message || "Invalid request";
          toast.error(errorMessage);
        } else if (error.response.status === 401) {
          toast.error("Authentication failed. Please login again.");
        } else {
          toast.error("Failed to send response. Please try again.");
        }
      } else {
        toast.error("Network error. Please check your connection.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const selectMessage = (id: number) => {
    setSelectedMessageId(id);
    setResponse("");
    setSelectedFile(null);
  };

  const newMessages = messages.filter((msg) => !msg.hasResponse);
  const respondedMessages = messages.filter((msg) => msg.hasResponse);
  const selectedMessage = messages.find((msg) => msg.id === selectedMessageId);

  // Helper function to safely get user information
  const getUserInfo = (message: Message | undefined) => {
    if (!message) {
      return {
        fullName: "Unknown User",
        email: "Unknown",
      };
    }

    if (typeof message.userId === "object" && message.userId !== null) {
      return {
        fullName: message.userId.fullName,
        email: message.userId.email,
      };
    }
    if (message.user) {
      return {
        fullName: message.user.fullName,
        email: message.user.email,
      };
    }
    return {
      fullName: "Unknown User",
      email: "Unknown",
    };
  };

  // Helper function to get responder name
  const getResponderName = (response: any) => {
    if (!response) {
      return "Unknown Responder";
    }

    // Check if motivatorId exists and has data
    if (response.motivatorId) {
      // If motivatorId is an object with fullName (populated data)
      if (
        typeof response.motivatorId === "object" &&
        response.motivatorId.fullName
      ) {
        // Check if this is the current admin
        if (user?.role === "admin" && response.motivatorId._id === user.id) {
          return "You";
        }
        return response.motivatorId.fullName;
      }

      // If motivatorId is a string (unpopulated), check if it matches current admin
      if (typeof response.motivatorId === "string") {
        if (user?.role === "admin" && response.motivatorId === user.id) {
          return "You";
        }
        return "Unknown Motivator";
      }
    }

    // Fallback
    return "Unknown Responder";
  };

  // Helper function to get file type icon and handle file opening
  const getFileDisplay = (fileUrl: string, isClientFile: boolean = true) => {
    const fileName = fileUrl.split('/').pop() || '';
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    
    let fileIcon = '📎';
    let fileType = 'File';
    
    if (fileExtension) {
      switch (fileExtension) {
        case 'pdf':
          fileIcon = '📄';
          fileType = 'PDF';
          break;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
          fileIcon = '🖼️';
          fileType = 'Image';
          break;
        case 'mp3':
        case 'wav':
          fileIcon = '🎵';
          fileType = 'Audio';
          break;
        case 'mp4':
        case 'avi':
        case 'mov':
          fileIcon = '🎬';
          fileType = 'Video';
          break;
        case 'doc':
        case 'docx':
          fileIcon = '📝';
          fileType = 'Document';
          break;
        case 'txt':
          fileIcon = '📄';
          fileType = 'Text';
          break;
        default:
          fileIcon = '📎';
          fileType = 'File';
      }
    }

    const handleFileClick = async (e: React.MouseEvent) => {
      e.preventDefault();
      
      // For PDFs, always download directly to avoid browser issues
      if (fileExtension === 'pdf') {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        link.target = '_blank';
        link.click();
      } else {
        // For other files, open normally
        window.open(fileUrl, '_blank', 'noopener,noreferrer');
      }
    };

    return {
      fileIcon,
      fileType,
      fileName,
      handleFileClick
    };
  };

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
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar */}
      <div className="hidden w-64 flex-col bg-background p-4 shadow-sm md:flex">
        <div className="flex items-center gap-2 py-4">
          <div className="font-semibold">Admin Dashboard</div>
        </div>
        <nav className="flex-1 space-y-2 py-4">
          <Button variant="secondary" className="w-full justify-start" asChild>
            <Link href="/admin/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/messages">
              <MessageSquare className="mr-2 h-4 w-4" />
              Messages
            </Link>
          </Button>

          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/users">
              <Users className="mr-2 h-4 w-4" />
              User Management
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/applications">
              <Users className="mr-2 h-4 w-4" />
              Motivator Applications
              {pendingApplications.length > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {pendingApplications.length}
                </Badge>
              )}
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </nav>
        <div className="border-t pt-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <div className="font-semibold">Admin Dashboard</div>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Avatar>
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 md:gap-8 md:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>New Messages</CardTitle>
                <CardDescription>Messages awaiting response</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{newMessages.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Responded</CardTitle>
                <CardDescription>Messages with responses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {respondedMessages.length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Pending Applications</CardTitle>
                <CardDescription>Motivators awaiting approval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">
                    {applicationsLoading ? "..." : pendingApplications.length}
                  </div>
                  <Link href="/admin/applications">
                    <Button variant="outline" size="sm">
                      Review
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Response Rate</CardTitle>
                <CardDescription>Average response time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">12h</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Incoming Messages</CardTitle>
                <CardDescription>Select a message to respond</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No messages found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                          selectedMessageId === msg.id
                            ? "ring-2 ring-primary ring-offset-2"
                            : ""
                        } ${getMessageBackgroundColor(msg)}`}
                        onClick={() => selectMessage(msg.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={msg.hasResponse ? "outline" : "default"}>
                              {getMessageStatusText(msg)}
                            </Badge>
                            {!msg.hasResponse && (
                              <Badge variant="secondary" className="text-xs">
                                Admin Response Available
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            From: {getUserInfo(msg).fullName} (
                            {getUserInfo(msg).email})
                          </p>
                          <p className="mt-1 line-clamp-2">{msg.content}</p>
                          {msg.fileUrl && (
                            <div className="mt-2">
                              {(() => {
                                const { fileIcon, fileType, fileName, handleFileClick } = getFileDisplay(msg.fileUrl, true);
                                return (
                                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors cursor-pointer" onClick={handleFileClick}>
                                    <span className="text-blue-600">{fileIcon}</span>
                                    <span className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                      {fileType}: {fileName}
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                          {msg.hasResponse && msg.response && (
                            <div className="mt-2 p-2 bg-muted/30 rounded">
                              <p className="text-xs font-medium text-muted-foreground">
                                Response by: {getResponderName(msg.response)}
                              </p>
                              <p className="text-xs line-clamp-1 mt-1">
                                {msg.response.content}
                              </p>
                              {msg.response.fileUrl && (
                                <div className="mt-2">
                                  {(() => {
                                    const { fileIcon, fileType, fileName, handleFileClick } = getFileDisplay(msg.response.fileUrl, false);
                                    return (
                                      <div className="inline-flex items-center gap-2 px-2 py-1 bg-green-50 border border-green-200 rounded-md cursor-pointer" onClick={handleFileClick}>
                                        <span className="text-green-600">{fileIcon}</span>
                                        <span className="text-xs text-green-600 hover:text-green-800 font-medium">
                                          Response {fileType}: {fileName}
                                        </span>
                                      </div>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Respond to Message</CardTitle>
                <CardDescription>
                  {selectedMessageId
                    ? selectedMessage?.hasResponse
                      ? "This message has already been responded to"
                      : "Provide support and guidance to this user"
                    : "Select a message from the left to respond"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedMessageId ? (
                  <div className="space-y-4">
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge variant="outline">
                            {getUserInfo(selectedMessage).fullName}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {getUserInfo(selectedMessage).email}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {selectedMessage
                            ? new Date(
                                selectedMessage.date
                              ).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                      <p className="mt-2">{selectedMessage?.content}</p>
                      {selectedMessage?.fileUrl && (
                        <div className="mt-2">
                          {(() => {
                            const { fileIcon, fileType, fileName, handleFileClick } = getFileDisplay(selectedMessage.fileUrl, true);
                            return (
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors cursor-pointer" onClick={handleFileClick}>
                                <span className="text-blue-600">{fileIcon}</span>
                                <span className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                  {fileType}: {fileName}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* Show motivator response if available */}
                      {selectedMessage?.hasResponse &&
                        selectedMessage?.response && (
                          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-blue-800">
                                Response by:{" "}
                                {getResponderName(selectedMessage.response)}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {selectedMessage.response.date
                                  ? new Date(
                                      selectedMessage.response.date
                                    ).toLocaleDateString()
                                  : ""}
                              </span>
                            </div>
                            <p className="text-sm text-blue-700">
                              {selectedMessage.response.content}
                            </p>
                            {selectedMessage.response.fileUrl && (
                              <div className="mt-2">
                                {(() => {
                                  const { fileIcon, fileType, fileName, handleFileClick } = getFileDisplay(selectedMessage.response.fileUrl, false);
                                  return (
                                    <div className="inline-flex items-center gap-2 px-2 py-1 bg-green-50 border border-green-200 rounded-md cursor-pointer" onClick={handleFileClick}>
                                      <span className="text-green-600">{fileIcon}</span>
                                      <span className="text-xs text-green-600 hover:text-green-800 font-medium">
                                        Response {fileType}: {fileName}
                                      </span>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        )}
                    </div>

                    {/* Only show response form if message doesn't have a response */}
                    {!selectedMessage?.hasResponse ? (
                      <form
                        onSubmit={handleSubmitResponse}
                        className="space-y-4"
                      >
                        <div className="grid gap-2">
                          <label htmlFor="response">Your Response</label>
                          <Textarea
                            id="response"
                            placeholder="Type your supportive response here..."
                            className="min-h-32"
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            disabled={!selectedMessageId}
                          />
                        </div>
                        <div className="grid gap-2">
                          <label htmlFor="file">Attach File (optional)</label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="file"
                              type="file"
                              className="hidden"
                              onChange={handleFileChange}
                              disabled={!selectedMessageId}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                document.getElementById("file")?.click()
                              }
                              disabled={!selectedMessageId}
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              {selectedFile ? selectedFile.name : "Choose File"}
                            </Button>
                            {selectedFile && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedFile(null)}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Supported formats: JPG, PNG, GIF, MP3, MP4, PDF (max
                            10MB)
                          </p>
                        </div>
                        <Button
                          type="submit"
                          disabled={
                            isSubmitting ||
                            !selectedMessageId ||
                            (!response.trim() && !selectedFile)
                          }
                          className="w-full"
                        >
                          {isSubmitting ? "Sending..." : "Send Response"}
                        </Button>
                      </form>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">
                          This message has already been responded to by{" "}
                          {getResponderName(selectedMessage.response)}.
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          You can view the response above.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed">
                    <div className="text-center">
                      <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
                      <h3 className="mt-2 text-lg font-semibold">
                        No Message Selected
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Select a message from the left to respond
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
