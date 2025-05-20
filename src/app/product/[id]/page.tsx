"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/context/cart-context"
import { API_ENDPOINTS, API_URL } from "@/lib/api"
import { IProduct } from "@/types/models"
import { ChevronLeft, Loader2, Minus, Plus, ShoppingCart } from "lucide-react"
import Link from "next/link"

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const { addItem } = useCart()
  
  const [product, setProduct] = useState<IProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState("")
  
  // Buscar dados do produto pelo ID
  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) return
      
      try {
        setLoading(true)
        const response = await fetch(API_ENDPOINTS.product(params.id))
        
        if (!response.ok) {
          throw new Error('Produto não encontrado')
        }
        
        const data = await response.json()
        setProduct(data.product)
        
        // Seleciona primeira imagem como padrão, se existir
        if (data.product && data.product.images && data.product.images.length > 0) {
          setSelectedImage(data.product.images[0])
        }
      } catch (error) {
        console.error('Erro ao buscar produto:', error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar o produto. Tente novamente mais tarde.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchProduct()
  }, [params.id, toast])
  
  // Incrementar quantidade
  const incrementQuantity = () => {
    // Limitando a quantidade ao estoque disponível
    if (product && product.stock && quantity < product.stock) {
      setQuantity(prev => prev + 1)
    } else {
      toast({
        title: "Limite de estoque",
        description: "Quantidade máxima disponível em estoque.",
        variant: "destructive"
      })
    }
  }
  
  // Decrementar quantidade
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }
  
  // Adicionar ao carrinho
  const handleAddToCart = () => {
    if (!product) return
    
    addItem({
      id: product._id || "",
      name: product.name,
      price: product.price,
      image: product.images && product.images.length > 0 
        ? `${API_URL}/public/images/products/${product.images[0]}`
        : "/placeholder.svg",
      category: product.type,
      quantity
    })
    
    toast({
      title: "Produto adicionado ao carrinho",
      description: `${quantity}x ${product.name} foi adicionado ao seu carrinho.`,
    })
  }
  
  // Se estiver carregando, mostrar indicador
  if (loading) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    )
  }
  
  // Se produto não for encontrado
  if (!product) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <h1 className="text-2xl font-bold">Produto não encontrado</h1>
          <p>O produto que você está procurando não existe ou não está disponível.</p>
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="mt-4"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href={`/${product.type === 'car' ? 'cars' : product.type === 'formula1' ? 'formula1' : 'helmets'}`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Seção de imagens */}
        <div>
          <div className="relative mb-4 aspect-square overflow-hidden rounded-lg border">
            {selectedImage ? (
              <Image
                src={`${API_URL}/public/images/products/${selectedImage}`}
                alt={product.name}
                fill
                className="object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-100">
                <span className="text-gray-400">Sem imagem disponível</span>
              </div>
            )}
          </div>
          
          {/* Miniaturas das imagens */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((image, index) => (
                <div 
                  key={index}
                  className={`relative aspect-square cursor-pointer overflow-hidden rounded-md border ${
                    selectedImage === image ? 'border-red-600' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedImage(image)}
                >
                  <Image
                    src={`${API_URL}/public/images/products/${image}`}
                    alt={`${product.name} - imagem ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Seção de detalhes */}
        <div>
          <h1 className="mb-2 text-3xl font-bold">{product.name}</h1>
          
          <div className="mb-4 text-2xl font-bold text-red-600">
            R$ {product.price.toFixed(2)}
          </div>
          
          <div className="mb-6">
            <p className="text-gray-700">{product.description}</p>
          </div>
          
          {/* Exibir tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 font-semibold">Características:</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Informações de estoque */}
          <div className="mb-6">
            <div className="flex items-center">
              <span className="mr-2 font-semibold">Status:</span>
              {product.stock && product.stock > 0 ? (
                <span className="text-green-600">Em estoque ({product.stock} unidades)</span>
              ) : (
                <span className="text-red-600">Fora de estoque</span>
              )}
            </div>
          </div>
          
          {/* Controle de quantidade */}
          {product.stock && product.stock > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 font-semibold">Quantidade:</h3>
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={decrementQuantity} 
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="mx-4 min-w-[2rem] text-center">{quantity}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={incrementQuantity}
                  disabled={product.stock && quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Botão de adicionar ao carrinho */}
          <div className="mt-8">
            <Button 
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
