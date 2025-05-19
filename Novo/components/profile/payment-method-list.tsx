"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit, Trash2, Check, CreditCardIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import PaymentMethodForm from "./payment-method-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface PaymentMethod {
  id: string
  cardName: string
  cardNumber: string
  expiryDate: string
  isDefault: boolean
  cardType: string
}

export default function PaymentMethodList() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null)
  const { toast } = useToast()

  // Load payment methods from localStorage
  useEffect(() => {
    const storedPaymentMethods = localStorage.getItem("userPaymentMethods")
    if (storedPaymentMethods) {
      setPaymentMethods(JSON.parse(storedPaymentMethods))
    } else {
      // Definir método de pagamento padrão
      const defaultPaymentMethods = [
        {
          id: "card1",
          cardName: "Carlos Ferrari",
          cardNumber: "•••• •••• •••• 4242",
          expiryDate: "12/25",
          isDefault: true,
          cardType: "visa",
        },
      ]
      setPaymentMethods(defaultPaymentMethods)
      localStorage.setItem("userPaymentMethods", JSON.stringify(defaultPaymentMethods))
    }
  }, [])

  const handleAddPaymentMethod = () => {
    setEditingPaymentMethod(null)
    setShowForm(true)
  }

  const handleEditPaymentMethod = (paymentMethod: PaymentMethod) => {
    setEditingPaymentMethod(paymentMethod)
    setShowForm(true)
  }

  const handleDeletePaymentMethod = (id: string) => {
    const updatedPaymentMethods = paymentMethods.filter((method) => method.id !== id)

    // If we deleted the default payment method, make the first one default
    if (paymentMethods.find((method) => method.id === id)?.isDefault && updatedPaymentMethods.length > 0) {
      updatedPaymentMethods[0].isDefault = true
    }

    setPaymentMethods(updatedPaymentMethods)
    localStorage.setItem("userPaymentMethods", JSON.stringify(updatedPaymentMethods))

    toast({
      title: "Payment method deleted",
      description: "The payment method has been deleted successfully",
    })
  }

  const handleSetDefault = (id: string) => {
    const updatedPaymentMethods = paymentMethods.map((method) => ({
      ...method,
      isDefault: method.id === id,
    }))

    setPaymentMethods(updatedPaymentMethods)
    localStorage.setItem("userPaymentMethods", JSON.stringify(updatedPaymentMethods))

    toast({
      title: "Default payment method updated",
      description: "Your default payment method has been updated",
    })
  }

  const handleSavePaymentMethod = (paymentMethod: PaymentMethod) => {
    let updatedPaymentMethods: PaymentMethod[]

    if (editingPaymentMethod) {
      // Editing existing payment method
      updatedPaymentMethods = paymentMethods.map((method) => (method.id === paymentMethod.id ? paymentMethod : method))
    } else {
      // Adding new payment method
      const newPaymentMethod = {
        ...paymentMethod,
        id: `card${Date.now()}`,
        isDefault: paymentMethods.length === 0 ? true : paymentMethod.isDefault,
      }

      // If this is marked as default, update other payment methods
      if (newPaymentMethod.isDefault) {
        updatedPaymentMethods = paymentMethods.map((method) => ({
          ...method,
          isDefault: false,
        }))
        updatedPaymentMethods.push(newPaymentMethod)
      } else {
        updatedPaymentMethods = [...paymentMethods, newPaymentMethod]
      }
    }

    setPaymentMethods(updatedPaymentMethods)
    localStorage.setItem("userPaymentMethods", JSON.stringify(updatedPaymentMethods))
    setShowForm(false)

    toast({
      title: editingPaymentMethod ? "Payment method updated" : "Payment method added",
      description: editingPaymentMethod
        ? "Your payment method has been updated successfully"
        : "Your new payment method has been added successfully",
    })
  }

  // Helper function to get card icon based on card type
  const getCardIcon = (cardType: string) => {
    return <CreditCardIcon className="h-5 w-5" />
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Payment Methods</h2>
        <Button className="bg-red-600 hover:bg-red-700" onClick={handleAddPaymentMethod}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Card
        </Button>
      </div>

      {showForm ? (
        <PaymentMethodForm
          paymentMethod={editingPaymentMethod}
          onSave={handleSavePaymentMethod}
          onCancel={() => setShowForm(false)}
          paymentMethods={paymentMethods}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {paymentMethods.length === 0 ? (
            <div className="col-span-2 rounded-lg border border-dashed p-8 text-center">
              <p className="text-gray-500">You don&apos;t have any saved payment methods yet.</p>
              <Button className="mt-4 bg-red-600 hover:bg-red-700" onClick={handleAddPaymentMethod}>
                Add Your First Card
              </Button>
            </div>
          ) : (
            paymentMethods.map((method) => (
              <Card key={method.id} className="relative overflow-hidden">
                {method.isDefault && (
                  <div className="absolute right-0 top-0 bg-red-600 px-2 py-1 text-xs text-white">Default</div>
                )}
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center">
                      {getCardIcon(method.cardType)}
                      <h3 className="ml-2 font-semibold">
                        {method.cardType.charAt(0).toUpperCase() + method.cardType.slice(1)}
                      </h3>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-blue-600"
                        onClick={() => handleEditPaymentMethod(method)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Payment Method</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this payment method? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDeletePaymentMethod(method.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{method.cardName}</p>
                    <p>{method.cardNumber}</p>
                    <p>Expires: {method.expiryDate}</p>
                  </div>

                  {!method.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 text-xs"
                      onClick={() => handleSetDefault(method.id)}
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Set as Default
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
