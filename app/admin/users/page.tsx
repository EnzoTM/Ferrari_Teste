"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, User, ShieldCheck } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"

interface UserData {
  id: string
  fullName: string
  email: string
  phone: string
  isAdmin: boolean
  createdAt: string
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const router = useRouter()
  const { toast } = useToast()

  // Load users from localStorage
  useEffect(() => {
    const storedUsers = localStorage.getItem("allUsers")
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers))
    } else {
      // Set some default users for demo purposes
      const defaultUsers = [
        {
          id: "user1",
          fullName: "Carlos Ferrari",
          email: "carlos@ferrari.com",
          phone: "+55 (16) 99999-8888",
          isAdmin: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: "user2",
          fullName: "Maria Silva",
          email: "maria@example.com",
          phone: "+55 (11) 98765-4321",
          isAdmin: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: "user3",
          fullName: "João Santos",
          email: "joao@example.com",
          phone: "+55 (21) 91234-5678",
          isAdmin: false,
          createdAt: new Date().toISOString(),
        },
      ]
      setUsers(defaultUsers)
      localStorage.setItem("allUsers", JSON.stringify(defaultUsers))
    }
  }, [])

  const handleAddUser = () => {
    router.push("/admin/users/add")
  }

  const handleEditUser = (userId: string) => {
    router.push(`/admin/users/edit/${userId}`)
  }

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = users.filter((user) => user.id !== userId)
    setUsers(updatedUsers)
    localStorage.setItem("allUsers", JSON.stringify(updatedUsers))

    toast({
      title: "User deleted",
      description: "The user has been deleted successfully",
    })
  }

  const adminUsers = users.filter((user) => user.isAdmin)
  const regularUsers = users.filter((user) => !user.isAdmin)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button className="bg-red-600 hover:bg-red-700" onClick={handleAddUser}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Users ({users.length})</TabsTrigger>
          <TabsTrigger value="admins">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Admins ({adminUsers.length})
          </TabsTrigger>
          <TabsTrigger value="users">
            <User className="mr-2 h-4 w-4" />
            Regular Users ({regularUsers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <UserCard key={user.id} user={user} onEdit={handleEditUser} onDelete={handleDeleteUser} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="admins" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {adminUsers.map((user) => (
              <UserCard key={user.id} user={user} onEdit={handleEditUser} onDelete={handleDeleteUser} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {regularUsers.map((user) => (
              <UserCard key={user.id} user={user} onEdit={handleEditUser} onDelete={handleDeleteUser} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface UserCardProps {
  user: UserData
  onEdit: (userId: string) => void
  onDelete: (userId: string) => void
}

function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold">{user.fullName}</h3>
            {user.isAdmin ? <Badge className="bg-red-600">Admin</Badge> : <Badge variant="outline">User</Badge>}
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600">{user.email}</p>
            <p className="text-gray-600">{user.phone}</p>
            <p className="text-xs text-gray-500">Created: {formatDate(user.createdAt)}</p>
          </div>
        </div>
        <div className="flex border-t">
          <Button
            variant="ghost"
            className="flex-1 rounded-none text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            onClick={() => onEdit(user.id)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <div className="w-px bg-gray-200" />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="flex-1 rounded-none text-red-600 hover:bg-red-50 hover:text-red-700">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete User</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {user.fullName}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => onDelete(user.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
