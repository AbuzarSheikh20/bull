"use client"

import { useRouter } from "next/navigation"
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserData } from "@/types/user";
import apiClient from "@/lib/api-client"
import { toast } from "sonner"

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  setUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<User | undefined>
  signup: (userData: UserData) => Promise<User | undefined>
  logout: () => Promise<void>
  setError: React.Dispatch<React.SetStateAction<string | null>>
  setIsAuthenticated: (isAuthenticated: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper function to extract user data from various response structures
const extractUserDataFromResponse = (response: unknown): unknown => {
  console.log("🔍 Full backend response structure:", {
    status: (response as any)?.status,
    statusText: (response as any)?.statusText,
    data: (response as any)?.data,
    headers: (response as any)?.headers,
  })

  // Try different possible structures
  const possiblePaths = [
    (response as any)?.data?.data, // response.data.data
    (response as any)?.data?.user, // response.data.user
    (response as any)?.data?.message, // <-- ADDED: response.data.message
    (response as any)?.data, // response.data
    (response as any)?.user, // response.user
    response, // response itself
  ]

  for (let i = 0; i < possiblePaths.length; i++) {
    const candidate = possiblePaths[i]
    console.log(`🔍 Checking path ${i}:`, candidate)

    if (candidate && typeof candidate === "object") {
      // Check if this looks like user data (has email or _id or id)
      if (candidate.email || candidate._id || candidate.id) {
        console.log(`✅ Found user data at path ${i}:`, candidate)
        return candidate
      }
    }
  }

  console.log("❌ No user data found in any expected path")
  console.log("🔍 Available keys in response.data:", Object.keys((response as any)?.data || {}))
  return null
}

// Helper function to normalize user data with better debugging
const normalizeUserData = (userData: unknown): User => {
  // console.log(`🔍 Normalizing user data from ${source}:`, userData)

  if (!userData || typeof userData !== "object") {
    console.error(`❌ Invalid user data provided to normalize:`, userData)
    throw new Error(`Invalid user data: ${typeof userData}`)
  }

  const normalized = {
    id: (userData as any)._id || (userData as any).id || "",
    _id: (userData as any)._id,
    email: (userData as any).email || "",
    fullName: (userData as any).fullName || (userData as any).name || "",
    name: (userData as any).name || (userData as any).fullName,
    gender: (userData as any).gender || "male",
    role: ((userData as any).role as "client" | "motivator" | "admin") || "client",
    status: ((userData as any).status as "active" | "inactive" | "pending") || "active",
    joinDate: (userData as any).joinDate,
    messageCount: (userData as any).messageCount,
    responseCount: (userData as any).responseCount,
    bio: (userData as any).bio || "",
    specialities: (userData as any).specialities || "",
    profilePicture: (userData as any).profilePicture || (userData as any).profilePhoto,
  }

  // console.log(`✅ Normalized user data:`, normalized)

  // Validate critical fields
  if (!normalized.id || !normalized.email) {
    console.error(`❌ Critical user data missing after normalization:`, {
      hasId: !!normalized.id,
      hasEmail: !!normalized.email,
      originalData: userData,
      normalized: normalized,
    })
    throw new Error(`Critical user data missing: ID=${!!normalized.id}, Email=${!!normalized.email}`)
  }

  return normalized
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  // Set isClient to true after component mounts to prevent hydration mismatch
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      try {
        const storedToken = localStorage.getItem("token")
        const storedUser = localStorage.getItem("user") || localStorage.getItem("userData")

        console.log("🔍 Checking auth - Token exists:", !!storedToken)
        console.log("🔍 Checking auth - User data exists:", !!storedUser)

        if (!storedToken || !storedUser) {
          console.log("❌ No token or user data found, user not authenticated")
          setUser(null)
          setIsAuthenticated(false)
          setIsLoading(false)
          return
        }

        console.log("✅ Token and user data found, verifying with backend...")

        // Try to verify with backend first
        try {
          const response = await apiClient.get("/users/me")
          console.log("✅ Backend verification successful:", response.data)

          // Extract user data from response
          const backendUserData = extractUserDataFromResponse(response)

          if (backendUserData) {
            console.log("✅ Extracted user data:", backendUserData)

            try {
              const normalizedUser = normalizeUserData(backendUserData)

              setUser(normalizedUser)
              setIsAuthenticated(true)
              localStorage.setItem("user", JSON.stringify(normalizedUser))
              localStorage.setItem("userData", JSON.stringify(normalizedUser))

              console.log("✅ User authenticated with fresh data:", normalizedUser)
            } catch (normalizeError) {
              console.error("❌ Failed to normalize user data:", normalizeError)
              throw normalizeError
            }
          } else {
            console.warn("⚠️ No user data found in backend response, using stored data")
            // Use stored data as fallback
            const userData = JSON.parse(storedUser)
            const normalizedUser = normalizeUserData(userData)
            setUser(normalizedUser)
            setIsAuthenticated(true)
            console.log("✅ Using stored user data:", normalizedUser)
          }
        } catch (backendError: unknown) {
          console.error("❌ Backend verification failed:", backendError)

          // Check if it's a 401 (unauthorized) error
          if (
            typeof backendError === "object" &&
            backendError !== null &&
            "response" in backendError &&
            (backendError as { response?: { status: number } }).response?.status === 401
          ) {
            console.log("🔒 Token is invalid/expired, clearing auth data")
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            localStorage.removeItem("userData")
            setUser(null)
            setIsAuthenticated(false)
            return
          }

          // Backend failed for other reasons (network, server down, etc.), use stored data
          console.log("⚠️ Backend unavailable, using stored data as fallback...")

          try {
            const userData = JSON.parse(storedUser)
            console.log("🔍 Stored user data:", userData)

            const normalizedUser = normalizeUserData(userData)

            setUser(normalizedUser)
            setIsAuthenticated(true)
            console.log("✅ Using stored user data as fallback:", normalizedUser)
          } catch (parseError) {
            console.error("❌ Failed to parse stored user data:", parseError)
            // Clear invalid data
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            localStorage.removeItem("userData")
            setUser(null)
            setIsAuthenticated(false)
          }
        }
      } catch (error: unknown) {
        console.error("❌ Error during authentication check:", error)
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<User | undefined> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.post("auth/login", { email, password })
      console.log("Login response:", response.data)

      // Fix: Backend sends data in response.data.data, not response.data.message
      const { data } = response.data

      if (!data || !data.user) {
        throw new Error("Invalid login response: user data missing")
      }

      const normalizedUser = normalizeUserData(data.user)

      // Store token and user data
      localStorage.setItem("token", data.accessToken)
      localStorage.setItem("user", JSON.stringify(normalizedUser))
      localStorage.setItem("userData", JSON.stringify(normalizedUser))

      setUser(normalizedUser)
      setIsAuthenticated(true)

      toast(
        <div>
          <strong>Login Successful</strong>
          <div>Welcome back, {normalizedUser.fullName}!</div>
        </div>,
      )

      // Redirect based on role
      if (normalizedUser.role === "client") {
        router.push("/client/dashboard")
      } else if (normalizedUser.role === "motivator") {
        router.push("/motivator/dashboard")
      } else if (normalizedUser.role === "admin") {
        router.push("/admin/dashboard")
      }

      return normalizedUser
    } catch (error: unknown) {
      console.error("Login error:", error)
      let errorMessage = "Login failed"
      const resData = (error as any).response?.data

      if (typeof resData === "string" && resData.includes("Your motivator account is in pending approval")) {
        errorMessage = "Your motivator account is in pending approval"
      } else if (typeof resData === "object" && resData?.message) {
        errorMessage = resData.message
      } else if ((error as any).message) {
        errorMessage = (error as any).message
      }

      setError(errorMessage)
      toast.error(errorMessage)
      return undefined
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (userData: UserData) => {
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()

      // Add all user data to FormData
      formData.append("fullName", userData.fullName)
      formData.append("email", userData.email)
      formData.append("password", userData.password)
      formData.append("gender", userData.gender)

      // Ensure role is properly set and default to client if not specified
      const userRole = userData.role || "client"

      // Fix: Remove trailing slashes to match backend routes
      const endpoint = userRole === "motivator" ? "auth/register-motivator" : "auth/register-user"
      // console.log("🔍 Selected endpoint:", endpoint)

      formData.append("role", userRole)

      // Add motivator-specific fields if role is motivator
      if (userData.role === "motivator") {
        formData.append("bio", userData.bio || "")
        formData.append("experience", userData.experience || "")
        formData.append("specialities", userData.specialities || "")
        formData.append("reason", userData.reason || "")
      }

      // Add profile photo
      if (userData.profilePhoto) {
        formData.append("profilePhoto", userData.profilePhoto)
      } else {
        const defaultPhoto = await createDefaultAvatar(userData.fullName, userData.gender)
        formData.append("profilePhoto", defaultPhoto)
      }

      const response = await apiClient.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      // Fix: Backend sends user data in response.data.data.user, not response.data.data
      const { data } = response.data
      const normalizedUser = normalizeUserData(data.user)

      localStorage.setItem("token", data.accessToken)
      localStorage.setItem("user", JSON.stringify(normalizedUser))
      localStorage.setItem("userData", JSON.stringify(normalizedUser))

      setUser(normalizedUser)
      setIsAuthenticated(true)

      toast(
        userData.role === "motivator" ? (
          <>
            <strong>Application Submitted</strong>
            <div>Application for Review</div>
          </>
        ) : (
          <>
            <strong>Account Verified</strong>
            <div>Your account has been created successfully</div>
          </>
        ),
      )

      if (normalizedUser.role === "client") {
        router.push("client/dashboard/")
      } else if (normalizedUser.role === "motivator") {
        router.push("motivator/dashboard/")
      } else if (normalizedUser.role === "admin") {
        router.push("admin/dashboard")
      }

      return normalizedUser
    } catch (error: unknown) {
      console.error("Signup error:", error)
      const errorMessage = (error as any).response?.data?.message || "Registration failed"
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)

    try {
      await apiClient.post("auth/logout")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Always clear local data regardless of API call success
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      localStorage.removeItem("userData")

      setUser(null)
      setIsAuthenticated(false)
      setIsLoading(false)

      toast(
        <>
          <strong>Logout Successful</strong>
          <div>You have been logged out successfully</div>
        </>,
      )

      router.push("/")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        signup,
        error,
        setError,
        login,
        logout,
        setUser,
        setIsAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

async function createDefaultAvatar(fullName: string, gender: string): Promise<File> {
  const bgColor = gender === "male" ? "#4F8EF7" : gender === "female" ? "#F76FA1" : "#CCCCCC"
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const svg = `
    <svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}" />
      <text x="50%" y="55%" fontSize="48" fontFamily="Arial, sans-serif" fill="#fff" textAnchor="middle" alignmentBaseline="middle">${initials}</text>
    </svg>
  `
  const blob = new Blob([svg], { type: "image/svg+xml" })
  return new File([blob], "avatar.svg", { type: "image/svg+xml" })
}
