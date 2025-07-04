// This is a utility to help debug authentication issues
// You can import and use this in any component to check auth state

export function debugAuth() {
  if (typeof window === "undefined") {
    console.log("Running on server - no auth data available")
    return
  }

  console.log("=== AUTH DEBUG INFO ===")

  // Check token
  const token = localStorage.getItem("token")
  console.log("Token exists:", !!token)
  if (token) {
    // Don't log the full token for security reasons
    console.log("Token preview:", `${token.substring(0, 10)}...`)

    try {
      // Check if token is valid JWT format
      const parts = token.split(".")
      if (parts.length !== 3) {
        console.warn("Token does not appear to be a valid JWT (should have 3 parts)")
      } else {
        const payload = JSON.parse(atob(parts[1]))
        console.log("Token payload:", payload)
        console.log("Token expiry:", new Date(payload.exp * 1000).toLocaleString())
        console.log("Token expired:", payload.exp * 1000 < Date.now())
      }
    } catch (e) {
      console.warn("Error parsing token:", e)
    }
  }

  // Check user data
  const userData = localStorage.getItem("userData") || localStorage.getItem("user")
  console.log("User data exists:", !!userData)
  if (userData) {
    try {
      const user = JSON.parse(userData)
      console.log("User ID:", user.id || user._id)
      console.log("User role:", user.role)
      console.log("User status:", user.status)
    } catch (e) {
      console.warn("Error parsing user data:", e)
    }
  }

  console.log("=== END AUTH DEBUG INFO ===")
}

// Export a function to check token validity
export function isTokenExpired(): boolean {
  if (typeof window === "undefined") {
    return true
  }

  const token = localStorage.getItem("token")
  if (!token) return true

  try {
    const parts = token.split(".")
    if (parts.length !== 3) return true

    const payload = JSON.parse(atob(parts[1]))
    return payload.exp * 1000 < Date.now()
  } catch (e) {
    console.warn("Error checking token expiry:", e)
    return true
  }
}
