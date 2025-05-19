"use client"

import { useParams } from "next/navigation"
import ProductForm from "@/components/admin/product-form"

export default function EditHelmetPage() {
  const { id } = useParams()

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit Helmet Miniature</h1>
      <ProductForm category="helmets" title="Edit Helmet Miniature" editMode={true} productId={id as string} />
    </div>
  )
}
