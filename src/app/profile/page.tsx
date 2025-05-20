"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, MapPin, CreditCard, LogOut, ShoppingBag } from "lucide-react"
import AccountForm from "@/components/profile/account-form"
import AddressList from "@/components/profile/address-list"
import PaymentMethodList from "@/components/profile/payment-method-list"
import OrderHistory from "@/components/profile/order-history"
import { useToast } from "@/components/ui/use-toast"
import { fetchWithAuth, getUserId, getUserProfile, isAuthenticated, logout } from "@/lib/api"

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState(null)
  const router = useRouter()
  const { toast } = useToast()

  // Load real user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check if user is authenticated
        if (!isAuthenticated()) {
          toast({
            title: "Acesso não autorizado",
            description: "Por favor, faça login para acessar seu perfil.",
            variant: "destructive",
          })
          router.push('/login')
          return
        }

        // Get user data from API using the getUserProfile function
        try {
          const userProfile = await getUserProfile()
          setUserData(userProfile)
        } catch (error) {
          console.error("Error fetching user profile:", error)
          
          // Show more specific error message
          toast({
            title: "Erro ao carregar perfil",
            description: `Não foi possível carregar seus dados: ${error.message || "Erro desconhecido"}`,
            variant: "destructive",
          })
          
          // Try direct approach as fallback
          const userId = getUserId()
          if (userId) {
            try {
              // Check if API URL is defined
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
              
              const response = await fetchWithAuth(`${apiUrl}/api/users/${userId}`)
              
              if (response.ok) {
                const userData = await response.json()
                // Save to localStorage for future use
                localStorage.setItem('user', JSON.stringify(userData))
                setUserData(userData)
              } else {
                throw new Error(`Failed to fetch user data: ${response.status}`)
              }
            } catch (fetchError) {
              console.error("Error in direct fetch:", fetchError)
              toast({
                title: "Erro ao carregar dados",
                description: "Não foi possível carregar seus dados de perfil. Tente novamente mais tarde.",
                variant: "destructive",
              })
              // Redirect to login if we can't get user data after multiple attempts
              router.push('/login')
            }
          }
        }
      } catch (error) {
        console.error("Authentication error:", error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router, toast])

  const handleLogout = () => {
    // Use the logout function from the API to remove all authentication data
    logout()
    
    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta com sucesso.",
    })
    
    // Redirect to the login page
    router.push('/login')
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
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
        <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="account" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Conta</span>
          </TabsTrigger>
          <TabsTrigger value="addresses" className="flex items-center">
            <MapPin className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Endereços</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center">
            <CreditCard className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Pagamento</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center">
            <ShoppingBag className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Pedidos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card className="p-6">
            <AccountForm userData={userData} />
            {!userData && (
              <div className="mt-4 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
                <p>Não foi possível carregar seus dados. Por favor, tente novamente mais tarde.</p>
              </div>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="addresses">
          <Card className="p-6">
            <AddressList userData={userData} />
          </Card>
        </TabsContent>
        
        <TabsContent value="payment">
          <Card className="p-6">
            <PaymentMethodList />
          </Card>
        </TabsContent>
        
        <TabsContent value="orders">
          <Card className="p-6">
            <OrderHistory userData={userData} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
