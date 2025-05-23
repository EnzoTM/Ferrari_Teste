"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, MapPin, CreditCard, LogOut, ShoppingBag } from "lucide-react"
import AccountForm from "@/components/profile/account-form"
import AddressesSection from "@/components/profile/addresses-section"
import PaymentMethodsSection from "@/components/profile/payment-methods-section"
import OrdersSection from "@/components/profile/orders-section"
import { useToast } from "@/components/ui/use-toast"
import { API_ENDPOINTS, fetchWithAuth, isAuthenticated, logout } from "@/lib/api"

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState(null)
  const router = useRouter()
  const { toast } = useToast()

  // Load user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check if user is authenticated - redirecionamento imediato se não estiver
        if (!isAuthenticated()) {
          toast({
            title: "Acesso não autorizado",
            description: "Por favor, faça login para acessar seu perfil.",
            variant: "destructive",
          })
          router.push('/login')
          return
        }

        // Get user data from API
        try {
          const userId = localStorage.getItem('userId')
          if (!userId) {
            throw new Error('User ID not found')
          }
          
          // Tentar obter os dados do usuário
          const response = await fetchWithAuth(`${API_ENDPOINTS.userById(userId)}`)
          
          if (!response.ok) {
            // Se a resposta não for bem-sucedida, pode ser um problema com o token
            // ou o usuário não existe mais
            throw new Error('Failed to fetch user data')
          }
          
          const data = await response.json()
          setUserData(data.user)
        } catch (error) {
          console.error("Error fetching user profile:", error)
          
          toast({
            title: "Erro ao carregar perfil",
            description: "Não foi possível carregar seus dados. Por favor, faça login novamente.",
            variant: "destructive",
          })
          
          // Fazer logout e redirecionar para login em caso de erro de autenticação
          logout()
          router.push('/login')
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

  // Se não há dados do usuário e não está carregando, mostrar mensagem de erro
  if (!userData) {
    return (
      <div className="container py-8">
        <Card className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Erro ao carregar perfil</h2>
            <p className="mb-6">Não foi possível carregar as informações do seu perfil. Por favor, tente fazer login novamente.</p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => router.push('/')}>
                Voltar para Home
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700" 
                onClick={() => router.push('/login')}
              >
                Fazer Login
              </Button>
            </div>
          </div>
        </Card>
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
          </Card>
        </TabsContent>
        
        <TabsContent value="addresses">
          <Card className="p-6">
            <AddressesSection />
          </Card>
        </TabsContent>
        
        <TabsContent value="payment">
          <Card className="p-6">
            <PaymentMethodsSection />
          </Card>
        </TabsContent>
        
        <TabsContent value="orders">
          <Card className="p-6">
            <OrdersSection />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
