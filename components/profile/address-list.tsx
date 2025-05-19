"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit, Trash2, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import AddressForm from "./address-form"
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

interface Address {
  id: string
  name: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
}

export default function AddressList() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const { toast } = useToast()

  // Load addresses from localStorage
  useEffect(() => {
    const storedAddresses = localStorage.getItem("userAddresses")
    if (storedAddresses) {
      setAddresses(JSON.parse(storedAddresses))
    } else {
      // Definir endereço padrão
      const defaultAddresses = [
        {
          id: "addr1",
          name: "Casa",
          street: "Rua das Ferraris, 458",
          city: "Maranello",
          state: "MO",
          zipCode: "41053",
          country: "Itália",
          isDefault: true,
        },
      ]
      setAddresses(defaultAddresses)
      localStorage.setItem("userAddresses", JSON.stringify(defaultAddresses))
    }
  }, [])

  const handleAddAddress = () => {
    setEditingAddress(null)
    setShowForm(true)
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setShowForm(true)
  }

  const handleDeleteAddress = (id: string) => {
    const updatedAddresses = addresses.filter((address) => address.id !== id)

    // If we deleted the default address, make the first one default
    if (addresses.find((addr) => addr.id === id)?.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true
    }

    setAddresses(updatedAddresses)
    localStorage.setItem("userAddresses", JSON.stringify(updatedAddresses))

    toast({
      title: "Address deleted",
      description: "The address has been deleted successfully",
    })
  }

  const handleSetDefault = (id: string) => {
    const updatedAddresses = addresses.map((address) => ({
      ...address,
      isDefault: address.id === id,
    }))

    setAddresses(updatedAddresses)
    localStorage.setItem("userAddresses", JSON.stringify(updatedAddresses))

    toast({
      title: "Default address updated",
      description: "Your default address has been updated",
    })
  }

  const handleSaveAddress = (address: Address) => {
    let updatedAddresses: Address[]

    if (editingAddress) {
      // Editing existing address
      updatedAddresses = addresses.map((addr) => (addr.id === address.id ? address : addr))
    } else {
      // Adding new address
      const newAddress = {
        ...address,
        id: `addr${Date.now()}`,
        isDefault: addresses.length === 0 ? true : address.isDefault,
      }

      // If this is marked as default, update other addresses
      if (newAddress.isDefault) {
        updatedAddresses = addresses.map((addr) => ({
          ...addr,
          isDefault: false,
        }))
        updatedAddresses.push(newAddress)
      } else {
        updatedAddresses = [...addresses, newAddress]
      }
    }

    setAddresses(updatedAddresses)
    localStorage.setItem("userAddresses", JSON.stringify(updatedAddresses))
    setShowForm(false)

    toast({
      title: editingAddress ? "Address updated" : "Address added",
      description: editingAddress
        ? "Your address has been updated successfully"
        : "Your new address has been added successfully",
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Addresses</h2>
        <Button className="bg-red-600 hover:bg-red-700" onClick={handleAddAddress}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Address
        </Button>
      </div>

      {showForm ? (
        <AddressForm
          address={editingAddress}
          onSave={handleSaveAddress}
          onCancel={() => setShowForm(false)}
          addresses={addresses}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.length === 0 ? (
            <div className="col-span-2 rounded-lg border border-dashed p-8 text-center">
              <p className="text-gray-500">You don&apos;t have any saved addresses yet.</p>
              <Button className="mt-4 bg-red-600 hover:bg-red-700" onClick={handleAddAddress}>
                Add Your First Address
              </Button>
            </div>
          ) : (
            addresses.map((address) => (
              <Card key={address.id} className="relative overflow-hidden">
                {address.isDefault && (
                  <div className="absolute right-0 top-0 bg-red-600 px-2 py-1 text-xs text-white">Default</div>
                )}
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold">{address.name}</h3>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-blue-600"
                        onClick={() => handleEditAddress(address)}
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
                            <AlertDialogTitle>Delete Address</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this address? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDeleteAddress(address.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p>{address.street}</p>
                    <p>
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p>{address.country}</p>
                  </div>

                  {!address.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 text-xs"
                      onClick={() => handleSetDefault(address.id)}
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
