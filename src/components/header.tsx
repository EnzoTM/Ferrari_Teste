"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Menu, ShoppingCart, User, LogOut } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { isAuthenticated, isAdmin, logout } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function Header() {
  const { itemCount } = useCart()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isUserAdmin, setIsUserAdmin] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkAuthStatus = () => {
      setIsLoggedIn(isAuthenticated())
      setIsUserAdmin(isAdmin())
    }
    
    // Check immediately
    checkAuthStatus()
    
    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuthStatus()
    }
    
    // Listen for custom auth state changes
    const handleAuthStateChange = () => {
      checkAuthStatus()
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('authStateChanged', handleAuthStateChange)
    
    // Also listen for focus events to re-check when user returns to tab
    window.addEventListener('focus', checkAuthStatus)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('authStateChanged', handleAuthStateChange)
      window.removeEventListener('focus', checkAuthStatus)
    }
  }, [])

  const handleLogout = () => {
    logout()
    setIsLoggedIn(false)
    setIsUserAdmin(false)
    setMobileMenuOpen(false)
    
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    })
    
    router.push("/")
  }

  const navItems = [
    { href: "/", label: "Início" },
    { href: "/cars", label: "Carros" },
    { href: "/formula1", label: "Fórmula 1" },
    { href: "/helmets", label: "Capacetes" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo - Fixed left */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="Ferrari Store"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="hidden font-bold sm:inline-block">Ferrari Store</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="ml-4 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Link
              href="/"
              className="flex items-center space-x-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Image
                src="/logo.png"
                alt="Ferrari Store"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="font-bold">Ferrari Store</span>
            </Link>
            <nav className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <div className="space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                {isLoggedIn && isUserAdmin && (
                  <Link
                    href="/admin"
                    className="block text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Centered Navigation - Desktop */}
        <div className="hidden md:flex flex-1 justify-center">
          <nav className="flex items-center space-x-8 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-2 ml-auto md:ml-0">
          {/* Cart Button */}
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/cart">
              <ShoppingCart className="h-4 w-4" />
              {itemCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </Badge>
              )}
              <span className="sr-only">Carrinho</span>
            </Link>
          </Button>

          {/* User Menu */}
          {isLoggedIn ? (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/profile">
                  <User className="h-4 w-4" />
                  <span className="sr-only">Perfil</span>
                </Link>
              </Button>
              
              {isUserAdmin && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin">Admin</Link>
                </Button>
              )}
              
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Sair</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
              <Button size="sm" className="bg-red-600 hover:bg-red-700" asChild>
                <Link href="/register">Registrar</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
