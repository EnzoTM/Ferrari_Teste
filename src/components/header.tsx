"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, User, Menu, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/context/cart-context"
import { Badge } from "@/components/ui/badge"
import { isAuthenticated, isAdmin, logout } from "@/lib/api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userIsAdmin, setUserIsAdmin] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { itemCount } = useCart()

  // Verificar autenticação e status de admin quando o componente montar ou o pathname mudar
  useEffect(() => {
    // Necessário para evitar erros de hidratação
    const checkAuth = () => {
      setIsLoggedIn(isAuthenticated())
      setUserIsAdmin(isAdmin())
    }
    
    // Verificar imediatamente
    checkAuth()
    
    // Criar um intervalo para verificar periodicamente
    const interval = setInterval(checkAuth, 3000)
    
    // Limpar intervalo quando o componente desmontar
    return () => clearInterval(interval)
  }, [pathname])

  const handleLogout = () => {
    logout()
    setIsLoggedIn(false)
    setUserIsAdmin(false)
    
    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta com sucesso.",
    })
    
    router.push('/')
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  const handleNavigation = (path: string) => {
    setIsOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/placeholder.svg?height=40&width=40"
              alt="Ferrari Logo"
              width={40}
              height={40}
              className="mr-2"
            />
          </Link>
        </div>
        {/* Desktop Navigation */}
        <nav className="mx-6 hidden items-center space-x-4 lg:flex lg:space-x-6">
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-red-600",
              isActive("/") ? "text-red-600" : "text-gray-700",
            )}
          >
            Home
          </Link>
          <Link
            href="/cars"
            className={cn(
              "text-sm font-medium transition-colors hover:text-red-600",
              isActive("/cars") ? "text-red-600" : "text-gray-700",
            )}
          >
            Cars
          </Link>
          <Link
            href="/formula1"
            className={cn(
              "text-sm font-medium transition-colors hover:text-red-600",
              isActive("/formula1") ? "text-red-600" : "text-gray-700",
            )}
          >
            Formula 1
          </Link>
          <Link
            href="/helmets"
            className={cn(
              "text-sm font-medium transition-colors hover:text-red-600",
              isActive("/helmets") ? "text-red-600" : "text-gray-700",
            )}
          >
            Helmets
          </Link>
          {userIsAdmin && (
            <Link
              href="/admin"
              className={cn(
                "text-sm font-medium transition-colors hover:text-red-600",
                isActive("/admin") ? "text-red-600" : "text-gray-700",
              )}
            >
              Admin
            </Link>
          )}
        </nav>
        <div className="flex items-center space-x-4">
          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[250px] sm:w-[300px]">
              <div className="flex flex-col space-y-4 py-6">
                <Link
                  href="/"
                  onClick={() => handleNavigation("/")}
                  className={cn(
                    "flex items-center px-2 py-2 text-lg font-medium transition-colors hover:text-red-600 text-left",
                    isActive("/") ? "text-red-600" : "text-gray-700",
                  )}
                >
                  Home
                </Link>
                <Link
                  href="/cars"
                  onClick={() => handleNavigation("/cars")}
                  className={cn(
                    "flex items-center px-2 py-2 text-lg font-medium transition-colors hover:text-red-600 text-left",
                    isActive("/cars") ? "text-red-600" : "text-gray-700",
                  )}
                >
                  Cars
                </Link>
                <Link
                  href="/formula1"
                  onClick={() => handleNavigation("/formula1")}
                  className={cn(
                    "flex items-center px-2 py-2 text-lg font-medium transition-colors hover:text-red-600 text-left",
                    isActive("/formula1") ? "text-red-600" : "text-gray-700",
                  )}
                >
                  Formula 1
                </Link>
                <Link
                  href="/helmets"
                  onClick={() => handleNavigation("/helmets")}
                  className={cn(
                    "flex items-center px-2 py-2 text-lg font-medium transition-colors hover:text-red-600 text-left",
                    isActive("/helmets") ? "text-red-600" : "text-gray-700",
                  )}
                >
                  Helmets
                </Link>
                {userIsAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => handleNavigation("/admin")}
                    className={cn(
                      "flex items-center px-2 py-2 text-lg font-medium transition-colors hover:text-red-600 text-left",
                      isActive("/admin") ? "text-red-600" : "text-gray-700",
                    )}
                  >
                    Admin
                  </Link>
                )}
                <div className="border-t pt-4">
                  {isLoggedIn ? (
                    <>
                      <Link
                        href="/profile"
                        onClick={() => handleNavigation("/profile")}
                        className="flex items-center px-2 py-2 text-lg font-medium transition-colors hover:text-red-600 text-left w-full"
                      >
                        Meu Perfil
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          handleNavigation("/");
                        }}
                        className="flex w-full items-center px-2 py-2 text-lg font-medium transition-colors hover:text-red-600 text-left"
                      >
                        <LogOut className="mr-2 h-5 w-5" />
                        Sair
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => handleNavigation("/login")}
                        className="flex items-center px-2 py-2 text-lg font-medium transition-colors hover:text-red-600 text-left w-full"
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => handleNavigation("/register")}
                        className="flex items-center px-2 py-2 text-lg font-medium transition-colors hover:text-red-600 text-left w-full"
                      >
                        Registrar
                      </Link>
                    </>
                  )}
                  <Link
                    href="/cart"
                    onClick={() => handleNavigation("/cart")}
                    className="flex items-center px-2 py-2 text-lg font-medium transition-colors hover:text-red-600 text-left w-full"
                  >
                    Carrinho {itemCount > 0 && `(${itemCount})`}
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          {/* User Menu (Desktop) */}
          <div className="hidden sm:block">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <User className="h-5 w-5" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Meu Perfil</Link>
                  </DropdownMenuItem>
                  {userIsAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                    Registro
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Cart Link */}
          <Link href="/cart">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Cart</span>
              {itemCount > 0 && (
                <Badge className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-red-600 p-0 text-[10px] text-white">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
