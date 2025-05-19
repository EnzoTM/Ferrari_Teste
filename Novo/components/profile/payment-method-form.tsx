"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PaymentMethod {
  id: string
  cardName: string
  cardNumber: string
  expiryDate: string
  isDefault: boolean
  cardType: string
}

interface PaymentMethodFormProps {
  paymentMethod: PaymentMethod | null
  onSave: (paymentMethod: PaymentMethod) => void
  onCancel: () => void
  paymentMethods: PaymentMethod[]
}

export default function PaymentMethodForm({ paymentMethod, onSave, onCancel, paymentMethods }: PaymentMethodFormProps) {
  const [formData, setFormData] = useState<Omit<PaymentMethod, "id"> & { id?: string }>({
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    isDefault: false,
    cardType: "visa",
  })
  const [cardNumberInput, setCardNumberInput] = useState("")
  const [expiryInput, setExpiryInput] = useState("")
  const [cvv, setCvv] = useState("")
  const [errors, setErrors] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  })

  // If editing, populate form with payment method data
  useEffect(() => {
    if (paymentMethod) {
      setFormData(paymentMethod)
      // For editing, we don't show the actual card number, just the masked version
      setCardNumberInput("")
      setExpiryInput(paymentMethod.expiryDate)
    } else {
      // If this is the first payment method, make it default
      setFormData((prev) => ({
        ...prev,
        isDefault: paymentMethods.length === 0,
      }))
    }
  }, [paymentMethod, paymentMethods])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Aceitar apenas números
    let value = e.target.value.replace(/\D/g, "")

    // Format with spaces every 4 digits
    if (value.length > 0) {
      value = value.match(/.{1,4}/g)?.join(" ") || value
    }

    setCardNumberInput(value)

    // Store only digits in the form data
    const digits = value.replace(/\s/g, "")
    setFormData((prev) => ({
      ...prev,
      cardNumber: digits.length > 0 ? `•••• •••• •••• ${digits.slice(-4)}` : "",
    }))

    // Validate
    if (digits.length > 0 && digits.length < 16) {
      setErrors((prev) => ({ ...prev, cardNumber: "Card number must be 16 digits" }))
    } else {
      setErrors((prev) => ({ ...prev, cardNumber: "" }))
    }
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Aceitar apenas números
    let value = e.target.value.replace(/\D/g, "")

    // Format as MM/YY
    if (value.length > 0) {
      if (value.length <= 2) {
        value = value
      } else {
        value = `${value.slice(0, 2)}/${value.slice(2, 4)}`
      }
    }

    setExpiryInput(value)
    setFormData((prev) => ({ ...prev, expiryDate: value }))

    // Validate
    if (value.length > 0 && value.length < 5) {
      setErrors((prev) => ({ ...prev, expiryDate: "Expiry date must be in MM/YY format" }))
    } else {
      setErrors((prev) => ({ ...prev, expiryDate: "" }))
    }
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Aceitar apenas números
    const value = e.target.value.replace(/\D/g, "").slice(0, 3)
    setCvv(value)

    // Validate
    if (value.length > 0 && value.length < 3) {
      setErrors((prev) => ({ ...prev, cvv: "CVV must be 3 digits" }))
    } else {
      setErrors((prev) => ({ ...prev, cvv: "" }))
    }
  }

  const handleCardTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, cardType: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isDefault: checked }))
  }

  const validateForm = () => {
    let valid = true
    const newErrors = { ...errors }

    // When editing, we might not change the card number
    if (!paymentMethod && (formData.cardNumber.length === 0 || cardNumberInput.replace(/\s/g, "").length < 16)) {
      newErrors.cardNumber = "Valid card number is required"
      valid = false
    }

    if (formData.expiryDate.length === 0 || !formData.expiryDate.includes("/")) {
      newErrors.expiryDate = "Valid expiry date is required"
      valid = false
    }

    // CVV is only required for new cards
    if (!paymentMethod && (cvv.length === 0 || cvv.length < 3)) {
      newErrors.cvv = "Valid CVV is required"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSave(formData as PaymentMethod)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cardType">Card Type</Label>
        <Select value={formData.cardType} onValueChange={handleCardTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select card type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="visa">Visa</SelectItem>
            <SelectItem value="mastercard">Mastercard</SelectItem>
            <SelectItem value="amex">American Express</SelectItem>
            <SelectItem value="discover">Discover</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cardName">Name on Card</Label>
        <Input
          id="cardName"
          name="cardName"
          placeholder="John Doe"
          value={formData.cardName}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cardNumber">Card Number</Label>
        <Input
          id="cardNumber"
          placeholder={paymentMethod ? "•••• •••• •••• 1234" : "1234 5678 9012 3456"}
          value={cardNumberInput}
          onChange={handleCardNumberChange}
          required={!paymentMethod}
          maxLength={19} // 16 digits + 3 spaces
          inputMode="numeric" // Mostra teclado numérico em dispositivos móveis
        />
        {errors.cardNumber && <p className="text-sm text-red-600">{errors.cardNumber}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Input
            id="expiryDate"
            placeholder="MM/YY"
            value={expiryInput}
            onChange={handleExpiryChange}
            required
            maxLength={5} // MM/YY
            inputMode="numeric" // Mostra teclado numérico em dispositivos móveis
          />
          {errors.expiryDate && <p className="text-sm text-red-600">{errors.expiryDate}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="cvv">CVV</Label>
          <Input
            id="cvv"
            type="password"
            placeholder="123"
            value={cvv}
            onChange={handleCvvChange}
            required={!paymentMethod}
            maxLength={3}
            inputMode="numeric" // Mostra teclado numérico em dispositivos móveis
          />
          {errors.cvv && <p className="text-sm text-red-600">{errors.cvv}</p>}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isDefault"
          checked={formData.isDefault}
          onCheckedChange={handleSwitchChange}
          disabled={paymentMethods.length === 0} // If this is the first payment method, it must be default
        />
        <Label htmlFor="isDefault">Set as default payment method</Label>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-red-600 hover:bg-red-700">
          {paymentMethod ? "Update Card" : "Add Card"}
        </Button>
      </div>
    </form>
  )
}
