"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Upload } from "lucide-react"

interface ProfilePhotoUploadProps {
  onPhotoChange: (file: File | null) => void
  currentPhoto?: string
  userName?: string
}

export function ProfilePhotoUpload({ onPhotoChange, currentPhoto, userName }: ProfilePhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentPhoto || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      onPhotoChange(file)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="w-24 h-24">
          {preview ? (
            <AvatarImage src={preview || "/placeholder.svg"} alt="Profile preview" />
          ) : (
            <AvatarFallback className="text-lg">
              {userName ? getInitials(userName) : <Camera className="w-8 h-8" />}
            </AvatarFallback>
          )}
        </Avatar>
        <Button
          type="button"
          size="sm"
          className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
          onClick={handleButtonClick}
        >
          <Camera className="w-4 h-4" />
        </Button>
      </div>

      <div className="text-center">
        <Label htmlFor="profilePhoto" className="text-sm font-medium">
          Profile Photo
        </Label>
        <p className="text-xs text-muted-foreground mt-1">Upload a photo or we&apos;ll create one for you</p>
      </div>

      <input
        ref={fileInputRef}
        id="profilePhoto"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <Button type="button" variant="outline" size="sm" onClick={handleButtonClick} className="flex items-center gap-2">
        <Upload className="w-4 h-4" />
        Choose Photo
      </Button>
    </div>
  )
}
