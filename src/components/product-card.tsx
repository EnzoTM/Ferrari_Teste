"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ShoppingCart, Loader2 } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { API_URL } from "@/lib/api"

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    image?: string
    images?: string[]
    category: string
    type?: string
    inStock?: boolean
    stock?: number
    _id?: string
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, isLoading } = useCart()
  const [imageError, setImageError] = useState(false)

  // Get the correct image URL
  const getImageUrl = () => {
    // If product has images array (from backend)
    if (product.images && product.images.length > 0) {
      return `${API_URL}/public/images/products/${product.images[0]}`
    }
    
    // If product has single image property
    if (product.image) {
      // Check if it's already a full URL
      if (product.image.startsWith('http') || product.image.startsWith('/api') || product.image.startsWith('/public')) {
        return product.image.startsWith('http') ? product.image : `${API_URL}${product.image}`
      }
      // Otherwise, construct the URL
      return `${API_URL}/public/images/products/${product.image}`
    }
    
    // Fallback to placeholder
    return "/placeholder.svg"
  }

  const handleAddToCart = async () => {
    const cartItem = {
      id: product._id || product.id,
      name: product.name,
      price: product.price,
      image: getImageUrl(),
      category: product.type || product.category,
      quantity: 1
    }

    await addItem(cartItem)
  }

  const isOutOfStock = product.stock !== undefined ? product.stock <= 0 : !product.inStock

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/product/${product._id || product.id}`}>
        <div className="relative aspect-square overflow-hidden">
          {!imageError ? (
            <Image
              src={getImageUrl()}
              alt={product.name}
              fill
              className="object-contain transition-transform group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <span className="text-gray-400">Sem imagem</span>
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-white font-semibold">Fora de Estoque</span>
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/product/${product._id || product.id}`}>
          <h3 className="mb-2 font-semibold hover:text-red-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-xl font-bold text-red-600">
          R$ {product.price.toFixed(2)}
        </p>
        {product.stock !== undefined && (
          <p className="text-sm text-gray-500">
            {product.stock > 0 ? `${product.stock} em estoque` : 'Fora de estoque'}
          </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50"
          onClick={handleAddToCart}
          disabled={isLoading || isOutOfStock}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adicionando...
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Adicionar ao Carrinho
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}