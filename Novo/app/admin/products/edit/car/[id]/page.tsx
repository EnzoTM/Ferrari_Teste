"use client"

import { useParams } from "next/navigation"
import ProductForm from "@/components/admin/product-form"

export default function EditCarPage() {
  const { id } = useParams()

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit Car Miniature</h1>
      <ProductForm category="cars" title="Edit Car Miniature" editMode={true} productId={id as string} />
    </div>
  )
}
