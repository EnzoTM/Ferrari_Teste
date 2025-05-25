"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import ProductForm from "@/components/admin/product-form"
import { isAdmin, isAuthenticated } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function AddProductPage() {
  const [selectedCategory, setSelectedCategory] = useState<"cars" | "formula1" | "helmets">("cars")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is authenticated and admin
    if (!isAuthenticated() || !isAdmin()) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive"
      })
      router.push('/login')
    }
  }, [router, toast])

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Add New Product</h1>
      </div>

      <Tabs
        defaultValue="cars"
        onValueChange={(value) => setSelectedCategory(value as "cars" | "formula1" | "helmets")}
        className="mb-8"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cars">Cars</TabsTrigger>
          <TabsTrigger value="formula1">Formula 1</TabsTrigger>
          <TabsTrigger value="helmets">Helmets</TabsTrigger>
        </TabsList>
        <TabsContent value="cars">
          <ProductForm
            category="cars"
            title="Add New Car"
          />
        </TabsContent>
        <TabsContent value="formula1">
          <ProductForm
            category="formula1"
            title="Add New Formula 1 Model"
          />
        </TabsContent>
        <TabsContent value="helmets">
          <ProductForm
            category="helmets"
            title="Add New Helmet"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}