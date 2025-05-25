"use client"

import { use } from "react"
import ProductForm from "@/components/admin/product-form"

export default function EditCarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit Car Miniature</h1>
      <ProductForm category="cars" title="Edit Car Miniature" editMode={true} productId={id} />
    </div>
  )
}
