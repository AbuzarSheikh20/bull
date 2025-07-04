"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { debugAuth } from "@/lib/auth-debug"
import { useAuth } from "@/contexts/auth-context"

export function AuthDebugger() {
  const { user, isAuthenticated } = useAuth()
  const [showDebugInfo, setShowDebugInfo] = useState(false)

  const runDebug = () => {
    debugAuth()
    setShowDebugInfo(true)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={runDebug}
        className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300"
      >
        Debug Auth
      </Button>

      {showDebugInfo && (
        <div className="mt-2 p-4 bg-black/80 text-white rounded-md text-xs max-w-md overflow-auto max-h-80">
          <div className="flex justify-between mb-2">
            <h3 className="font-bold">Auth Debug Info</h3>
            <button onClick={() => setShowDebugInfo(false)} className="text-gray-400 hover:text-white">
              ✕
            </button>
          </div>
          <div>
            <p>
              <strong>Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}
            </p>
            <p>
              <strong>User ID:</strong> {user?.id || "None"}
            </p>
            <p>
              <strong>Role:</strong> {user?.role || "None"}
            </p>
            <p>
              <strong>Token:</strong> {localStorage.getItem("token") ? "Present" : "Missing"}
            </p>
            <p className="mt-2 text-yellow-300">Check console for more details</p>
          </div>
        </div>
      )}
    </div>
  )
}
