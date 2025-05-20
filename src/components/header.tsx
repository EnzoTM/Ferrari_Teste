"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/context/cart-context"
import { Badge } from "@/components/ui/badge"
import { isAuthenticated } from "@/lib/api"

export default function Header() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { itemCount } = useCart()

  // Check if user is logged in using the token
  useEffect(() => {
    setIsLoggedIn(isAuthenticated())
  }, [pathname]) // Re-check when pathname changes to update UI after login/logout

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
          <Link
            href="/admin"
            className={cn(
              "text-sm font-medium transition-colors hover:text-red-600",
              isActive("/admin") ? "text-red-600" : "text-gray-700",
            )}
          >
            Admin
          </Link>
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
                <div className="border-t pt-4">
                  <Link
                    href={isLoggedIn ? "/profile" : "/login"}
                    onClick={() => handleNavigation(isLoggedIn ? "/profile" : "/login")}
                    className="flex items-center px-2 py-2 text-lg font-medium transition-colors hover:text-red-600 text-left w-full"
                  >
                    {isLoggedIn ? "My Profile" : "Login / Register"}
                  </Link>
                  <Link
                    href="/cart"
                    onClick={() => handleNavigation("/cart")}
                    className="flex items-center px-2 py-2 text-lg font-medium transition-colors hover:text-red-600 text-left w-full"
                  >
                    Cart {itemCount > 0 && `(${itemCount})`}
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link href={isLoggedIn ? "/profile" : "/login"} className="hidden sm:flex">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </Button>
          </Link>
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
