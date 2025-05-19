import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  inStock: boolean
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-lg">
        <div className="aspect-square relative">
          <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-1">{product.name}</h3>
          <div className="mt-2 flex items-center justify-between">
            <p className="font-bold text-red-600">${product.price.toFixed(2)}</p>
            {product.inStock ? (
              <Badge variant="outline" className="border-green-500 text-green-600">
                In Stock
              </Badge>
            ) : (
              <Badge variant="outline" className="border-red-500 text-red-600">
                Out of Stock
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
