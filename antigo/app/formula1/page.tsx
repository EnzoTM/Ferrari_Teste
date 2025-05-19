import type { Metadata } from "next"
import ProductGrid from "@/components/product-grid"

export const metadata: Metadata = {
  title: "Formula 1 Miniatures | Ferrari Store",
  description: "Explore our collection of Ferrari Formula 1 miniatures",
}

const products = [
  {
    id: "f1-1",
    name: "Ferrari F1-75 Charles Leclerc",
    price: 149.99,
    image: "/f1/CharlesF1-75_1.png?height=300&width=300",
    category: "formula1",
    inStock: true,
  },
  {
    id: "f1-2",
    name: "Ferrari F1-75 Carlos Sainz",
    price: 149.99,
    image: "/f1/CarlosF1-75_1.jpg?height=300&width=300",
    category: "formula1",
    inStock: true,
  },
  {
    id: "f1-3",
    name: "Ferrari 500 F2",
    price: 139.99,
    image: "/f1/F500_1.png?height=300&width=300",
    category: "formula1",
    inStock: false,
  },
  {
    id: "f1-4",
    name: "Sharknose Ferrari 156 F1",
    price: 129.99,
    image: "/f1/sharknose_1.jpg?height=300&width=300",
    category: "formula1",
    inStock: true,
  },
  {
    id: "f1-5",
    name: "Ferrari SF-24 Charles Leclerc Australian GP 2024 model",
    price: 119.99,
    image: "/f1/sf24_1.png?height=300&width=300",
    category: "formula1",
    inStock: true,
  },
  {
    id: "f1-6",
    name: "Ferrari SF-24 Carlos Sainz Australian",
    price: 199.99,
    image: "/f1/SF24S_1.png?height=300&width=300",
    category: "formula1",
    inStock: false,
  },
]

export default function Formula1Page() {
  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Formula 1 Miniatures</h1>
      <ProductGrid products={products} />
    </div>
  )
}
