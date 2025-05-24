"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/context/cart-context"
import { API_URL } from "@/lib/api"
import { IProduct } from "@/types/models"
import { ChevronLeft, Loader2, Minus, Plus, ShoppingCart } from "lucide-react"
import Link from "next/link"

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const { toast } = useToast()
  const { addItem } = useCart()
  
  const [product, setProduct] = useState<IProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  // Helper function to get correct image URL
  const getImageUrl = (imageName: string) => {
    if (!imageName) return "/placeholder.svg"
    
    // If it's already a full URL, use it
    if (imageName.startsWith('http')) {
      return imageName
    }
    
    // If it starts with /public or /api, construct the full URL
    if (imageName.startsWith('/public') || imageName.startsWith('/api')) {
      return `${API_URL}${imageName}`
    }
    
    // Otherwise, it's just a filename, construct the full URL
    return `${API_URL}/public/images/products/${imageName}`
  }

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const apiUrl = API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const response = await fetch(`${apiUrl}/api/products/${id}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.status}`)
        }

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server returned invalid response format")
        }

        const data = await response.json()
        
        if (!data.product) {
          throw new Error("Product not found")
        }
        
        setProduct(data.product)
      } catch (error) {
        console.error("Error fetching product:", error)
        toast({
          title: "Erro",
          description: error instanceof Error ? error.message : "Não foi possível carregar o produto",
          variant: "destructive"
        })
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id, router, toast])

  const handleAddToCart = () => {
    if (!product) return

    addItem({
      id: product._id!,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '',
      quantity: quantity
    })

    toast({
      title: "Produto adicionado",
      description: `${quantity}x ${product.name} adicionado ao carrinho`,
    })
  }

  const increaseQuantity = () => {
    if (product && quantity < (product.stock || 0)) {
      setQuantity(prev => prev + 1)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <Link href="/">
            <Button>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar à página inicial
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-4">
          <Link href="/">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          {/* Main image */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={getImageUrl(product.images?.[selectedImage] || '')}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Thumbnail images */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square w-20 overflow-hidden rounded-md ${
                    selectedImage === index ? 'ring-2 ring-red-600' : ''
                  }`}
                >
                  <Image
                    src={getImageUrl(image)}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="mt-2 text-3xl font-bold text-red-600">
              R$ {product.price.toFixed(2)}
            </p>
          </div>

          <div className="prose prose-sm">
            <p className="text-gray-600">{product.description}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Quantidade:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={increaseQuantity}
                  disabled={quantity >= (product.stock || 0)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <span>Estoque disponível: {product.stock || 0} unidades</span>
            </div>

            <Button
              size="lg"
              className="w-full bg-red-600 hover:bg-red-700"
              onClick={handleAddToCart}
              disabled={!product.stock || product.stock <= 0}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Adicionar ao Carrinho
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
