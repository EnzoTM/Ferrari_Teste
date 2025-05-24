"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import ProductForm from "@/components/admin/product-form"
import { isAdmin, isAuthenticated, API_URL } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { IProduct } from "@/types/models"

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<IProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [productType, setProductType] = useState<"cars" | "formula1" | "helmets">("cars")
  const router = useRouter()
  const { toast } = useToast()

  // Map the backend product type to frontend category
  const mapTypeToCategory = (type: string): "cars" | "formula1" | "helmets" => {
    switch (type) {
      case "car": return "cars"
      case "formula1": return "formula1"
      case "helmet": return "helmets"
      default: return "cars"
    }
  }

  useEffect(() => {
    // Check if user is authenticated and admin
    if (!isAuthenticated() || !isAdmin()) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive"
      })
      router.push('/login')
      return
    }

    // Load product data
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const apiUrl = API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const response = await fetch(`${apiUrl}/api/products/${id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Product not found")
          }
          throw new Error(`Failed to fetch product: ${response.status}`)
        }
        
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server returned invalid response format")
        }
        
        const data = await response.json()
        
        if (!data.product) {
          throw new Error("Product data not found in response")
        }
        
        setProduct(data.product)
        setProductType(mapTypeToCategory(data.product.type))
      } catch (error) {
        console.error("Error fetching product:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load product. Please try again.",
          variant: "destructive"
        })
        // Redirect to products list on error
        router.push('/admin/products')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id, router, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container py-8">
        <div className="mb-6 flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Product Not Found</h1>
        </div>
        <p>The product you are looking for could not be found.</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Product</h1>
      </div>

      <ProductForm
        category={productType}
        title={`Edit ${product.name}`}
        editMode={true}
        productId={id}
      />
    </div>
  )
}