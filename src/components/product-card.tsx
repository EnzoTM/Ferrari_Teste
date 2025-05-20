"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { IProduct } from "@/types/models"
import { API_URL } from "@/lib/api"
import { ShoppingCart, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

interface ProductCardProps {
  product: IProduct
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  
  // Determina a imagem a ser exibida
  const imageUrl = product.images && product.images.length > 0
    ? `${API_URL}/${product.images[0]}`
    : `/placeholder.jpg`
  
  // Função para adicionar ao carrinho
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Implementação da lógica de adicionar ao carrinho será feita posteriormente
    // usando o CartContext
    
    toast({
      title: "Adicionado ao carrinho",
      description: `${product.name} foi adicionado ao seu carrinho.`,
      variant: "default",
    })
  }
  
  // Função para visualizar detalhes
  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push(`/product/${product._id}`)
  }
  
  return (
    <div 
      className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product._id}`} className="block">
        <div className="relative h-64 w-full overflow-hidden">
          <Image 
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Botões de ação */}
          <div 
            className={`absolute inset-0 flex items-center justify-center gap-2 bg-black/30 transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Button 
              size="icon" 
              variant="outline" 
              className="h-10 w-10 rounded-full bg-white text-red-600 hover:bg-red-600 hover:text-white"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
            
            <Button 
              size="icon" 
              variant="outline" 
              className="h-10 w-10 rounded-full bg-white text-red-600 hover:bg-red-600 hover:text-white"
              onClick={handleViewDetails}
            >
              <Eye className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="mb-1 text-lg font-semibold text-gray-900">{product.name}</h3>
          <p className="mb-2 text-sm text-gray-500 line-clamp-2">{product.description}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-red-600">{formatCurrency(product.price)}</span>
            <span className="text-xs text-gray-500">
              {product.stock && product.stock > 0 ? `${product.stock} em estoque` : 'Esgotado'}
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}
