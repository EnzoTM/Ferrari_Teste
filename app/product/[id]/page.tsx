"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/components/ui/use-toast"

// Mock product database
const products = {
  // Car miniatures
  car1: {
    id: "car1",
    name: "Ferrari SF90 Stradale",
    price: 129.99,
    description:
      "The Ferrari SF90 Stradale is Ferrari's first series production PHEV (Plug-in Hybrid Electric Vehicle). This miniature is a perfect 1:18 scale replica with incredible attention to detail.",
    images: [
      "/cars/sf90/1.png?height=500&width=500",
      "/cars/sf90/2.png?height=500&width=500",
      "/cars/sf90/3.png?height=500&width=500",
    ],
    category: "cars",
    inStock: true,
    hasSound: true,
    soundFile: "/sounds/ferrari-engine.mp3", // Default sound file
  },
  car2: {
    id: "car2",
    name: "Ferrari 488 GTB",
    price: 119.99,
    description:
      "The Ferrari 488 GTB is a mid-engine sports car produced by the Italian automobile manufacturer Ferrari. This 1:18 scale model captures every detail of this iconic vehicle.",
    images: [
      "/cars/488/1.png?height=500&width=500",
      "/cars/488/2.png?height=500&width=500",
      "/cars/488/3.png?height=500&width=500",
    ],
    category: "cars",
    inStock: true,
    hasSound: true,
    soundFile: "/sounds/ferrari-engine.mp3", // Default sound file
  },
  car3: {
    id: "car3",
    name: "Ferrari F8 Tributo",
    price: 139.99,
    description:
      "The Ferrari F8 Tributo is the successor to the 488 GTB and was unveiled at the 2019 Geneva Motor Show. This detailed miniature captures the essence of this powerful Ferrari model.",
    images: [
      "/cars/f8/1.png?height=500&width=500",
      "/cars/f8/2.png?height=500&width=500",
      "/cars/f8/3.png?height=500&width=500",
    ],
    category: "cars",
    inStock: false,
    hasSound: true,
    soundFile: "/sounds/ferrari-engine.mp3", // Default sound file
  },
  car4: {
    id: "car4",
    name: "Ferrari Roma",
    price: 124.99,
    description:
      "The Ferrari Roma is a grand touring sports car produced by Ferrari. This miniature perfectly replicates the sleek and elegant design of the full-size vehicle.",
    images: [
      "/cars/roma/1.png?height=500&width=500",
      "/cars/roma/2.png?height=500&width=500",
      "/cars/roma/3.png?height=500&width=500",
    ],
    category: "cars",
    inStock: true,
    hasSound: true,
    soundFile: "/sounds/ferrari-engine.mp3", // Default sound file
  },
  car5: {
    id: "car5",
    name: "Ferrari 812 Superfast",
    price: 149.99,
    description:
      "The Ferrari 812 Superfast is a front mid-engine, rear-wheel-drive grand tourer produced by Ferrari. This miniature captures the aggressive styling and powerful presence of the original.",
    images: [
      "/cars/812/1.png?height=500&width=500",
      "/cars/812/2.png?height=500&width=500",
      "/cars/812/3.png?height=500&width=500",
    ],
    category: "cars",
    inStock: true,
    hasSound: true,
    soundFile: "/sounds/ferrari-engine.mp3", // Default sound file
  },
  car6: {
    id: "car6",
    name: "Ferrari Portofino",
    price: 114.99,
    description:
      "The Ferrari Portofino is a grand touring sports car produced by Ferrari. This miniature model showcases the convertible design and elegant styling of the original vehicle.",
    images: [
      "/cars/portofino/1.png?height=500&width=500",
      "/cars/portofino/2.png?height=500&width=500",
      "/cars/portofino/3.png?height=500&width=500",
    ],
    category: "cars",
    inStock: true,
    hasSound: true,
    soundFile: "/sounds/ferrari-engine.mp3", // Default sound file
  },
  car7: {
    id: "car7",
    name: "Ferrari Monza SP1",
    price: 199.99,
    description:
      "The Ferrari Monza SP1 is a limited production single-seat sports car produced by Ferrari. This detailed miniature captures the unique design and exclusivity of this special model.",
    images: [
      "/cars/monza_sp1/1.png?height=500&width=500",
      "/cars/monza_sp1/2.png?height=500&width=500",
      "/cars/monza_sp1/3.png?height=500&width=500",
    ],
    category: "cars",
    inStock: false,
    hasSound: true,
    soundFile: "/sounds/ferrari-engine.mp3", // Default sound file
  },
  car8: {
    id: "car8",
    name: "Ferrari LaFerrari",
    price: 249.99,
    description:
      "The Ferrari LaFerrari is a limited production hybrid sports car produced by Ferrari. This miniature model captures the revolutionary design and technology of this flagship Ferrari.",
    images: [
      "/cars/laferrari/1.png?height=500&width=500",
      "/cars/laferrari/2.png?height=500&width=500",
      "/cars/laferrari/3.png?height=500&width=500",
    ],
    category: "cars",
    inStock: true,
    hasSound: true,
    soundFile: "/sounds/ferrari-engine.mp3", // Default sound file
  },

  // Formula 1 miniatures
  "f1-1": {
    id: "f1-1",
    name: "Ferrari F1-75 Charles Leclerc",
    price: 149.99,
    description:
      "The Ferrari F1-75 is the car used by Scuderia Ferrari in the 2022 Formula One World Championship. This 1:18 scale model features Charles Leclerc's livery with exquisite details.",
    images: [
      "/f1/CharlesF1-75_1.png?height=500&width=500",
      "/f1/CharlesF1-75_2.png?height=500&width=500",
      "/f1/CharlesF1-75_3.png?height=500&width=500",
    ],
    category: "formula1",
    inStock: true,
    hasSound: true,
    soundFile: "/sounds/f1-engine.mp3", // Default sound file
  },
  "f1-2": {
    id: "f1-2",
    name: "Ferrari F1-75 Carlos Sainz",
    price: 149.99,
    description:
      "The Ferrari F1-75 is the car used by Scuderia Ferrari in the 2022 Formula One World Championship. This 1:18 scale model features Carlos Sainz's livery with exquisite details.",
    images: [
      "/f1/CarlosF1-75_1.jpg?height=500&width=500",
      "/f1/CarlosF1-75_2.jpg?height=500&width=500",
      "/f1/CarlosF1-75_3.jpg?height=500&width=500",
    ],
    category: "formula1",
    inStock: true,
    hasSound: true,
    soundFile: "/sounds/f1-engine.mp3", // Default sound file
  },
  "f1-3": {
    id: "f1-3",
    name: "Ferrari SF21 2021 Season",
    price: 139.99,
    description:
      "The Ferrari SF21 is the car used by Scuderia Ferrari in the 2021 Formula One World Championship. This detailed miniature captures the unique livery and technical features of this F1 car.",
    images: [
      "/f1/SF21_1.png?height=500&width=500",
      "/f1/SF21_2.png?height=500&width=500",
      "/f1/SF21_3.png?height=500&width=500",
    ],
    category: "formula1",
    inStock: false,
    hasSound: true,
    soundFile: "/sounds/f1-engine.mp3", // Default sound file
  },
  "f1-4": {
    id: "f1-4",
    name: "Sharknose Ferrari 156 F1",
    price: 129.99,
    description:
      "The Ferrari ",
    images: [
      "/f1/sharknose_1.jpg?height=500&width=500",
      "/f1/sharknose_2.jpg?height=500&width=500",
      "/f1/sharknose_3.jpeg?height=500&width=500",
    ],
    category: "formula1",
    inStock: true,
    hasSound: true,
    soundFile: "/sounds/f1-engine.mp3", // Default sound file
  },
  "f1-5": {
    id: "f1-5",
    name: "Ferrari SF-24 Charles Leclerc Australian GP 2024 model",
    price: 119.99,
    description:
      "The Ferrari SF24",
    images: [
      "/f1/sf24_1.png?height=500&width=500",
      "/f1/sf24_2.png?height=500&width=500",
      "/f1/sf24_3.png?height=500&width=500",
    ],
    category: "formula1",
    inStock: true,
    hasSound: true,
    soundFile: "/sounds/f1-engine.mp3", // Default sound file
  },
  "f1-6": {
    id: "f1-6",
    name: "Ferrari F1-75 steering wheel",
    price: 199.99,
    description:
      "Ferrari F1-75 steering wheel",
    images: [
      "/f1/F1-75_wheel_1.png?height=500&width=500",
      "/f1/F1-75_wheel_2.png?height=500&width=500",
      "/f1/F1-75_wheel_3.png?height=500&width=500",
    ],
    category: "formula1",
    inStock: false,
    hasSound: true,
    soundFile: "/sounds/f1-engine.mp3", // Default sound file
  },

  // Helmet miniatures
  helmet1: {
    id: "helmet1",
    name: "Charles Leclerc 2023 Helmet",
    price: 89.99,
    description:
      "This 1:2 scale replica of Charles Leclerc's 2023 helmet features his distinctive design and Ferrari branding. Perfect for collectors and F1 fans.",
    images: [
      "/helmets/charles/2023/1.png?height=500&width=500",
      "/helmets/charles/2023/2.png??height=500&width=500",
      "/helmets/charles/2023/3.png??height=500&width=500",
    ],
    category: "helmets",
    inStock: true,
    hasSound: false,
  },
  helmet2: {
    id: "helmet2",
    name: "Carlos Sainz 2023 Helmet",
    price: 89.99,
    description:
      "This 1:2 scale replica of Carlos Sainz's 2023 helmet showcases his unique design and Ferrari team colors. A must-have for any Ferrari collection.",
    images: [
      "/helmets/sainzs/2023/1.jpeg?height=500&width=500",
      "/helmets/sainzs/2023/2.jpeg?height=500&width=500",
      "/helmets/sainzs/2023/3.jpeg?height=500&width=500",
    ],
    category: "helmets",
    inStock: true,
    hasSound: false,
  },
  helmet3: {
    id: "helmet3",
    name: "Charles Leclerc 2024 Helmet",
    price: 79.99,
    description:
      "This 1:1 scale replica of Charles Leclerc's 2024 helmet. A great collectible for F1 enthusiasts.",
    images: [
      "/helmets/charles/2024/1.png?height=500&width=500",
      "/helmets/charles/2024/2.png??height=500&width=500",
      "/helmets/charles/2024/3.png??height=500&width=500",
    ],
    category: "helmets",
    inStock: false,
    hasSound: false,
  },
  helmet4: {
    id: "helmet4",
    name: "Carlos Sainz 2024 Helmet",
    price: 79.99,
    description:
      "This 1:1 scale replica of Carlos Sainz's 2024 helmet. A perfect addition to any Ferrari collection.",
    images: [
      "/helmets/sainzs/2024/1.png?height=500&width=500",
      "/helmets/sainzs/2024/2.png??height=500&width=500",
      "/helmets/sainzs/2024/3.png??height=500&width=500",
    ],
    category: "helmets",
    inStock: true,
    hasSound: false,
  },
  helmet5: {
    id: "helmet5",
    name: "Carlos Sainz Miami 2024 Helmet",
    price: 129.99,
    description:
      "This 1:1 scale replica of Carlos Sainz's 2024 Miami Special Edition helmet",
    images: [
      "/helmets/sainzs/2024/miami/1.png?height=500&width=500",
      "/helmets/sainzs/2024/miami/2.png??height=500&width=500",
      "/helmets/sainzs/2024/miami/3.png??height=500&width=500",
    ],
    category: "helmets",
    inStock: false,
    hasSound: false,
  },
}

export default function ProductPage() {
  const { id } = useParams()
  const [currentImage, setCurrentImage] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { addItem } = useCart()
  const { toast } = useToast()
  const router = useRouter()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [product, setProduct] = useState<any>(null)

  // Get product data based on ID
  useEffect(() => {
    if (!id) return

    // First check if it's one of our default products
    const defaultProduct = products[id as keyof typeof products]

    if (defaultProduct) {
      setProduct(defaultProduct)
      return
    }

    // If not found in default products, check localStorage for custom products
    const productId = id as string
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

  const handleAddToCart = () => {
    if (!product) return

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      category: product.category,
    })

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
      duration: 3000,
    })
  }

  const handleBuyNow = () => {
    if (!product) return

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      category: product.category,
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
            <a href="/">Return to Home</a>
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
                className="object-cover"
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
            {product.inStock ? (
              <Badge className="bg-green-600">In Stock</Badge>
            ) : (
              <Badge variant="outline" className="border-red-500 text-red-600">
                Out of Stock
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

          {product.inStock && (
            <div className="mt-6 space-y-3 md:mt-8">
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
