"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PaymentMethod {
  type: 'credit' | 'debit'
  cardNumber: string
  cardHolderName: string
  expirationDate: string
  cvv: string
}

interface PaymentMethodFormProps {
  paymentMethod: PaymentMethod | null
  onSave: (paymentMethod: PaymentMethod) => void
  onCancel: () => void
}

export default function PaymentMethodForm({ paymentMethod, onSave, onCancel }: PaymentMethodFormProps) {
  const [formData, setFormData] = useState<PaymentMethod>({
    type: 'credit',
    cardNumber: '',
    cardHolderName: '',
    expirationDate: '',
    cvv: ''
  })
  const [cardNumberInput, setCardNumberInput] = useState("")
  const [expiryInput, setExpiryInput] = useState("")
  const [errors, setErrors] = useState({
    cardNumber: "",
    expirationDate: "",
    cvv: "",
  })

  // If editing, populate form with payment method data
  useEffect(() => {
    if (paymentMethod) {
      setFormData({
        ...paymentMethod,
        cvv: '' // Clear CVV for security when editing
      })
      // For editing, we don't show the actual card number, just the masked version
      setCardNumberInput("")
      setExpiryInput(paymentMethod.expirationDate)
    }
  }, [paymentMethod])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Accept only numbers
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
      cardNumber: digits
    }))

    // Validate
    if (digits.length > 0 && digits.length < 16) {
      setErrors((prev) => ({ ...prev, cardNumber: "Card number must be 16 digits" }))
    } else {
      setErrors((prev) => ({ ...prev, cardNumber: "" }))
    }
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Accept only numbers
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
    setFormData((prev) => ({ ...prev, expirationDate: value }))

    // Validate
    if (value.length > 0 && value.length < 5) {
      setErrors((prev) => ({ ...prev, expirationDate: "Expiry date must be in MM/YY format" }))
    } else {
      setErrors((prev) => ({ ...prev, expirationDate: "" }))
    }
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Accept only numbers
    const value = e.target.value.replace(/\D/g, "").slice(0, 3)
    setFormData((prev) => ({ ...prev, cvv: value }))

    // Validate
    if (value.length > 0 && value.length < 3) {
      setErrors((prev) => ({ ...prev, cvv: "CVV must be 3 digits" }))
    } else {
      setErrors((prev) => ({ ...prev, cvv: "" }))
    }
  }

  const handleCardTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value as 'credit' | 'debit' }))
  }

  const validateForm = () => {
    let valid = true
    const newErrors = { ...errors }

    // When editing, we might not change the card number
    if (!paymentMethod && (formData.cardNumber.length === 0 || formData.cardNumber.length < 16)) {
      newErrors.cardNumber = "Valid card number is required"
      valid = false
    }

    if (formData.expirationDate.length === 0 || !formData.expirationDate.includes("/")) {
      newErrors.expirationDate = "Valid expiry date is required"
      valid = false
    }

    // CVV is only required for new cards
    if (!paymentMethod && (formData.cvv.length === 0 || formData.cvv.length < 3)) {
      newErrors.cvv = "Valid CVV is required"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSave(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Card Type</Label>
        <Select value={formData.type} onValueChange={handleCardTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select card type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="credit">Credit Card</SelectItem>
            <SelectItem value="debit">Debit Card</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cardHolderName">Name on Card</Label>
        <Input
          id="cardHolderName"
          name="cardHolderName"
          placeholder="John Doe"
          value={formData.cardHolderName}
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
          inputMode="numeric" // Show numeric keyboard on mobile devices
        />
        {errors.cardNumber && <p className="text-sm text-red-600">{errors.cardNumber}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="expirationDate">Expiry Date</Label>
          <Input
            id="expirationDate"
            placeholder="MM/YY"
            value={expiryInput}
            onChange={handleExpiryChange}
            required
            maxLength={5} // MM/YY
            inputMode="numeric" // Show numeric keyboard on mobile devices
          />
          {errors.expirationDate && <p className="text-sm text-red-600">{errors.expirationDate}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="cvv">CVV</Label>
          <Input
            id="cvv"
            type="password"
            placeholder="123"
            value={formData.cvv}
            onChange={handleCvvChange}
            required={!paymentMethod}
            maxLength={3}
            inputMode="numeric" // Show numeric keyboard on mobile devices
          />
          {errors.cvv && <p className="text-sm text-red-600">{errors.cvv}</p>}
        </div>
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
