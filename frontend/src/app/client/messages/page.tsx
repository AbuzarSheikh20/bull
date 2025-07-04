"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { toast } from "sonner";
import { type Message, getMessages, sendMessage } from "../../../lib/api";
import { useAuth } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Paperclip,
  Search,
  X,
  CheckCircle,
  Clock,
  RefreshCw,
  Send,
  MessageSquare,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

function ClientMessages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]); // Telling messages will be an array of 'Message' objects.
  const [loading, setLoading] = useState(true); // So, we can write "useState<boolean>(true)" also but ts understood bcz of 'true'
  const [activeTab, setActiveTab] = useState("newMessage");
  const [messageContent, setMessageContent] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [followUpContent, setFollowUpContent] = useState("");
  const [sendingFollowUp, setSendingFollowUp] = useState(false);
  const [selectedFollowUpFile, setSelectedFollowUpFile] = useState<File | null>(
    null
  );
  const [fileError, setFileError] = useState("");
  const [previewFile, setPreviewFile] = useState<{ url: string; type: string; message: string } | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await getMessages();
        console.log("Fetched messages:", data); // Check this log in browser console

        setMessages(data);
      } catch {
        toast.error("Failed to load messages, Please try again");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;
    setSending(true);
    try {
      const newMessage = await sendMessage(
        messageContent,
        selectedFile || undefined
      );

      // Add new message to the local state (local state means that particular component, i.e. setMessages here)
      setMessages([newMessage, ...messages]); // send message at the top of list
      // setMessages([...messages, newMessage]);   // send message at the bottom of list

      // Clear the message content
      setMessageContent("");
      setSelectedFile(null);

      // Switch to history tab
      setActiveTab("history");

      toast.message("Message Sent successfully!");
    } catch {
      toast.message("Failed to send message, Please try again");
    } finally {
      setSending(false);
    }
  };

  // Helper function to check if a message has a response
  const hasResponse = (message: Message) => {
    return (
      message.hasResponse || message.response || message.status === "responded"
    );
  };

  const handleSendFollowUp = async () => {
    if (!followUpContent.trim() || !selectedMessage) return;

    setSendingFollowUp(true);
    try {
      const newMessage = await sendMessage(
        followUpContent,
        selectedFollowUpFile || undefined
      );

      // Add new message to the local state
      setMessages([newMessage, ...messages]);

      // Clear the form
      setFollowUpContent("");
      setSelectedFollowUpFile(null);
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
    setSelectedFollowUpFile(null);
  };

  const closeFollowUpModal = () => {
    setSelectedMessage(null);
    setFollowUpContent("");
    setSelectedFollowUpFile(null);
  };

  const filteredMessages = Array.isArray(messages)
    ? messages.filter((msg) =>
        msg.content?.toLowerCase().includes((searchQuery || "").toLowerCase())
      )
    : [];

  return (
    <>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Messages</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="w-full rounded-md pl-8 md:w-[300px]"
                type="search"
                placeholder="Search Messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-2 rounded-md">
            <TabsTrigger
              className={
                `cursor-pointer p-1 rounded-md font-bold ` +
                (activeTab === "newMessage" ? "bg-black text-white" : "hover:bg-white")
              }
              value="newMessage"
            >
              New Message
            </TabsTrigger>
            <TabsTrigger
              className={
                `cursor-pointer p-1 rounded-md font-bold ` +
                (activeTab === "history" ? "bg-black text-white" : "hover:bg-white")
              }
              value="history"
            >
              Message History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="newMessage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Send New Message</CardTitle>
                <CardDescription>
                  Write a message to get support from a motivator
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Modern message input with send button */}
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <div className="relative flex items-center">
                    <Textarea
                      id="message"
                      placeholder="Write your message here..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      className="min-h-[80px] pr-12"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (messageContent.trim() && !sending) handleSendMessage();
                        }
                      }}
                      disabled={sending}
                    />
                    <Button
                      type="button"
                      size="icon"
                      className="absolute right-2 bottom-2"
                      onClick={handleSendMessage}
                      disabled={!messageContent.trim() || sending || !!fileError}
                    >
                      {sending ? (
                        <span className="animate-spin rounded-full border-2 border-t-transparent border-white h-5 w-5 inline-block"></span>
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                  {sending && selectedFile && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <span className="animate-spin rounded-full border-2 border-t-transparent border-primary h-5 w-5 inline-block"></span>
                      Uploading file, please wait…
                    </div>
                  )}
                </div>

                {/* File attachment */}
                <div className="space-y-2">
                  <Label htmlFor="file" className="text-sm font-medium">
                    Attach File (JPG, audio, video)
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="file"
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          if (file) {
                            if (file.size > 10 * 1024 * 1024) {
                              setFileError("File size is too large. Maximum allowed is 10 MB.");
                              e.target.value = "";
                              setSelectedFile(null);
                              return;
                            }
                            if (file.type.startsWith("video/") && file.size > 10 * 1024 * 1024) {
                              setFileError("Video file size must be 10 MB or less.");
                              e.target.value = "";
                              setSelectedFile(null);
                              return;
                            }
                            setFileError("");
                          }
                          setSelectedFile(file);
                        }}
                        accept="image/jpeg,audio/*,video/*"
                        className="pr-10"
                        disabled={sending}
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
                  {fileError && (
                    <div className="text-red-600 text-sm font-medium mt-1">{fileError}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">
                  Loading messages...
                </p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No messages found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "No messages match your search."
                      : "You haven't sent any messages yet."}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setActiveTab("newMessage")}>
                      Send Your First Message
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredMessages.map((message) => (
                  <Card key={message.id || message._id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-muted-foreground">
                            {new Date(
                              message.date || message.createdAt || Date.now()
                            ).toLocaleDateString()}
                          </div>
                          {hasResponse(message) ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                Responded
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-orange-600">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                Pending
                              </span>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openFollowUpModal(message)}
                        >
                          Add Message
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{message.content}</p>
                      {message.fileUrl && (
                        <div className="mt-2">
                          {message.fileUrl.match(/\.(jpg|jpeg|png)$/i) && (
                            <Button size="sm" variant="outline" onClick={() => setPreviewFile({ url: message.fileUrl, type: "image", message: message.content })}>
                              View Image
                            </Button>
                          )}
                          {message.fileUrl.match(/\.(mp3|wav|m4a)$/i) && (
                            <Button size="sm" variant="outline" onClick={() => setPreviewFile({ url: message.fileUrl, type: "audio", message: message.content })}>
                              Play Audio
                            </Button>
                          )}
                          {message.fileUrl.match(/\.(mp4|webm|ogg)$/i) && (
                            <Button size="sm" variant="outline" onClick={() => setPreviewFile({ url: message.fileUrl, type: "video", message: message.content })}>
                              Play Video
                            </Button>
                          )}
                          {!message.fileUrl.match(/\.(jpg|jpeg|png|mp3|wav|m4a|mp4|webm|ogg)$/i) && (
                            <Button size="sm" variant="outline" onClick={() => setPreviewFile({ url: message.fileUrl, type: "file", message: message.content })}>
                              View File
                            </Button>
                          )}
                        </div>
                      )}
                      {hasResponse(message) && message.response && (
                        <div
                          className="mt-4 p-3 bg-muted rounded-md cursor-pointer"
                          onClick={() => openFollowUpModal(message)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium">
                              Motivator Response
                            </span>
                          </div>
                          <p className="text-sm">{message.response.content}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
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
                <div className="bg-background p-3 rounded-md mt-3">
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium text-xs">
                      Motivator Response
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(
                        selectedMessage.response.date ||
                          selectedMessage.response.createdAt ||
                          Date.now()
                      ).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-sm">{selectedMessage.response.content}</p>
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
                        setSelectedFollowUpFile(file);
                      }}
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      className="pr-10"
                    />
                    <Paperclip className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {selectedFollowUpFile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFollowUpFile(null)}
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {selectedFollowUpFile && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Paperclip className="h-4 w-4" />
                    <span>
                      Selected: {selectedFollowUpFile.name} (
                      {(selectedFollowUpFile.size / 1024).toFixed(1)} KB)
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

      {/* File Preview Centered Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-lg p-6 max-w-lg w-full flex flex-col items-center relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl font-bold"
              onClick={() => setPreviewFile(null)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="text-center text-base font-medium mb-4">{previewFile.message}</div>
            {previewFile.type === "image" && (
              <img src={String(previewFile.url)} alt="attachment" className="max-w-xs rounded" />
            )}
            {previewFile.type === "audio" && (
              <audio controls src={String(previewFile.url)} className="w-full" />
            )}
            {previewFile.type === "video" && (
              <video controls src={String(previewFile.url)} className="w-full max-w-xs rounded" />
            )}
            {previewFile.type === "file" && (
              <a href={String(previewFile.url)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Open File</a>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function ClientMessagesPage() {
  return (
    <ProtectedRoute allowedRoles={["client"]}>
      <ClientMessages />
    </ProtectedRoute>
  );
}
