"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { API_URL, API_ENDPOINTS, authFetchConfig } from "@/lib/api"
import { Package, ChevronDown, ChevronUp, Clock, Truck, CheckCircle, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"

interface OrderProduct {
  id: string
  name: string
  price: number
  color?: string
  size?: string
  quantity: number
  image?: string
}

interface Order {
  _id: string
  products: { product: OrderProduct }[]
  total: number
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'canceled'
  paymentMethod: string
  shippingAddress: string
  trackingCode?: string
  createdAt: string
}

export default function OrdersSection() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(API_ENDPOINTS.orders, authFetchConfig())
        
        if (!response.ok) {
          console.error(`Error fetching orders: ${response.status} - ${response.statusText}`)
          throw new Error(`Failed to fetch orders: ${response.statusText}`)
        }
        
        const data = await response.json()
        setOrders(Array.isArray(data.orders) ? data.orders : [])
      } catch (error) {
        console.error("Error fetching orders:", error)
        toast({
          title: "Erro ao carregar pedidos",
          description: "Não foi possível carregar seus pedidos. Tente novamente mais tarde.",
          variant: "destructive"
        })
        setOrders([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [toast])

  const toggleOrderExpand = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null)
    } else {
      setExpandedOrder(orderId)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600"><Clock className="mr-1 h-3 w-3" /> Aguardando pagamento</Badge>
      case 'paid':
        return <Badge variant="outline" className="border-blue-500 text-blue-600"><CheckCircle className="mr-1 h-3 w-3" /> Pagamento confirmado</Badge>
      case 'shipped':
        return <Badge variant="outline" className="border-purple-500 text-purple-600"><Truck className="mr-1 h-3 w-3" /> Enviado</Badge>
      case 'delivered':
        return <Badge variant="outline" className="border-green-500 text-green-600"><CheckCircle className="mr-1 h-3 w-3" /> Entregue</Badge>
      case 'canceled':
        return <Badge variant="outline" className="border-red-500 text-red-600"><AlertCircle className="mr-1 h-3 w-3" /> Cancelado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Meus Pedidos</h2>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">Nenhum pedido encontrado</h3>
          <p className="mt-2 text-sm text-gray-500">
            Você ainda não realizou nenhum pedido.
          </p>
          <Button 
            className="mt-4 bg-red-600 hover:bg-red-700"
            onClick={() => window.location.href = '/cars'}
          >
            Explorar Produtos
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col space-y-1">
                    <CardTitle className="text-base font-medium">
                      Pedido #{order._id.slice(-6).toUpperCase()}
                    </CardTitle>
                    <span className="text-xs text-gray-500">
                      Realizado em {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-0">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium">Total</p>
                    <p className="text-lg font-bold">{formatCurrency(order.total)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      {order.products.length} {order.products.length === 1 ? 'item' : 'itens'}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start pt-2">
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 text-sm font-medium"
                  onClick={() => toggleOrderExpand(order._id)}
                >
                  {expandedOrder === order._id ? (
                    <>
                      Ocultar detalhes <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Ver detalhes <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
                
                {expandedOrder === order._id && (
                  <div className="mt-4 w-full">
                    <Separator className="mb-4" />
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="mb-2 text-sm font-medium">Produtos</h4>
                        <div className="space-y-2">
                          {order.products.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {item.product.image && (
                                  <div className="h-10 w-10 overflow-hidden rounded-md">
                                    <img
                                      src={item.product.image}
                                      alt={item.product.name}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-medium">{item.product.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {item.product.color && `Cor: ${item.product.color}`}
                                    {item.product.color && item.product.size && ' | '}
                                    {item.product.size && `Tamanho: ${item.product.size}`}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">
                                  {formatCurrency(item.product.price * item.product.quantity)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.product.quantity} {item.product.quantity === 1 ? 'unidade' : 'unidades'} x {formatCurrency(item.product.price)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {order.trackingCode && (
                        <div>
                          <h4 className="mb-1 text-sm font-medium">Código de Rastreio</h4>
                          <p className="text-sm">{order.trackingCode}</p>
                        </div>
                      )}
                      
                      {order.status === 'canceled' && (
                        <div className="rounded-md bg-red-50 p-3">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <AlertCircle className="h-5 w-5 text-red-600" />
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-red-800">Pedido Cancelado</h3>
                              <div className="mt-1 text-sm text-red-700">
                                <p>
                                  Este pedido foi cancelado. Para mais informações, entre em contato com nosso suporte.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {order.status === 'pending' && (
                        <div className="rounded-md bg-yellow-50 p-3">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <Clock className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-yellow-800">Aguardando Pagamento</h3>
                              <div className="mt-1 text-sm text-yellow-700">
                                <p>
                                  Este pedido está aguardando confirmação de pagamento.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}