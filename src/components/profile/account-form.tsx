"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { authFetchConfig } from "@/lib/api"

interface UserData {
  name?: string
  fullName?: string
  email: string
  phone: string
  cpf: string
  [key: string]: any // Allow for additional fields from API
}

export default function AccountForm({ userData: propUserData = null }) {
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    phone: "",
    cpf: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Load user data from API data passed as props
  useEffect(() => {
    if (propUserData) {
      setUserData({
        name: propUserData.name || "",
        email: propUserData.email || "",
        phone: propUserData.phone || "",
        cpf: propUserData.cpf || "",
      })
    }
  }, [propUserData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUserData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        throw new Error("Usuário não encontrado")
      }

      // Create payload with fields to update
      const payload = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        cpf: userData.cpf
      }

      // Send data to backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, 
        authFetchConfig('PUT', payload)
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erro ao atualizar perfil")
      }

      setIsEditing(false)
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso",
      })
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao salvar suas informações",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const validatePassword = () => {
    if (newPassword.length < 8) {
      setPasswordError("A senha deve ter pelo menos 8 caracteres")
      return false
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem")
      return false
    }
    return true
  }

  const handleChangePassword = async () => {
    if (!currentPassword) {
      setPasswordError("Digite sua senha atual")
      return
    }
    
    if (validatePassword()) {
      try {
        const userId = localStorage.getItem('userId')
        if (!userId) {
          throw new Error("Usuário não encontrado")
        }

        // Send password update request to backend
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/change-password`,
          authFetchConfig('PUT', { 
            currentPassword,
            newPassword
          })
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Erro ao alterar senha")
        }
        
        // Reset password fields
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setPasswordError("")
        
        toast({
          title: "Senha alterada",
          description: "Sua senha foi alterada com sucesso",
        })
      } catch (error) {
        console.error("Error changing password:", error)
        toast({
          title: "Erro ao alterar senha",
          description: error instanceof Error ? error.message : "Ocorreu um erro ao alterar sua senha",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Informações Pessoais</h2>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Cancelar" : "Editar"}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                name="name"
                value={userData.name}
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
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input 
                id="phone" 
                name="phone" 
                value={userData.phone} 
                onChange={handleInputChange} 
                disabled={!isEditing} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input 
                id="cpf" 
                name="cpf" 
                value={userData.cpf} 
                onChange={handleInputChange} 
                disabled={!isEditing} 
              />
            </div>
          </div>
          
          {isEditing && (
            <Button 
              className="mt-4 bg-red-600 hover:bg-red-700" 
              onClick={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          )}
        </div>
      </div>

      <div className="border-t pt-8">
        <h2 className="mb-4 text-xl font-semibold">Alterar Senha</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
          </div>
          <Button className="bg-red-600 hover:bg-red-700" onClick={handleChangePassword}>
            Alterar Senha
          </Button>
        </div>
      </div>
    </div>
  )
}
