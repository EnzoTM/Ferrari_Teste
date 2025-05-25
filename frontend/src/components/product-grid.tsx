"use client"

import { useState, useEffect } from "react"
import { IProduct } from "@/types/models"
import ProductCard from "./product-card"
import { Loader2 } from "lucide-react"

interface ProductGridProps {
  products: IProduct[]
  loading?: boolean
  emptyMessage?: string
}

export default function ProductGrid({ 
  products, 
  loading = false,
  emptyMessage = "Nenhum produto encontrado" 
}: ProductGridProps) {
  
  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex h-60 flex-col items-center justify-center">
        <h2 className="text-xl font-semibold">Nenhum produto encontrado</h2>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  )
}
