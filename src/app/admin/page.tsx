"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { API_ENDPOINTS, fetchWithAuth, isAdmin, isAuthenticated } from "@/lib/api"
import { Loader2, ShoppingBag, Users, Package } from "lucide-react"

export default function AdminPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0
  })

  // Verificar autenticação e permissões de admin
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!isAuthenticated() || !isAdmin()) {
          router.push('/login')
          return
        }

        // Carregar estatísticas básicas para o dashboard
        setIsLoading(true)
        await loadDashboardStats()
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const loadDashboardStats = async () => {
    try {
      // Contar produtos
      const productsResponse = await fetchWithAuth(API_ENDPOINTS.products)
      const productsData = await productsResponse.json()
      
      // Contar usuários
      const usersResponse = await fetchWithAuth(API_ENDPOINTS.users)
      const usersData = await usersResponse.json()
      
      // Atualizar estatísticas (ordens seria implementado em uma versão mais completa)
      setStats({
        totalProducts: productsData.products?.length || 0,
        totalUsers: usersData.users?.length || 0,
        totalOrders: 0 // Implementação futura
      })
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-bold">Painel de Administração</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Produtos cadastrados no sistema
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Usuários registrados na plataforma
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Pedidos realizados
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
