"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { type Message, getMessages, sendResponse } from "../../../lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

function MotivatorMessages() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState("new");
  const [responseContent, setResponseContent] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await getMessages();
        setMessages(data);
      } catch {
        toast("Failed to load messages, Please try again");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const handleSendResponse = async () => {
    if (!selectedMessage || !responseContent.trim()) return;

    setResponding(true);

    try {
      const response = await sendResponse(
        selectedMessage.id,
        responseContent,
        selectedFile || undefined
      );

      setMessages(
        messages.map((msg) =>
          msg.id === selectedMessage.id
            ? { ...msg, hasResponse: true, response }
            : msg
        )
      );

      setResponseContent("");
      setSelectedMessage(null);
      setSelectedFile(null);

      toast("Your response has been sent successfully");
    } catch {
      toast("Failed to send response, Please try again");
    } finally {
      setResponding(false);
    }
  };

  const newMessages = Array.isArray(messages)
    ? messages.filter((msg) => !msg.hasResponse)
    : [];

  const respondedMessages = Array.isArray(messages)
    ? messages.filter((msg) => {
        // Only show messages that the current motivator responded to
        if (!msg.hasResponse || !msg.response) return false;
        
        const responderId = typeof msg.response.motivatorId === 'object' 
          ? msg.response.motivatorId._id 
          : msg.response.motivatorId;
        
        return user?.role === 'motivator' && user?.id === responderId;
      })
    : [];

  // Helper function to get message background color based on response status
  const getMessageBackgroundColor = (message: Message) => {
    if (!message.hasResponse) {
      return "bg-red-50 border-red-200 hover:bg-red-100 cursor-pointer"; // Red for no response
    }
    
    if (message.response) {
      // Check if the current user responded to this message
      const responderId = typeof message.response.motivatorId === 'object' 
        ? message.response.motivatorId._id 
        : message.response.motivatorId;
      
      if (user?.role === 'motivator' && user?.id === responderId) {
        return "bg-green-50 border-green-200 hover:bg-green-100 cursor-pointer"; // Green for current motivator's response
      } else {
        return "bg-yellow-50 border-yellow-200 hover:bg-yellow-100 cursor-pointer"; // Yellow for admin or other motivator's response
      }
    }
    
    return "bg-gray-50 border-gray-200 hover:bg-gray-100 cursor-pointer"; // Default fallback
  };

  // Helper function to get message status text
  const getMessageStatusText = (message: Message) => {
    if (!message.hasResponse) {
      return "No Response";
    }
    
    if (message.response) {
      // Check if the current user responded to this message
      const responderId = typeof message.response.motivatorId === 'object' 
        ? message.response.motivatorId._id 
        : message.response.motivatorId;
      
      if (user?.role === 'motivator' && user?.id === responderId) {
        return "You Responded";
      } else {
        return "Responded by Others";
      }
    }
    
    return "Unknown Status";
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

  return (
    <>
      <div className="mx-auto p-4 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2">
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>
                  {" "}
                  View and respond to messages from users who match your gender
                  ({user?.gender})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs
                  defaultValue="new"
                  value={activeTab}
                  onValueChange={setActiveTab}
                >
                  <TabsList className="grid w-full grid-cols-2 p-1 mb-4 bg-muted/50 rounded-lg cursor-pointer">
                    <TabsTrigger 
                      value="new"
                      className={`px-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer ${
                        activeTab === "new" 
                          ? "bg-primary text-primary-foreground shadow-sm" 
                          : "bg-transparent hover:bg-muted/80 text-muted-foreground"
                      }`}
                    >
                      New Messages{" "}
                      {newMessages.length > 0 && `(${newMessages.length})`}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="responded"
                      className={`px-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer ${
                        activeTab === "responded" 
                          ? "bg-primary text-primary-foreground shadow-sm" 
                          : "bg-transparent hover:bg-muted/80 text-muted-foreground"
                      }`}
                    >
                      Responded {respondedMessages.length > 0 && `(${respondedMessages.length})`}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="new" className="mt-0 cursor-pointer">
                    {loading ? (
                      <div className="text-center py-4">
                        Loading Messages...
                      </div>
                    ) : newMessages.length === 0 ? (
                      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
                        <p className="text-muted-foreground">
                          No New Messages
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {newMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                              selectedMessage?.id === message.id
                                ? "ring-2 ring-primary ring-offset-2"
                                : ""
                            } ${getMessageBackgroundColor(message)}`}
                            onClick={() => setSelectedMessage(message)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant={message.hasResponse ? "outline" : "default"}>
                                  {getMessageStatusText(message)}
                                </Badge>
                                {!message.hasResponse && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Response Available
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(message.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="mt-2">
                              <p className="text-sm font-medium text-muted-foreground">
                                From: Anonymous User
                              </p>
                              <p className="mt-1 line-clamp-2">
                                {message.content}
                              </p>
                              {message.fileUrl && (
                                <div className="mt-2">
                                  {(() => {
                                    const { fileIcon, fileType, fileName, handleFileClick } = getFileDisplay(message.fileUrl, true);
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
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="responded" className="mt-0 cursor-pointer">
                    {loading ? (
                      <div className="text-center py-4">
                        Loading Messages...
                      </div>
                    ) : respondedMessages.length === 0 ? (
                      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
                        <p className="text-muted-foreground">
                          No responded Messages
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {respondedMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                              selectedMessage?.id === message.id
                                ? "ring-2 ring-primary ring-offset-2"
                                : ""
                            } ${getMessageBackgroundColor(message)}`}
                            onClick={() => setSelectedMessage(message)}
                          >
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">
                                {getMessageStatusText(message)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(message.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="mt-2">
                              <p className="text-sm font-medium text-muted-foreground">
                                From: Anonymous User
                              </p>
                              <p className="mt-1 line-clamp-2">
                                {message.content}
                              </p>
                              {message.fileUrl && (
                                <div className="mt-2">
                                  {(() => {
                                    const { fileIcon, fileType, fileName, handleFileClick } = getFileDisplay(message.fileUrl, true);
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
                              {message.hasResponse && message.response && (
                                <div className="mt-2 p-2 bg-white/50 rounded border">
                                  <p className="text-xs font-medium text-muted-foreground">
                                    Response by: You
                                  </p>
                                  <p className="text-xs line-clamp-1 mt-1">
                                    {message.response.content}
                                  </p>
                                  {message.response.fileUrl && (
                                    <div className="mt-2">
                                      {(() => {
                                        const { fileIcon, fileType, fileName, handleFileClick } = getFileDisplay(message.response.fileUrl, false);
                                        return (
                                          <div className="inline-flex items-center gap-2 px-2 py-1 bg-green-50 border border-green-200 rounded-md cursor-pointer" onClick={handleFileClick}>
                                            <span className="text-green-600">{fileIcon}</span>
                                            <span className="text-xs text-green-600 hover:text-green-800 font-medium">
                                              Your {fileType}: {fileName}
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
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="md:w-1/2">
            <Card>
              <CardHeader>
                <CardTitle>Respond to Message</CardTitle>
                <CardDescription>
                  {selectedMessage
                    ? "Write your response to the selected message"
                    : "Select a message from the left to respond"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedMessage ? (
                  <div className="space-y-4">
                    <div className="rounded-lg border bg-muted/50 p-4 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            From: Anonymous User
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(selectedMessage.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2">{selectedMessage.content}</p>

                      {/* Show attached file if available */}
                      {selectedMessage.fileUrl && (
                        <div className="mt-3">
                          {(() => {
                            const { fileIcon, fileType, fileName, handleFileClick } = getFileDisplay(selectedMessage.fileUrl, true);
                            return (
                              <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors cursor-pointer" onClick={handleFileClick}>
                                <span className="text-blue-600">{fileIcon}</span>
                                <span className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                  Client's {fileType}: {fileName}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* Show response if available */}
                      {selectedMessage.hasResponse && selectedMessage.response && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-blue-800">
                              Response by: You
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {selectedMessage.response.date
                                ? new Date(selectedMessage.response.date).toLocaleDateString()
                                : "Recently"
                              }
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
                                      Your {fileType}: {fileName}
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <Textarea
                      placeholder="Write your response here..."
                      className="min-h-[150px] cursor-pointer"
                      value={responseContent}
                      onChange={(e) => setResponseContent(e.target.value)}
                    />

                    {/* To Attach For file */}
                    <div className="space-y-2">
                      <Label htmlFor="file-upload">
                        Attach File (Optional)
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="file-upload"
                          type="file"
                          onChange={(e) =>
                            setSelectedFile(e.target.files?.[0] || null)
                          }
                          accept="image/*,.pdf,.doc,.docx,.txt"
                          className="flex-1 cursor-pointer"
                        />
                        {selectedFile && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => setSelectedFile(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {selectedFile && (
                        <p className="text-sm text-muted-foreground">
                          Selected: {selectedFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-mute-foreground">
                    Select a message from the left panel to respond
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setSelectedMessage(null)}
                  disabled={!selectedMessage}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendResponse}
                  className="cursor-pointer"
                  disabled={!selectedMessage || !responseContent || responding}
                >
                  {responding ? "Sending..." : "Send Response"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

export default function MotivatorMessagesPage() {
  return (
    <ProtectedRoute allowedRoles={["motivator"]}>
      <MotivatorMessages />
    </ProtectedRoute>
  );
}
