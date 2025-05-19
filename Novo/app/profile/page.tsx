"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, MapPin, CreditCard, LogOut } from "lucide-react"
import AccountForm from "@/components/profile/account-form"
import AddressList from "@/components/profile/address-list"
import PaymentMethodList from "@/components/profile/payment-method-list"
import { useToast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Check if user is logged in
  useEffect(() => {
    // Verificar se já existe um usuário no localStorage
    const userData = localStorage.getItem("userData")
    if (!userData) {
      // Criar um usuário padrão se não existir
      const defaultUser = {
        fullName: "Carlos Ferrari",
        email: "carlos@ferrari.com",
        phone: "+55 (16) 99999-8888",
      }
      localStorage.setItem("userData", JSON.stringify(defaultUser))

      // Criar endereços padrão
      const defaultAddresses = [
        {
          id: "addr1",
          name: "Casa",
          street: "Rua das Ferraris, 458",
          city: "Maranello",
          state: "MO",
          zipCode: "41053",
          country: "Itália",
          isDefault: true,
        },
      ]
      localStorage.setItem("userAddresses", JSON.stringify(defaultAddresses))

      // Criar cartão padrão
      const defaultPaymentMethods = [
        {
          id: "card1",
          cardName: "Carlos Ferrari",
          cardNumber: "•••• •••• •••• 4242",
          expiryDate: "12/25",
          isDefault: true,
          cardType: "visa",
        },
      ]
      localStorage.setItem("userPaymentMethods", JSON.stringify(defaultPaymentMethods))
    }

    setIsLoading(false)
  }, [])

  const handleLogout = () => {
    // Remover apenas o status de login, mas manter os dados do usuário
    localStorage.removeItem("isLoggedIn")

    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta, mas os dados de demonstração continuam disponíveis",
    })
  }

  if (isLoading) {
    return (
      <div className="container flex min-h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="account" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="addresses" className="flex items-center">
            <MapPin className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Addresses</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center">
            <CreditCard className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Payment</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card className="p-6">
            <AccountForm />
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <Card className="p-6">
            <AddressList />
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card className="p-6">
            <PaymentMethodList />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
