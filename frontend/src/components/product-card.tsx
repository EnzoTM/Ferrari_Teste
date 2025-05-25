"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ShoppingCart, Loader2, Play, Pause } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { API_URL } from "@/lib/api"
import { IProduct } from "@/types/models"

interface ProductCardProps {
  product: IProduct
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, isLoading } = useCart()
  const [imageError, setImageError] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Get the correct image URL
  const getImageUrl = () => {
    // If product has images array (from backend)
    if (product.images && product.images.length > 0) {
      return `${API_URL}/public/images/products/${product.images[0]}`
    }
    
    // Fallback to placeholder
    return "/placeholder.svg"
  }

  // Get the sound file URL
  const getSoundUrl = () => {
    if (product.soundFile) {
      return `${API_URL}/public/sounds/${product.soundFile}`
    }
    return null
  }

  const handleAddToCart = async () => {
    const cartItem = {
      id: product._id || '',
      name: product.name,
      price: product.price,
      image: getImageUrl(),
      quantity: 1,
      category: product.type
    }
    await addItem(cartItem)
  }

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
  }

  const isOutOfStock = product.stock !== undefined ? product.stock <= 0 : false

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/product/${product._id}`}>
        <div className="relative aspect-square overflow-hidden">
          {!imageError ? (
            <Image
              src={getImageUrl()}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
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
          {/* Audio play button */}
          {product.soundFile && (
            <div className="absolute top-2 right-2">
              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white border-none"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  toggleAudio()
                }}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </Link>
      
      {/* Hidden audio element */}
      {product.soundFile && (
        <audio
          ref={audioRef}
          src={getSoundUrl()!}
          onEnded={handleAudioEnded}
          preload="none"
        />
      )}

      <CardContent className="p-4">
        <Link href={`/product/${product._id}`}>
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