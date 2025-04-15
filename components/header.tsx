"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/context/cart-context"
import { Badge } from "@/components/ui/badge"

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { itemCount } = useCart()

  // In a real app, this would check authentication status from a context or API
  useEffect(() => {
    // Check if user is logged in from localStorage or session
    const userLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    setIsLoggedIn(userLoggedIn)
  }, [])

  const handleProfileClick = () => {
    if (isLoggedIn) {
      router.push("/profile")
    } else {
      router.push("/login")
    }
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png?height=40&width=40" alt="Ferrari Logo" width={70} height={70} className="mr-2" />
        </Link>

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
          <Sheet>
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
                  className={cn(
                    "flex items-center px-2 py-2 text-lg font-medium transition-colors hover:text-red-600",
                    isActive("/") ? "text-red-600" : "text-gray-700",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/cars"
                  className={cn(
                    "flex items-center px-2 py-2 text-lg font-medium transition-colors hover:text-red-600",
                    isActive("/cars") ? "text-red-600" : "text-gray-700",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  Cars
                </Link>
                <Link
                  href="/formula1"
                  className={cn(
                    "flex items-center px-2 py-2 text-lg font-medium transition-colors hover:text-red-600",
                    isActive("/formula1") ? "text-red-600" : "text-gray-700",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  Formula 1
                </Link>
                <Link
                  href="/helmets"
                  className={cn(
                    "flex items-center px-2 py-2 text-lg font-medium transition-colors hover:text-red-600",
                    isActive("/helmets") ? "text-red-600" : "text-gray-700",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  Helmets
                </Link>
                <Link
                  href="/admin"
                  className={cn(
                    "flex items-center px-2 py-2 text-lg font-medium transition-colors hover:text-red-600",
                    isActive("/admin") ? "text-red-600" : "text-gray-700",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  Admin
                </Link>
                <div className="border-t pt-4">
                  <Link
                    href={isLoggedIn ? "/profile" : "/login"}
                    className="flex items-center px-2 py-2 text-lg font-medium transition-colors hover:text-red-600"
                    onClick={() => setIsOpen(false)}
                  >
                    {isLoggedIn ? "My Profile" : "Login / Register"}
                  </Link>
                  <Link
                    href="/cart"
                    className="flex items-center px-2 py-2 text-lg font-medium transition-colors hover:text-red-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Cart {itemCount > 0 && `(${itemCount})`}
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Button variant="ghost" size="icon" onClick={handleProfileClick} className="hidden sm:flex">
            <User className="h-5 w-5" />
            <span className="sr-only">Profile</span>
          </Button>
          <Link href="/cart" className="relative">
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
