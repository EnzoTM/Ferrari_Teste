"use client"

import { use } from "react"
import ProductForm from "@/components/admin/product-form"

export default function EditHelmetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit Helmet Miniature</h1>
      <ProductForm category="helmets" title="Edit Helmet Miniature" editMode={true} productId={id} />
    </div>
  )
}
