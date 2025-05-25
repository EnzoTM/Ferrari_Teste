"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { isAdmin, isAuthenticated } from "@/lib/api"
import { Loader2, Car, Trophy, HardHatIcon as Helmet, List, Users, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  // Verificar autenticação e permissões de admin
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!isAuthenticated() || !isAdmin()) {
          router.push('/login')
          return
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel de Administração</h1>
        <p className="text-gray-600">Gerencie produtos e usuários do sistema</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Products Management */}
        <Card className="group hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-gray-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                  <List className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-900">Produtos</CardTitle>
                  <CardDescription className="text-sm">
                    Visualizar e gerenciar produtos
                  </CardDescription>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Link href="/admin/products" className="block">
              <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <span className="text-gray-700 font-medium">Ver Todos os Produtos</span>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Add Car */}
        <Card className="group hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-gray-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <Car className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-900">Carros</CardTitle>
                  <CardDescription className="text-sm">
                    Adicionar miniatura de carro
                  </CardDescription>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Link href="/admin/products/add/car" className="block">
              <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <span className="text-gray-700 font-medium">Adicionar Carro</span>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Add Formula 1 */}
        <Card className="group hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-gray-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-50 rounded-lg group-hover:bg-yellow-100 transition-colors">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-900">Fórmula 1</CardTitle>
                  <CardDescription className="text-sm">
                    Adicionar miniatura de F1
                  </CardDescription>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Link href="/admin/products/add/formula1" className="block">
              <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <span className="text-gray-700 font-medium">Adicionar F1</span>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Add Helmet */}
        <Card className="group hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-gray-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                  <Helmet className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-900">Capacetes</CardTitle>
                  <CardDescription className="text-sm">
                    Adicionar miniatura de capacete
                  </CardDescription>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Link href="/admin/products/add/helmet" className="block">
              <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <span className="text-gray-700 font-medium">Adicionar Capacete</span>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* User Management - spans full width */}
        <Card className="md:col-span-2 group hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-gray-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-900">Usuários</CardTitle>
                  <CardDescription className="text-sm">
                    Visualizar, editar ou remover usuários do sistema
                  </CardDescription>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Link href="/admin/users" className="block">
              <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <span className="text-gray-700 font-medium">Gerenciar Usuários</span>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
