"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import ProductCard from "@/components/product-card"
import { useMediaQuery } from "@/hooks/use-media-query"

const carouselImages = [
  {
    src: "/placeholder.svg?height=600&width=1200",
    alt: "Ferrari Showcase 1",
  },
  {
    src: "/placeholder.svg?height=600&width=1200",
    alt: "Ferrari Showcase 2",
  },
  {
    src: "/placeholder.svg?height=600&width=1200",
    alt: "Ferrari Showcase 3",
  },
]

const featuredProducts = [
  {
    id: "car1",
    name: "Ferrari SF90 Stradale",
    price: 129.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "cars",
    inStock: true,
  },
  {
    id: "f1-1",
    name: "Ferrari F1-75 Charles Leclerc",
    price: 149.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "formula1",
    inStock: true,
  },
  {
    id: "helmet1",
    name: "Ferrari F1 Driver Helmet",
    price: 89.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "helmets",
    inStock: false,
  },
  {
    id: "car2",
    name: "Ferrari 488 GTB",
    price: 119.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "cars",
    inStock: true,
  },
]

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  //const [featuredProducts, setFeaturedProducts] = useState([])

  const isMobile = useMediaQuery("(max-width: 768px)")

  //useEffect for slide
  useEffect(() => { 
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  //useEffect to fetch featured products
  /*useEffect(() => {
    const fetchFeaturedProducts = async () => {
      const response = await fetch("linkBase/products?featured=true") //dar o get para pegar os produtos
      const AllProducts = await response.json() //passar os produtos para json

      setFeaturedProducts(AllProducts)
    }
  }, [])*/

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)
  }

  return (
    <div className="flex flex-col">
      {/* Hero Carousel */}
      <div className="relative h-[300px] w-full overflow-hidden md:h-[400px] lg:h-[500px]">
        {carouselImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={image.src || "/placeholder.svg"}
              alt={image.alt}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}

        <div className="absolute inset-0 flex items-center justify-between p-4">
          <Button variant="outline" size="icon" className="rounded-full bg-white/80 hover:bg-white" onClick={prevSlide}>
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Previous slide</span>
          </Button>
          <Button variant="outline" size="icon" className="rounded-full bg-white/80 hover:bg-white" onClick={nextSlide}>
            <ChevronRight className="h-6 w-6" />
            <span className="sr-only">Next slide</span>
          </Button>
        </div>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full ${index === currentSlide ? "bg-white" : "bg-white/50"}`}
              onClick={() => setCurrentSlide(index)}
            >
              <span className="sr-only">Go to slide {index + 1}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <section className="container py-8 md:py-12">
        <h2 className="mb-6 text-2xl font-bold md:mb-8 md:text-3xl">Featured Products</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 md:mt-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
            <Link href="/cars" className="block">
              <Card className="overflow-hidden transition-all hover:shadow-lg">
                <div className="aspect-video relative">
                  <Image
                    src="/placeholder.svg?height=200&width=400"
                    alt="Car Miniatures"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold md:text-xl">Car Miniatures</h3>
                  <p className="text-sm text-gray-500">Explore our collection of Ferrari car miniatures</p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full bg-red-600 hover:bg-red-700">Shop Now</Button>
                </CardFooter>
              </Card>
            </Link>

            <Link href="/formula1" className="block">
              <Card className="overflow-hidden transition-all hover:shadow-lg">
                <div className="aspect-video relative">
                  <Image
                    src="/placeholder.svg?height=200&width=400"
                    alt="Formula 1 Miniatures"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold md:text-xl">Formula 1 Miniatures</h3>
                  <p className="text-sm text-gray-500">Discover our Formula 1 Ferrari collection</p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full bg-red-600 hover:bg-red-700">Shop Now</Button>
                </CardFooter>
              </Card>
            </Link>

            <Link href="/helmets" className="block">
              <Card className="overflow-hidden transition-all hover:shadow-lg">
                <div className="aspect-video relative">
                  <Image
                    src="/placeholder.svg?height=200&width=400"
                    alt="Ferrari Helmets"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold md:text-xl">Ferrari Helmets</h3>
                  <p className="text-sm text-gray-500">Premium Ferrari helmet miniatures</p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full bg-red-600 hover:bg-red-700">Shop Now</Button>
                </CardFooter>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
