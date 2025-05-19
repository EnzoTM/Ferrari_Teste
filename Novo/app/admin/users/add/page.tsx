"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function AddUserPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    isAdmin: false,
  })

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })

  const router = useRouter()
  const { toast } = useToast()

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

    // Validate password
    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
      valid = false
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
      valid = false
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

    // Check if email already exists
    if (existingUsers.some((user: any) => user.email === formData.email)) {
      setErrors((prev) => ({ ...prev, email: "This email is already in use" }))
      return
    }

    // Create new user
    const newUser = {
      id: `user${Date.now()}`,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      isAdmin: formData.isAdmin,
      createdAt: new Date().toISOString(),
    }

    // Add to users list
    const updatedUsers = [...existingUsers, newUser]
    localStorage.setItem("allUsers", JSON.stringify(updatedUsers))

    toast({
      title: "User created",
      description: `${formData.fullName} has been added successfully`,
    })

    router.push("/admin/users")
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Add New User</h1>

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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
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
              Create User
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
