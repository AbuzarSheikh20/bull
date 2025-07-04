import { toast } from "sonner";
import router from "next/router";
import { apiClient } from "./api-client";
import { User, UserData, Response } from "@/types/user";

export type Message = {
  id?: number;
  _id?: string; // MongoDB ObjectId
  content: string;
  fileUrl?: string;
  date?: string;
  createdAt?: string; // MongoDB timestamp
  userId: string | {
    _id: string;
    fullName: string;
    email: string;
    gender: string;
  };
  userGender?: string;
  hasResponse: boolean;
  // User who sent the message (alternative field name)
  user?: {
    _id: string;
    fullName: string;
    email: string;
    gender: string;
  };
  response?: {
    content: string;
    date?: string;
    createdAt?: string; // MongoDB timestamp
    fileUrl?: string;
    // Motivator who responded
    motivatorId?: {
      _id: string;
      fullName: string;
      email: string;
    };
  };
  status?: "new" | "responded";
  messages: Array<{
    id?: number;
    content: string;
    fileUrl?: string;
    date: string;
    motivatorId?: string;
  }>;
};

export type User = {
  id: number | string;
  email: string;
  fullName: string;
  name?: string;
  gender?: string;
  role: "client" | "motivator" | "admin";
  status?: "active" | "inactive" | "pending";
  joinDate?: string;
  messageCount?: number;
  responseCount?: number;
  bio: string;
  specialities: string;
  profilePicture?: string;
  profilePhoto?: string;
};

// function to get userData from localstorage
export function getUserData() {
  if (typeof window === "undefined") {
    return null;
  }
  const token = localStorage.getItem("token");
  if (!token) {
    return null;
  }

  try {
    const userData =
      localStorage.getItem("userData") || localStorage.getItem("user");
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error("Error parsing user data: ", error);
    return null;
  }
}

export async function getMessages(): Promise<Message[]> {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/api/v1/";

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${apiUrl}messages/user-messages`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`Error details: ${errorText}`);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data as Message[];
  } catch (error) {
    console.error("Error fetching messages: ", error);
    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as any).message === "string" &&
      (error as any).message.includes("jwt expired")
    ) {
      toast.error("Session expired. Please login again.");
      router.push("/login");
    }
    return [];
  }
}

export async function sendMessage(
  content: string,
  file?: File
): Promise<Message> {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/api/v1";
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    // if there's a file, we need to use FormData
    if (file) {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("file", file);
      const response = await fetch(`${apiUrl}messages`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error details: ${errorText}`);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } else {
      // No file just send JSON
      const response = await fetch(`${apiUrl}messages`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error details: ${errorText}`);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    }
  } catch (error) {
    console.error("Error sending message: ", error);
    throw error instanceof Error ? error : new Error("Error sending message");
  }
}

export const sendResponse = async (
  messageId: number,
  content: string,
  file?: File
): Promise<Response> => {
  const formData = new FormData();
  formData.append("content", content);
  formData.append("messageId", messageId.toString());
  if (file) {
    formData.append("file", file);
  }

  const response = await apiClient.post("/responses", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const updateMotivatorProfile = async (profileData: {
  fullName?: string;
  gender?: string;
  bio?: string;
  specialities?: string;
}): Promise<User> => {
  const response = await apiClient.put("/users/profile", profileData);
  return response.data;
};
