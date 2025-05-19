"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Car, Trophy, HardHatIcon as Helmet, Plus, Edit, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  category: string
  inStock: boolean
}

export default function ProductsPage() {
  const [products, setProducts] = useState<{
    cars: Product[]
    formula1: Product[]
    helmets: Product[]
  }>({
    cars: [],
    formula1: [],
    helmets: [],
  })

  const router = useRouter()
  const { toast } = useToast()

  // Function to load products
  const loadProducts = () => {
    // Default products (these would come from a database in a real app)
    const defaultCars = [
      {
        id: "car1",
        name: "Ferrari SF90 Stradale",
        price: 129.99,
        images: ["/placeholder.svg?height=500&width=500"],
        category: "cars",
        inStock: true,
      },
      {
        id: "car2",
        name: "Ferrari 488 GTB",
        price: 119.99,
        images: ["/placeholder.svg?height=500&width=500"],
        category: "cars",
        inStock: true,
      },
      // Add more default cars as needed
    ]

    const defaultF1 = [
      {
        id: "f1-1",
        name: "Ferrari F1-75 Charles Leclerc",
        price: 149.99,
        images: ["/placeholder.svg?height=500&width=500"],
        category: "formula1",
        inStock: true,
      },
      {
        id: "f1-2",
        name: "Ferrari F1-75 Carlos Sainz",
        price: 149.99,
        images: ["/placeholder.svg?height=500&width=500"],
        category: "formula1",
        inStock: true,
      },
      // Add more default F1 cars as needed
    ]

    const defaultHelmets = [
      {
        id: "helmet1",
        name: "Charles Leclerc 2023 Helmet",
        price: 89.99,
        images: ["/placeholder.svg?height=500&width=500"],
        category: "helmets",
        inStock: true,
      },
      {
        id: "helmet2",
        name: "Carlos Sainz 2023 Helmet",
        price: 89.99,
        images: ["/placeholder.svg?height=500&width=500"],
        category: "helmets",
        inStock: true,
      },
      // Add more default helmets as needed
    ]

    // Get any custom products from localStorage
    const storedCars = JSON.parse(localStorage.getItem("ferrariCars") || "[]")
    const storedF1 = JSON.parse(localStorage.getItem("ferrariFormula1") || "[]")
    const storedHelmets = JSON.parse(localStorage.getItem("ferrariHelmets") || "[]")

    setProducts({
      cars: [...defaultCars, ...storedCars],
      formula1: [...defaultF1, ...storedF1],
      helmets: [...defaultHelmets, ...storedHelmets],
    })
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleDelete = (product: Product) => {
    const category = product.category
    const storageKey = `ferrari${category.charAt(0).toUpperCase() + category.slice(1)}`

    // Only delete from localStorage if it's a custom product
    // In a real app, you would delete from the database
    if (!["car1", "car2", "f1-1", "f1-2", "helmet1", "helmet2"].includes(product.id)) {
      const existingProducts = JSON.parse(localStorage.getItem(storageKey) || "[]")
      const updatedProducts = existingProducts.filter((p: Product) => p.id !== product.id)
      localStorage.setItem(storageKey, JSON.stringify(updatedProducts))
    }

    // Reload products
    loadProducts()

    toast({
      title: "Product deleted",
      description: `${product.name} has been removed from the store`,
    })
  }

  const handleAddProduct = () => {
    router.push("/admin/products/add/car")
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex space-x-2">
          <Button className="bg-red-600 hover:bg-red-700" onClick={handleAddProduct}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="cars">
            <Car className="mr-2 h-4 w-4" />
            Cars
          </TabsTrigger>
          <TabsTrigger value="formula1">
            <Trophy className="mr-2 h-4 w-4" />
            Formula 1
          </TabsTrigger>
          <TabsTrigger value="helmets">
            <Helmet className="mr-2 h-4 w-4" />
            Helmets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...products.cars, ...products.formula1, ...products.helmets].map((product) => (
              <ProductCard key={product.id} product={product} onDelete={handleDelete} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cars" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.cars.map((product) => (
              <ProductCard key={product.id} product={product} onDelete={handleDelete} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="formula1" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.formula1.map((product) => (
              <ProductCard key={product.id} product={product} onDelete={handleDelete} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="helmets" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.helmets.map((product) => (
              <ProductCard key={product.id} product={product} onDelete={handleDelete} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface ProductCardProps {
  product: Product
  onDelete: (product: Product) => void
}

function ProductCard({ product, onDelete }: ProductCardProps) {
  const router = useRouter()

  const handleEdit = () => {
    router.push(`/admin/products/edit/${product.category}/${product.id}`)
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex overflow-hidden">
          <div className="relative h-24 w-24 flex-shrink-0">
            <Image src={product.images[0] || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
          </div>
          <div className="flex flex-1 flex-col justify-between p-4">
            <div>
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-500">ID: {product.id}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="font-bold text-red-600">${product.price.toFixed(2)}</p>
              {product.inStock ? (
                <Badge variant="outline" className="border-green-500 text-green-600">
                  In Stock
                </Badge>
              ) : (
                <Badge variant="outline" className="border-red-500 text-red-600">
                  Out of Stock
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex border-t">
          <Button
            variant="ghost"
            className="flex-1 rounded-none text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            onClick={handleEdit}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <div className="w-px bg-gray-200" />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="flex-1 rounded-none text-red-600 hover:bg-red-50 hover:text-red-700">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {product.name} from the store. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => onDelete(product)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
