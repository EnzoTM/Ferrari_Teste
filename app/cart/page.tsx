"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/components/ui/use-toast"

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, shipping, total, clearCart } = useCart()
  const [activeTab, setActiveTab] = useState("cart")
  const isMobile = useMediaQuery("(max-width: 768px)")
  const router = useRouter()
  const { toast } = useToast()

  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zipCode: "",
    country: "",
    phone: "",
  })

  const [paymentInfo, setPaymentInfo] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  })

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setShippingInfo((prev) => ({ ...prev, [id]: value }))
  }

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setPaymentInfo((prev) => ({ ...prev, [id]: value }))
  }

  const validateShippingForm = () => {
    // Simple validation - check if all fields are filled
    return Object.values(shippingInfo).every((value) => value.trim() !== "")
  }

  const validatePaymentForm = () => {
    // Simple validation - check if all fields are filled
    return Object.values(paymentInfo).every((value) => value.trim() !== "")
  }

  const handleContinueToShipping = () => {
    setActiveTab("shipping")
  }

  const handleContinueToPayment = () => {
    if (validateShippingForm()) {
      setActiveTab("payment")
    } else {
      toast({
        title: "Please fill all fields",
        description: "All shipping information fields are required.",
        variant: "destructive",
      })
    }
  }

  const handlePlaceOrder = () => {
    if (validatePaymentForm()) {
      // Process the order
      toast({
        title: "Order placed successfully!",
        description: "Thank you for your purchase.",
      })

      // Clear the cart and redirect to success page
      clearCart()
      router.push("/order-success")
    } else {
      toast({
        title: "Please fill all fields",
        description: "All payment information fields are required.",
        variant: "destructive",
      })
    }
  }

  if (items.length === 0) {
    return (
      <div className="container flex min-h-[50vh] flex-col items-center justify-center py-8">
        <h1 className="text-2xl font-bold">Your Cart is Empty</h1>
        <p className="mt-2 text-center text-gray-600">Add some products to your cart to continue shopping</p>
        <Button className="mt-6 bg-red-600 hover:bg-red-700" asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-4 md:py-8">
      <h1 className="mb-4 text-2xl font-bold md:mb-8 md:text-3xl">Shopping Cart</h1>

      <Tabs defaultValue="cart" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 grid w-full grid-cols-3">
          <TabsTrigger value="cart">Cart</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="cart" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="mb-4 flex flex-col items-start space-y-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0"
                >
                  <div className="relative h-20 w-20 flex-shrink-0">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-contain" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-500">Item #{item.id}</p>
                  </div>

                  <div className="flex w-full items-center justify-between sm:w-auto sm:flex-col sm:items-end">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                        <span className="sr-only">Decrease quantity</span>
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Increase quantity</span>
                      </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="text-right font-semibold">${(item.price * item.quantity).toFixed(2)}</div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove item</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-red-600 hover:bg-red-700" onClick={handleContinueToShipping}>
                    Proceed to Shipping
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="shipping">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={shippingInfo.firstName}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={shippingInfo.lastName}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="123 Main St"
                      value={shippingInfo.address}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="New York"
                        value={shippingInfo.city}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Zip Code</Label>
                      <Input
                        id="zipCode"
                        placeholder="10001"
                        value={shippingInfo.zipCode}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      placeholder="United States"
                      value={shippingInfo.country}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={shippingInfo.phone}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:space-y-0">
                  <Button variant="outline" onClick={() => setActiveTab("cart")}>
                    Back to Cart
                  </Button>
                  <Button className="bg-red-600 hover:bg-red-700" onClick={handleContinueToPayment}>
                    Continue to Payment
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payment">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      value={paymentInfo.cardName}
                      onChange={handlePaymentChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={paymentInfo.cardNumber}
                      onChange={handlePaymentChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={paymentInfo.expiry}
                        onChange={handlePaymentChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={paymentInfo.cvv}
                        onChange={handlePaymentChange}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:space-y-0">
                  <Button variant="outline" onClick={() => setActiveTab("shipping")}>
                    Back to Shipping
                  </Button>
                  <Button className="bg-red-600 hover:bg-red-700" onClick={handlePlaceOrder}>
                    Place Order
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
