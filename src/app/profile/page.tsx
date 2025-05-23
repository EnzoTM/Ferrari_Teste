"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { UserProfileSection } from "@/components/profile/user-profile-section"
import AddressSection from "@/components/profile/address-section"
import PaymentMethodSection from "@/components/profile/payment-methods-section"
import OrdersSection from "@/components/profile/orders-section"
import { useToast } from "@/components/ui/use-toast"
import { API_ENDPOINTS, fetchWithAuth, isAuthenticated, logout } from "@/lib/api"
import { Button } from "@/components/ui/button"

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

        // Tentar obter os dados do usuário
        try {
          const userId = localStorage.getItem('userId')
          if (!userId) {
            throw new Error('User ID not found')
          }
          
          const response = await fetchWithAuth(`${API_ENDPOINTS.userById(userId)}`)
          
          if (!response.ok) {
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
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Erro ao carregar perfil</h2>
          <p className="mb-6">Não foi possível carregar as informações do seu perfil. Por favor, tente fazer login novamente.</p>
          <div className="flex justify-center gap-4">
            <Button className="bg-slate-200 hover:bg-slate-300" onClick={() => router.push('/')}>
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
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
        <Button className="border border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700" variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-8 grid w-full grid-cols-4">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="address">Endereço</TabsTrigger>
          <TabsTrigger value="payment">Pagamento</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-bold">Informações Pessoais</h2>
            <p className="text-muted-foreground">
              Gerencie suas informações pessoais e preferências
            </p>
          </div>
          <Separator />
          <UserProfileSection />
        </TabsContent>
        
        <TabsContent value="address" className="space-y-6">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-bold">Meu Endereço</h2>
            <p className="text-muted-foreground">
              Gerencie seu endereço de entrega
            </p>
          </div>
          <Separator />
          <AddressSection />
        </TabsContent>
        
        <TabsContent value="payment" className="space-y-6">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-bold">Método de Pagamento</h2>
            <p className="text-muted-foreground">
              Gerencie seu método de pagamento para compras
            </p>
          </div>
          <Separator />
          <PaymentMethodSection />
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-6">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-bold">Meus Pedidos</h2>
            <p className="text-muted-foreground">
              Visualize e acompanhe o status dos seus pedidos
            </p>
          </div>
          <Separator />
          <OrdersSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}
