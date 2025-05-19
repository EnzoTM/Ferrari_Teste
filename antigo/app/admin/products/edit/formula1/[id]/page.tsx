"use client"

import { useParams } from "next/navigation"
import ProductForm from "@/components/admin/product-form"

export default function EditFormula1Page() {
  const { id } = useParams()

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit Formula 1 Miniature</h1>
      <ProductForm category="formula1" title="Edit Formula 1 Miniature" editMode={true} productId={id as string} />
    </div>
  )
}
