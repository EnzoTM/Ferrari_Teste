"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Plus, Minus } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"

// Atualizando a interface do produto para incluir quantidade
interface Product {
  id: string
  name: string
  price: number
  description: string
  images: string[]
  category: string
  inStock: boolean
  hasSound?: boolean
  soundFile?: string
  quantity?: number
  sold?: number
}

// Mock product database
const products: Record<string, Product> = {
  // Car miniatures
  car1: {
    id: "car1",
    name: "Ferrari SF90 Stradale",
    price: 129.99,
    description:
      "The Ferrari SF90 Stradale is Ferrari's first series production PHEV (Plug-in Hybrid Electric Vehicle). This miniature is a perfect 1:18 scale replica with incredible attention to detail.",
    images: [
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
    ],
    category: "cars",
    inStock: true,
    hasSound: true,
    soundFile: "/sounds/ferrari-engine.mp3", // Default sound file
    quantity: 15,
    sold: 5,
  },
  car2: {
    id: "car2",
    name: "Ferrari 488 GTB",
    price: 119.99,
    description:
      "The Ferrari 488 GTB is a mid-engine sports car produced by the Italian automobile manufacturer Ferrari. This 1:18 scale model captures every detail of this iconic vehicle.",
    images: [
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
    ],
    category: "cars",
    inStock: true,
    hasSound: true,
    soundFile: "/sounds/ferrari-engine.mp3", // Default sound file
    quantity: 8,
    sold: 12,
  },
  // ... outros produtos com quantidade e vendas

  // Adicionando quantidade e vendas para os outros produtos
  car3: {
    id: "car3",
    name: "Ferrari F8 Tributo",
    price: 139.99,
    description:
      "The Ferrari F8 Tributo is the successor to the 488 GTB and was unveiled at the 2019 Geneva Motor Show. This detailed miniature captures the essence of this powerful Ferrari model.",
    images: [
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
    ],
    category: "cars",
    inStock: false,
    hasSound: true,
    soundFile: "/sounds/ferrari-engine.mp3",
    quantity: 0,
    sold: 20,
  },
  car4: {
    id: "car4",
    name: "Ferrari Roma",
    price: 124.99,
    description:
      "The Ferrari Roma is a grand touring sports car produced by Ferrari. This miniature perfectly replicates the sleek and elegant design of the full-size vehicle.",
    images: [
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
    ],
    category: "cars",
    inStock: true,
    hasSound: true,
    soundFile: "/sounds/ferrari-engine.mp3", // Default sound file
    quantity: 10,
    sold: 5,
  },
  car5: {
    id: "car5",
    name: "Ferrari 812 Superfast",
    price: 149.99,
    description:
      "The Ferrari 812 Superfast is a front mid-engine, rear-wheel-drive grand tourer produced by Ferrari. This miniature captures the aggressive styling and powerful presence of the original.",
    images: [
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
    ],
    category: "cars",
    inStock: true,
    hasSound: true,
    soundFile: "/sounds/ferrari-engine.mp3", // Default sound file
    quantity: 7,
    sold: 3,
  },
  car6: {
    id: "car6",
    name: "Ferrari Portofino",
    price: 114.99,
    description:
      "The Ferrari Portofino is a grand touring sports car produced by Ferrari. This miniature model showcases the convertible design and elegant styling of the original vehicle.",
    images: [
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
    ],
    category: "cars",
    inStock: true,
    hasSound: true,
    soundFile: "/sounds/ferrari-engine.mp3", // Default sound file
    quantity: 12,
    sold: 8,
  },
  car7: {
    id: "car7",
    name: "Ferrari Monza SP1",
    price: 199.99,
    description:
      "The Ferrari Monza SP1 is a limited production single-seat sports car produced by Ferrari. This detailed miniature captures the unique design and exclusivity of this special model.",
    images: [
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
    ],
    category: "cars",
    inStock: false,
    hasSound: true,
    soundFile: "/sounds/ferrari-engine.mp3", // Default sound file
    quantity: 0,
    sold: 15,
  },
  car8: {
    id: "car8",
    name: "Ferrari LaFerrari",
    price: 249.99,
    description:
      "The Ferrari LaFerrari is a limited production hybrid sports car produced by Ferrari. This miniature model captures the revolutionary design and technology of this flagship Ferrari.",
    images: [
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
    ],
    category: "cars",
    inStock: true,
    hasSound: true,
    soundFile: "/sounds/ferrari-engine.mp3", // Default sound file
    quantity: 6,
    sold: 4,
  },

  // Formula 1 miniatures
  "f1-1": {
    id: "f1-1",
    name: "Ferrari F1-75 Charles Leclerc",
    price: 149.99,
    description:
      "The Ferrari F1-75 is the car used by Scuderia Ferrari in the 2022 Formula One World Championship. This 1:18 scale model features Charles Leclerc's livery with exquisite details.",
    images: [
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
    ],
    category: "formula1",
    inStock: true,
    hasSound: true,
    soundFile: "/sounds/f1-engine.mp3", // Default sound file
    quantity: 9,
    sold: 11,
  },
  "f1-2": {
    id: "f1-2",
    name: "Ferrari F1-75 Carlos Sainz",
    price: 149.99,
    description:
      "The Ferrari F1-75 is the car used by Scuderia Ferrari in the 2022 Formula One World Championship. This 1:18 scale model features Carlos Sainz's livery with exquisite details.",
    images: [
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
    ],
    category: "formula1",
    inStock: true,
    hasSound: true,
    soundFile: "/sounds/f1-engine.mp3", // Default sound file
    quantity: 5,
    sold: 7,
  },
  "f1-3": {
    id: "f1-3",
    name: "Ferrari SF21 2021 Season",
    price: 139.99,
    description:
      "The Ferrari SF21 is the car used by Scuderia Ferrari in the 2021 Formula One World Championship. This detailed miniature captures the unique livery and technical features of this F1 car.",
    images: [
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
    ],
    category: "formula1",
    inStock: false,
    hasSound: true,
    soundFile: "/sounds/f1-engine.mp3", // Default sound file
    quantity: 0,
    sold: 9,
  },
  "f1-4": {
    id: "f1-4",
    name: "Ferrari SF90 2019 Season",
    price: 129.99,
    description:
      "The Ferrari SF90 is the car used by Scuderia Ferrari in the 2019 Formula One World Championship. This miniature model showcases the 90th anniversary livery used during that season.",
    images: [
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
    ],
    category: "formula1",
    inStock: true,
    hasSound: true,
    soundFile: "/sounds/f1-engine.mp3", // Default sound file
    quantity: 11,
    sold: 6,
  },
  "f1-5": {
    id: "f1-5",
    name: "Ferrari SF71H 2018 Season",
    price: 119.99,
    description:
      "The Ferrari SF71H is the car used by Scuderia Ferrari in the 2018 Formula One World Championship. This detailed miniature captures the technical innovations and design of this competitive F1 car.",
    images: [
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
    ],
    category: "formula1",
    inStock: true,
    hasSound: true,
    soundFile: "/sounds/f1-engine.mp3", // Default sound file
    quantity: 4,
    sold: 2,
  },
  "f1-6": {
    id: "f1-6",
    name: "Ferrari F2004 Michael Schumacher",
    price: 199.99,
    description:
      "The Ferrari F2004 is one of the most successful Formula One cars ever built, driven by Michael Schumacher during his dominant 2004 season. This collector's item captures this iconic car in perfect detail.",
    images: [
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
    ],
    category: "formula1",
    inStock: false,
    hasSound: true,
    soundFile: "/sounds/f1-engine.mp3", // Default sound file
    quantity: 0,
    sold: 18,
  },

  // Helmet miniatures
  helmet1: {
    id: "helmet1",
    name: "Charles Leclerc 2023 Helmet",
    price: 89.99,
    description:
      "This 1:2 scale replica of Charles Leclerc's 2023 helmet features his distinctive design and Ferrari branding. Perfect for collectors and F1 fans.",
    images: [
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
    ],
    category: "helmets",
    inStock: true,
    hasSound: false,
    quantity: 13,
    sold: 7,
  },
  helmet2: {
    id: "helmet2",
    name: "Carlos Sainz 2023 Helmet",
    price: 89.99,
    description:
      "This 1:2 scale replica of Carlos Sainz's 2023 helmet showcases his unique design and Ferrari team colors. A must-have for any Ferrari collection.",
    images: [
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
    ],
    category: "helmets",
    inStock: true,
    hasSound: false,
    quantity: 8,
    sold: 3,
  },
  helmet3: {
    id: "helmet3",
    name: "Sebastian Vettel Ferrari Helmet",
    price: 79.99,
    description:
      "This 1:2 scale replica of Sebastian Vettel's Ferrari helmet from his time with the team features his iconic design. A great collectible for F1 enthusiasts.",
    images: [
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
    ],
    category: "helmets",
    inStock: false,
    hasSound: false,
    quantity: 0,
    sold: 12,
  },
  helmet4: {
    id: "helmet4",
    name: "Kimi Räikkönen Ferrari Helmet",
    price: 79.99,
    description:
      "This 1:2 scale replica of Kimi Räikkönen's Ferrari helmet captures the design used during his second stint with the team. A perfect addition to any Ferrari collection.",
    images: [
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
    ],
    category: "helmets",
    inStock: true,
    hasSound: false,
    quantity: 6,
    sold: 1,
  },
  helmet5: {
    id: "helmet5",
    name: "Michael Schumacher Ferrari Helmet",
    price: 129.99,
    description:
      "This 1:2 scale replica of Michael Schumacher's iconic Ferrari helmet from his championship years is a premium collector's item with exceptional detail and quality.",
    images: [
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
      "/placeholder.svg?height=500&width=500",
    ],
    category: "helmets",
    inStock: false,
    hasSound: false,
    quantity: 0,
    sold: 25,
  },
}

