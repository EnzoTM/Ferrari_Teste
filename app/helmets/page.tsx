import type { Metadata } from "next"
import ProductGrid from "@/components/product-grid"

export const metadata: Metadata = {
  title: "Helmet Miniatures | Ferrari Store",
  description: "Explore our collection of Ferrari helmet miniatures",
}

const products = [
  {
    id: "helmet1",
    name: "Charles Leclerc 2023 Helmet",
    price: 89.99,
    image: "/helmets/charles/2023/1.png?height=300&width=300",
    category: "helmets",
    inStock: true,
  },
  {
    id: "helmet2",
    name: "Carlos Sainz 2023 Helmet",
    price: 89.99,
    image: "/helmets/sainzs/2023/1.jpeg?height=300&width=300",
    category: "helmets",
    inStock: true,
  },
  {
    id: "helmet3",
    name: "Charles Leclerc 2024 Helmet",
    price: 79.99,
    image: "/helmets/charles/2024/1.png?height=300&width=300",
    category: "helmets",
    inStock: false,
  },
  {
    id: "helmet4",
    name: "Carlos Sainz 2024 Helmet",
    price: 79.99,
    image: "/helmets/sainzs/2024/1.png?height=300&width=300",
    category: "helmets",
    inStock: true,
  },
  {
    id: "helmet5",
    name: "Carlos Sainz Miami 2024 Helmet",
    price: 129.99,
    image: "/helmets/sainzs/2024/miami/1.png?height=300&width=300",
    category: "helmets",
    inStock: false,
  },
]

export default function HelmetsPage() {
  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Helmet Miniatures</h1>
      <ProductGrid products={products} />
    </div>
  )
}
