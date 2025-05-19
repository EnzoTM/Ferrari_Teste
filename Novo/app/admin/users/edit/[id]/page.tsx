"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface UserData {
  id: string
  fullName: string
  email: string
  phone: string
  isAdmin: boolean
  createdAt: string
}

export default function EditUserPage() {
  const { id } = useParams()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    isAdmin: false,
  })
  const [originalEmail, setOriginalEmail] = useState("")
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()
  const { toast } = useToast()

  // Load user data
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("allUsers") || "[]")
    const user = users.find((u: UserData) => u.id === id)

    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        password: "",
        confirmPassword: "",
        isAdmin: user.isAdmin,
      })
      setOriginalEmail(user.email)
    } else {
      toast({
        title: "User not found",
        description: "The user you are trying to edit does not exist",
        variant: "destructive",
      })
      router.push("/admin/users")
    }

    setIsLoading(false)
  }, [id, router, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear errors when typing
    if (name === "email" || name === "password" || name === "confirmPassword") {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isAdmin: checked }))
  }

  const validateForm = () => {
    let valid = true
    const newErrors = { email: "", password: "", confirmPassword: "" }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
      valid = false
    }

    // Only validate password if it's being changed
    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters"
        valid = false
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
        valid = false
      }
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Get existing users
    const existingUsers = JSON.parse(localStorage.getItem("allUsers") || "[]")

    // Check if email already exists (but ignore the current user's email)
    if (formData.email !== originalEmail && existingUsers.some((user: UserData) => user.email === formData.email)) {
      setErrors((prev) => ({ ...prev, email: "This email is already in use" }))
      return
    }

    // Update user
    const updatedUsers = existingUsers.map((user: UserData) => {
      if (user.id === id) {
        return {
          ...user,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          isAdmin: formData.isAdmin,
          // Only update password if a new one was provided
          ...(formData.password && { password: formData.password }),
        }
      }
      return user
    })

    localStorage.setItem("allUsers", JSON.stringify(updatedUsers))

    toast({
      title: "User updated",
      description: `${formData.fullName}'s information has been updated`,
    })

    router.push("/admin/users")
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit User</h1>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password (leave blank to keep current)</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
              />
              {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
              {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="isAdmin" checked={formData.isAdmin} onCheckedChange={handleSwitchChange} />
              <Label htmlFor="isAdmin">Admin User</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700">
              Update User
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