export default function ProductPage() {
  const { id } = useParams()
  const [currentImage, setCurrentImage] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [quantity, setQuantity] = useState(1) // Estado para controlar a quantidade
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { addItem } = useCart()
  const { toast } = useToast()
  const router = useRouter()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [product, setProduct] = useState<Product | null>(null)

  // Get product data based on ID
  useEffect(() => {
    if (!id) return

    // First check if it's one of our default products
    const productId = Array.isArray(id) ? id[0] : id
    const defaultProduct = products[productId as keyof typeof products]

    if (defaultProduct) {
      setProduct(defaultProduct)
      return
    }

    // If not found in default products, check localStorage for custom products
    const category = productId.startsWith("c-")
      ? "cars"
      : productId.startsWith("f-")
        ? "formula1"
        : productId.startsWith("h-")
          ? "helmets"
          : ""

    if (category) {
      const storageKey = `ferrari${category.charAt(0).toUpperCase() + category.slice(1)}`
      const customProducts = JSON.parse(localStorage.getItem(storageKey) || "[]")
      const customProduct = customProducts.find((p: any) => p.id === productId)

      if (customProduct) {
        // Garantir que produtos personalizados tenham quantidade e vendas
        if (customProduct.quantity === undefined) {
          customProduct.quantity = 10
          customProduct.sold = 0
        }
        setProduct(customProduct)
        return
      }
    }
  }, [id])

  const nextImage = () => {
    if (!product) return
    setCurrentImage((prev) => (prev + 1) % product.images.length)
  }

  const prevImage = () => {
    if (!product) return
    setCurrentImage((prev) => (prev - 1 + product.images.length) % product.images.length)
  }

  const toggleSound = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }

    setIsPlaying(!isPlaying)
  }

  // Função para incrementar a quantidade
  const incrementQuantity = () => {
    if (product && quantity < (product.quantity || 0)) {
      setQuantity(quantity + 1)
    }
  }

  // Função para decrementar a quantidade
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  // Função para lidar com a mudança manual da quantidade
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value >= 1 && product && value <= (product.quantity || 0)) {
      setQuantity(value)
    }
  }

  const handleAddToCart = () => {
    if (!product) return

    // Adicionar ao carrinho com a quantidade selecionada
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      category: product.category,
      quantity: quantity,
    })

    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} has been added to your cart.`,
      duration: 3000,
    })
  }

  const handleBuyNow = () => {
    if (!product) return

    // Adicionar ao carrinho com a quantidade selecionada
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      category: product.category,
      quantity: quantity,
    })

    router.push("/cart")
  }

  // Handle case where product is not found
  if (!product) {
    return (
      <div className="container flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Product Not Found</h1>
          <p className="mt-2">The product you are looking for does not exist.</p>
          <Button className="mt-4 bg-red-600 hover:bg-red-700" asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4 md:py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        {/* Product Images */}
        <div className="relative aspect-square overflow-hidden rounded-lg border">
          {product.images.map((image: string, index: number) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-300 ${
                index === currentImage ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`${product.name} - Image ${index + 1}`}
                fill
                className="object-contain"
              />
            </div>
          ))}

          <div className="absolute inset-0 flex items-center justify-between p-4">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-white/80 hover:bg-white"
              onClick={prevImage}
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
              <span className="sr-only">Previous image</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-white/80 hover:bg-white"
              onClick={nextImage}
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
              <span className="sr-only">Next image</span>
            </Button>
          </div>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
            {product.images.map((_: string, index: number) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full ${index === currentImage ? "bg-red-600" : "bg-gray-300"}`}
                onClick={() => setCurrentImage(index)}
              >
                <span className="sr-only">Go to image {index + 1}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{product.name}</h1>
          <p className="mt-2 text-xl font-bold text-red-600 md:text-2xl">${product.price.toFixed(2)}</p>

          <div className="mt-4">
            {product.quantity !== undefined ? (
              <Badge className={product.quantity > 0 ? "bg-green-600" : "bg-red-600"}>
                {product.quantity > 0 ? `${product.quantity} in stock` : "Out of stock"}
              </Badge>
            ) : (
              <Badge className={product.inStock ? "bg-green-600" : "bg-red-600"}>
                {product.inStock ? "In stock" : "Out of stock"}
              </Badge>
            )}

            {product.sold !== undefined && product.sold > 0 && (
              <Badge variant="outline" className="ml-2 border-gray-400 text-gray-600">
                {product.sold} sold
              </Badge>
            )}
          </div>

          <div className="mt-4 md:mt-6">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="mt-2 text-gray-700">{product.description}</p>
          </div>

          {product.hasSound && (
            <div className="mt-4 md:mt-6">
              <h2 className="text-lg font-semibold">Engine Sound</h2>
              <Button
                variant="outline"
                className={`mt-2 ${isPlaying ? "border-red-600 text-red-600" : ""}`}
                onClick={toggleSound}
              >
                {isPlaying ? (
                  <>
                    <VolumeX className="mr-2 h-4 w-4" />
                    Stop Sound
                  </>
                ) : (
                  <>
                    <Volume2 className="mr-2 h-4 w-4" />
                    Play Sound
                  </>
                )}
              </Button>
              {/* Hidden audio element */}
              {product.soundFile && (
                <audio ref={audioRef} src={product.soundFile} onEnded={() => setIsPlaying(false)} className="hidden" />
              )}
            </div>
          )}

          {(product.inStock || (product.quantity !== undefined && product.quantity > 0)) && (
            <div className="mt-6 space-y-3 md:mt-8">
              {/* Seletor de quantidade */}
              <div className="flex items-center">
                <span className="mr-4 font-medium">Quantity:</span>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                    <span className="sr-only">Decrease quantity</span>
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min={1}
                    max={product.quantity || 1}
                    className="mx-2 h-8 w-16 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={incrementQuantity}
                    disabled={product.quantity !== undefined && quantity >= product.quantity}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Increase quantity</span>
                  </Button>
                </div>
              </div>

              <Button className="w-full bg-red-600 hover:bg-red-700" onClick={handleAddToCart}>
                Add to Cart
              </Button>
              <Button className="w-full" variant="outline" onClick={handleBuyNow}>
                Buy Now
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
