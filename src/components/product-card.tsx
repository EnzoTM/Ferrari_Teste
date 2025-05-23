"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { IProduct } from "@/types/models"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/hooks/use-toast"
import { ShoppingCart } from "lucide-react"

interface ProductCardProps {
  product: IProduct
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { toast } = useToast()

  const handleAddToCart = () => {
    // Converter o produto para o formato de item do carrinho
    const cartItem = {
      id: product._id || "",
      name: product.name,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg",
      category: product.type
    }

    addItem(cartItem)
  }

  // Verificar se a imagem principal existe
  const mainImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : "/placeholder.svg"

  // Formatar preço
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(product.price)

  // Determinar o link do produto com base no tipo
  const getProductLink = () => {
    return `/product/${product._id}`
  }

  // Verificar disponibilidade de estoque
  const isInStock = !product.stock || product.stock > 0

  return (
    <Card className="group overflow-hidden rounded-lg transition-all hover:shadow-md">
      <Link href={getProductLink()} className="block">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {product.featured && (
            <div className="absolute left-2 top-2 rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white">
              Destaque
            </div>
          )}
          {!isInStock && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 py-2 text-center text-sm font-semibold text-white">
              Esgotado
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={getProductLink()} className="block">
          <h3 className="mb-1 line-clamp-1 text-lg font-semibold">{product.name}</h3>
          <p className="line-clamp-2 text-sm text-gray-500">{product.description}</p>
        </Link>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t p-4">
        <span className="text-lg font-bold text-red-600">{formattedPrice}</span>
        <Button 
          size="sm" 
          onClick={handleAddToCart}
          disabled={!isInStock}
          className="bg-red-600 hover:bg-red-700"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Comprar
        </Button>
      </CardFooter>
    </Card>
  )
}