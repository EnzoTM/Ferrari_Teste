"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Car, Trophy, HardHatIcon as Helmet, Home, List, Users } from "lucide-react"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full border-b bg-gray-50 md:w-64 md:border-b-0 md:border-r">
        <div className="flex h-16 items-center border-b px-6">
          <h2 className="text-lg font-bold">Ferrari Admin</h2>
        </div>
        <nav className="p-4">
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>

            <h3 className="mb-2 mt-4 px-2 text-xs font-semibold uppercase text-gray-500">Products</h3>

            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin/products">
                <List className="mr-2 h-4 w-4" />
                All Products
              </Link>
            </Button>

            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin/products/add/car">
                <Car className="mr-2 h-4 w-4" />
                Add Car Miniature
              </Link>
            </Button>

            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin/products/add/formula1">
                <Trophy className="mr-2 h-4 w-4" />
                Add F1 Miniature
              </Link>
            </Button>

            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin/products/add/helmet">
                <Helmet className="mr-2 h-4 w-4" />
                Add Helmet Miniature
              </Link>
            </Button>

            <h3 className="mb-2 mt-4 px-2 text-xs font-semibold uppercase text-gray-500">Users</h3>

            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin/users">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Link>
            </Button>
          </div>

          <div className="mt-6">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
              asChild
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Store
              </Link>
            </Button>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
