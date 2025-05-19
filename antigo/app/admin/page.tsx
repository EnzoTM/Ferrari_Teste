"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Car, Trophy, HardHatIcon as Helmet, ShoppingCart, Users, DollarSign } from "lucide-react"

export default function AdminDashboard() {
  const [productCounts, setProductCounts] = useState({
    cars: 0,
    formula1: 0,
    helmets: 0,
  })

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For demo, we'll use hardcoded values + any items added via localStorage
    const storedCars = JSON.parse(localStorage.getItem("ferrariCars") || "[]")
    const storedF1 = JSON.parse(localStorage.getItem("ferrariF1") || "[]")
    const storedHelmets = JSON.parse(localStorage.getItem("ferrariHelmets") || "[]")

    setProductCounts({
      cars: 8 + storedCars.length, // 8 default cars + any added ones
      formula1: 6 + storedF1.length, // 6 default F1 + any added ones
      helmets: 5 + storedHelmets.length, // 5 default helmets + any added ones
    })
  }, [])

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productCounts.cars + productCounts.formula1 + productCounts.helmets}
            </div>
            <p className="text-xs text-gray-500">Across all categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-gray-500">In the last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">243</div>
            <p className="text-xs text-gray-500">Registered customers</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="mb-4 mt-8 text-xl font-bold">Product Categories</h2>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="mr-2 h-5 w-5" />
              Car Miniatures
            </CardTitle>
            <CardDescription>{productCounts.cars} products</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-red-600 hover:bg-red-700" asChild>
              <Link href="/admin/products/add/car">Add New Car</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="mr-2 h-5 w-5" />
              Formula 1 Miniatures
            </CardTitle>
            <CardDescription>{productCounts.formula1} products</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-red-600 hover:bg-red-700" asChild>
              <Link href="/admin/products/add/formula1">Add New F1 Model</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Helmet className="mr-2 h-5 w-5" />
              Helmet Miniatures
            </CardTitle>
            <CardDescription>{productCounts.helmets} products</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-red-600 hover:bg-red-700" asChild>
              <Link href="/admin/products/add/helmet">Add New Helmet</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
