"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingBag } from "lucide-react"

interface OrderHistoryProps {
  userData: any
}

export default function OrderHistory({ userData }: OrderHistoryProps) {
  const [orders, setOrders] = useState(userData?.shopping || [])

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <ShoppingBag className="mb-2 h-10 w-10 text-gray-400" />
        <h3 className="mb-1 text-lg font-medium">Não foi possível carregar seus pedidos</h3>
        <p className="text-sm text-gray-500">Tente novamente mais tarde</p>
      </div>
    )
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <ShoppingBag className="mb-2 h-10 w-10 text-gray-400" />
        <h3 className="mb-1 text-lg font-medium">Nenhum pedido encontrado</h3>
        <p className="text-sm text-gray-500">Você ainda não fez nenhuma compra</p>
        <Button className="mt-4 bg-red-600 hover:bg-red-700" onClick={() => window.location.href = '/'}>
          Ver produtos
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Histórico de Pedidos</h2>
      
      {orders.map((order: any, index: number) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{order.product?.name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">R$ {order.product?.price.toFixed(2)}</p>
                <p className="text-sm">Qtd: {order.product?.quantity}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
