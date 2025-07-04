export interface User {
  id: string;
  _id?: string;
  email: string;
  fullName: string;
  name?: string;
  gender: string;
  role: "client" | "motivator" | "admin";
  status: "active" | "inactive" | "pending";
  joinDate?: string;
  messageCount?: number;
  responseCount?: number;
  bio?: string;
  specialities?: string;
  profilePicture?: string;
  profilePhoto?: string;
}

export interface UserData {
  fullName: string;
  email: string;
  password: string;
  gender: string;
  role: "client" | "motivator";
  bio?: string;
  specialities?: string;
  experience?: string;
  reason?: string;
}

export interface Response {
  id: string;
  content: string;
  messageId: number;
  motivatorId: string | User;
  date: string;
  fileUrl?: string;
} 