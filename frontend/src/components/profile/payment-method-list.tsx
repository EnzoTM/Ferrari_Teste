"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit, CreditCard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import PaymentMethodForm from "./payment-method-form"

interface PaymentMethod {
  id: string
  cardName: string
  cardNumber: string
  expiryDate: string
  cardType: string
  isDefault: boolean
}

export default function PaymentMethodList() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [showForm, setShowForm] = useState(false)
  const { toast } = useToast()

  // Load payment method from localStorage
  useEffect(() => {
    const storedPaymentMethod = localStorage.getItem("userPaymentMethod")
    if (storedPaymentMethod) {
      setPaymentMethod(JSON.parse(storedPaymentMethod))
    }
  }, [])

  const handleAddPaymentMethod = () => {
    setShowForm(true)
  }

  const handleEditPaymentMethod = () => {
    setShowForm(true)
  }

  const handleSavePaymentMethod = (paymentMethod: PaymentMethod) => {
    // For new payment method or updating existing one
    const updatedPaymentMethod = {
      ...paymentMethod,
      id: "card1", // Just use a fixed ID since we only have one card
    }

    setPaymentMethod(updatedPaymentMethod)
    localStorage.setItem("userPaymentMethod", JSON.stringify(updatedPaymentMethod))
    setShowForm(false)

    toast({
      title: paymentMethod ? "Payment method updated" : "Payment method added",
      description: paymentMethod
        ? "Your payment method has been updated successfully"
        : "Your payment method has been added successfully",
    })
  }

  // Helper function to get card icon based on card type
  const getCardIcon = (cardType: string) => {
    return <CreditCard className="h-5 w-5" />
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Payment Method</h2>
        <Button 
          className="bg-red-600 hover:bg-red-700" 
          onClick={paymentMethod ? handleEditPaymentMethod : handleAddPaymentMethod}
        >
          {paymentMethod ? (
            <>
              <Edit className="mr-2 h-4 w-4" />
              Edit Card
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Card
            </>
          )}
        </Button>
      </div>

      {showForm ? (
        <PaymentMethodForm
          paymentMethod={paymentMethod}
          onSave={handleSavePaymentMethod}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <div>
          {!paymentMethod ? (
            <div className="col-span-2 rounded-lg border border-dashed p-8 text-center">
              <p className="text-gray-500">You don&apos;t have any saved payment method yet.</p>
              <Button className="mt-4 bg-red-600 hover:bg-red-700" onClick={handleAddPaymentMethod}>
                Add Your Card
              </Button>
            </div>
          ) : (
            <Card className="relative overflow-hidden">
              <div className="absolute right-0 top-0 bg-red-600 px-2 py-1 text-xs text-white">Default</div>
              <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center">
                    {getCardIcon(paymentMethod.cardType)}
                    <h3 className="ml-2 font-semibold">
                      {paymentMethod.cardType.charAt(0).toUpperCase() + paymentMethod.cardType.slice(1)}
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-blue-600"
                    onClick={handleEditPaymentMethod}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                </div>

                <div className="space-y-1 text-sm">
                  <p className="font-medium">{paymentMethod.cardName}</p>
                  <p>{paymentMethod.cardNumber}</p>
                  <p>Expires: {paymentMethod.expiryDate}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
