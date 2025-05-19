import type { Metadata } from "next"
import ProductGrid from "@/components/product-grid"

export const metadata: Metadata = {
  title: "Car Miniatures | Ferrari Store",
  description: "Explore our collection of Ferrari car miniatures",
}

const products = [
  {
    id: "car1",
    name: "Ferrari SF90 Stradale",
    price: 129.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "cars",
    inStock: true,
  },
  {
    id: "car2",
    name: "Ferrari 488 GTB",
    price: 119.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "cars",
    inStock: true,
  },
  {
    id: "car3",
    name: "Ferrari F8 Tributo",
    price: 139.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "cars",
    inStock: false,
  },
  {
    id: "car4",
    name: "Ferrari Roma",
    price: 124.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "cars",
    inStock: true,
  },
  {
    id: "car5",
    name: "Ferrari 812 Superfast",
    price: 149.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "cars",
    inStock: true,
  },
  {
    id: "car6",
    name: "Ferrari Portofino",
    price: 114.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "cars",
    inStock: true,
  },
  {
    id: "car7",
    name: "Ferrari Monza SP1",
    price: 199.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "cars",
    inStock: false,
  },
  {
    id: "car8",
    name: "Ferrari LaFerrari",
    price: 249.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "cars",
    inStock: true,
  },
]

export default function CarsPage() {
  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Miniatures</h1>
      <ProductGrid products={products} />
    </div>
  )
}
