"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function OrderSuccessPage() {
  const router = useRouter()
  const [orderNumber, setOrderNumber] = useState("")

  // Redirect to home if user directly navigates to this page without placing an order
  useEffect(() => {
    const orderPlaced = localStorage.getItem("orderPlaced")
    if (!orderPlaced) {
      router.push("/")
    } else {
      // Clear the flag after successful navigation
      localStorage.removeItem("orderPlaced")

      // Gerar um número de pedido aleatório
      setOrderNumber(`ORD-${Math.floor(100000 + Math.random() * 900000)}`)
    }
  }, [router])

  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center py-8">
      <div className="mx-auto max-w-md text-center">
        <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
        <h1 className="mb-4 text-3xl font-bold">Order Placed Successfully!</h1>

        {orderNumber && <p className="mb-2 text-lg font-semibold">Order #{orderNumber}</p>}

        <p className="mb-6 text-gray-600">
          Thank you for your purchase. Your order has been received and is being processed. You will receive a
          confirmation email shortly.
        </p>
        <div className="space-y-3">
          <Button className="w-full bg-red-600 hover:bg-red-700" asChild>
            <Link href="/">Continue Shopping</Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/profile">View My Orders</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
