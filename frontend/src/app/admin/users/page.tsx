"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { MoreHorizontal, Search, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Home, LogOut, MessageSquare, Settings, Users, BarChart3, UserCheck } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

// User type robust for all user shapes
export type User = {
  _id: string;
  name?: string;
  fullName?: string;
  email: string;
  status: "active" | "inactive" | "pending";
  role: string;
  image?: string;
  profilePhoto?: string;
};

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteCountdown, setDeleteCountdown] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  // Simulate current admin id (replace with real auth context if available)
  const currentAdminId = typeof window !== 'undefined' ? localStorage.getItem('userId') || "" : "";
  const { logout } = useAuth ? useAuth() : { logout: () => {} };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get("/users");
        // Accept both res.data, res.data.data, and res.data.message (for array)
        let userList = [];
        if (Array.isArray(res.data)) {
          userList = res.data;
        } else if (Array.isArray(res.data.data)) {
          userList = res.data.data;
        } else if (Array.isArray(res.data.message)) {
          userList = res.data.message;
        }
        setUsers(userList);
      } catch {
        toast.error("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Helper to get display name
  const getDisplayName = (user: User) => user.fullName || user.name || "Unknown";

  // Helper to get email
  const getEmail = (user: User) => user.email || "No email";

  // Helper to get role
  const getRole = (user: User) => user.role || "No role";

  // Robust search: name, email, role
  const filteredUsers = Array.isArray(users)
    ? users
        .filter((user) => user.role !== 'admin') // Exclude admin users
        .filter((user) => {
          // Filter by role if selected
          if (roleFilter !== "all" && user.role !== roleFilter) return false;
          const query = searchQuery.toLowerCase();
          return (
            getDisplayName(user).toLowerCase().includes(query) ||
            getEmail(user).toLowerCase().includes(query) ||
            getRole(user).toLowerCase().includes(query)
          );
        })
    : [];

  const approveMotivator = async (id: string) => {
    try {
      await apiClient.get(`/users/${id}/approve`);
      toast.success("Motivator approved successfully");
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, status: "active" } : u))
      );
    } catch {
      toast.error("Failed to approve motivator");
    }
  };

  const rejectMotivator = async (id: string) => {
    try {
      await apiClient.get(`/users/${id}/reject`);
      toast.success("Motivator rejected successfully");
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch {
      toast.error("Failed to reject motivator");
    }
  };

  const deactivateUser = async (id: string) => {
    try {
      await apiClient.patch(`/users/${id}/status`, { status: "inactive" });
      toast.success("User deactivated");
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, status: "inactive" } : u))
      );
    } catch {
      toast.error("Failed to deactivate user");
    }
  };

  const activateUser = async (id: string) => {
    try {
      await apiClient.patch(`/users/${id}/status`, { status: "active" });
      toast.success("User activated");
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, status: "active" } : u))
      );
    } catch {
      toast.error("Failed to activate user");
    }
  };

  // Delete user logic
  const handleDeleteUser = (id: string) => {
    setDeleteUserId(id);
    setDeleteCountdown(10);
    setShowDeleteModal(true);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showDeleteModal && deleteCountdown > 0) {
      timer = setTimeout(() => setDeleteCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [showDeleteModal, deleteCountdown]);

  const confirmDeleteUser = async () => {
    if (!deleteUserId) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/users/${deleteUserId}`);
      toast.success("User deleted successfully");
      setUsers((prev) => prev.filter((u) => u._id !== deleteUserId));
      setShowDeleteModal(false);
      setDeleteUserId(null);
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar */}
      <div className="hidden w-64 flex-col bg-background p-4 shadow-sm md:flex">
        <div className="flex items-center gap-2 py-4">
          <div className="font-semibold">Admin Dashboard</div>
        </div>
        <nav className="flex-1 space-y-2 py-4">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/dashboard">
              <Home className="mr-2 h-4 w-4" /> Dashboard
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/messages">
              <MessageSquare className="mr-2 h-4 w-4" /> Messages
            </Link>
          </Button>
          <Button variant="secondary" className="w-full justify-start" asChild>
            <Link href="/admin/users">
              <Users className="mr-2 h-4 w-4" /> User Management
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/applications">
              <UserCheck className="mr-2 h-4 w-4" /> Motivator Applications
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/analytics">
              <BarChart3 className="mr-2 h-4 w-4" /> Analytics
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/settings">
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Link>
          </Button>
        </nav>
        <div className="border-t pt-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" /> Logout
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
          <h1 className="text-3xl font-bold mb-6">Admin Users</h1>

          {/* Filter by role */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex gap-2">
              <Button
                variant={roleFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setRoleFilter("all")}
              >
                All
              </Button>
              <Button
                variant={roleFilter === "client" ? "default" : "outline"}
                size="sm"
                onClick={() => setRoleFilter("client")}
              >
                Client
              </Button>
              <Button
                variant={roleFilter === "motivator" ? "default" : "outline"}
                size="sm"
                onClick={() => setRoleFilter("motivator")}
              >
                Motivator
              </Button>
            </div>
            {/* Search box */}
            <div className="flex items-center gap-2 max-w-sm flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name, email, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="h-8 w-8 p-0"
                >
                  <span className="sr-only">Clear search</span>×
                </Button>
              )}
            </div>
          </div>

          {loading ? (
            <p>Loading users...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Avatar</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!Array.isArray(users) || users.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No users found in the system.
                    </TableCell>
                  </TableRow>
                )}
                {Array.isArray(users) && users.length > 0 && filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No users match your search.
                    </TableCell>
                  </TableRow>
                )}
                {filteredUsers.length > 0 &&
                  filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <Avatar className="w-10 h-10">
                          {user.profilePhoto || user.image ? (
                            <Image
                              src={user.profilePhoto || user.image || ""}
                              alt={getDisplayName(user)}
                              width={40}
                              height={40}
                              style={{ objectFit: 'cover', borderRadius: '50%' }}
                            />
                          ) : (
                            <AvatarFallback>{getDisplayName(user)[0] || "U"}</AvatarFallback>
                          )}
                        </Avatar>
                      </TableCell>
                      <TableCell>{getDisplayName(user)}</TableCell>
                      <TableCell>{getEmail(user)}</TableCell>
                      <TableCell>
                        {user.status === "active" && <Badge variant="default">Active</Badge>}
                        {user.status === "inactive" && <Badge variant="outline">Inactive</Badge>}
                        {user.status === "pending" && <Badge variant="secondary">Pending</Badge>}
                        {!user.status && <Badge variant="secondary">Unknown</Badge>}
                      </TableCell>
                      <TableCell>{getRole(user)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-1">
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {user.status === "pending" && (
                              <>
                                <DropdownMenuItem onClick={() => approveMotivator(user._id)}>
                                  Approve Motivator
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => rejectMotivator(user._id)}>
                                  Reject Motivator
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            {user.status === "active" && (
                              <DropdownMenuItem onClick={() => deactivateUser(user._id)}>
                                Deactivate User
                              </DropdownMenuItem>
                            )}
                            {user.status === "inactive" && (
                              <DropdownMenuItem onClick={() => activateUser(user._id)}>
                                Activate User
                              </DropdownMenuItem>
                            )}
                            {/* Delete action for all users except self */}
                            {user._id !== currentAdminId && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteUser(user._id)}
                                  className="text-red-600 focus:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}

          {/* Delete confirmation modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-2 text-red-600">Delete User</h2>
                <p className="mb-4">Are you sure you want to delete this user? This action cannot be undone.</p>
                <p className="mb-4 text-sm text-muted-foreground">
                  <strong>Alert:</strong> Deleting this user is permanent.<br />
                  You can confirm delete in <span className="font-bold">{deleteCountdown}</span> seconds.
                </p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={confirmDeleteUser}
                    disabled={deleteCountdown > 0 || deleting}  
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
