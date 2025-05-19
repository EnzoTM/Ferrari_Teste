"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface UserData {
  fullName: string
  email: string
  phone: string
}

export default function AccountForm() {
  const [userData, setUserData] = useState<UserData>({
    fullName: "",
    email: "",
    phone: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const { toast } = useToast()

  // Load user data from localStorage
  useEffect(() => {
    const storedUserData = localStorage.getItem("userData")
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData))
    } else {
      // Definir dados padrão
      const defaultData = {
        fullName: "Carlos Ferrari",
        email: "carlos@ferrari.com",
        phone: "+55 (16) 99999-8888",
      }
      setUserData(defaultData)
      localStorage.setItem("userData", JSON.stringify(defaultData))
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUserData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = () => {
    // Save user data to localStorage
    localStorage.setItem("userData", JSON.stringify(userData))
    setIsEditing(false)
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully",
    })
  }

  const validatePassword = () => {
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long")
      return false
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return false
    }

    return true
  }

  const handleChangePassword = () => {
    if (validatePassword()) {
      // In a real app, this would call an API to change the password
      // For demo purposes, we'll just show a success message
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setPasswordError("")
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully",
      })
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Personal Information</h2>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                value={userData.fullName}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={userData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" name="phone" value={userData.phone} onChange={handleInputChange} disabled={!isEditing} />
          </div>

          {isEditing && (
            <Button className="mt-4 bg-red-600 hover:bg-red-700" onClick={handleSaveProfile}>
              Save Changes
            </Button>
          )}
        </div>
      </div>

      <div className="border-t pt-8">
        <h2 className="mb-4 text-xl font-semibold">Change Password</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
          </div>
          <Button className="bg-red-600 hover:bg-red-700" onClick={handleChangePassword}>
            Change Password
          </Button>
        </div>
      </div>
    </div>
  )
}
