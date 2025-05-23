"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Upload, Volume2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { IProduct } from "@/types/models"

interface ProductFormProps {
  category: "cars" | "formula1" | "helmets"
  title: string
  editMode?: boolean
  productId?: string
}

export default function ProductForm({ category, title, editMode = false, productId }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    featured: false,
    stock: "10", // Valor padrão para quantidade
    sold: "0", // Valor padrão para vendas
    hasSound: category !== "helmets", // Campo adicional para controle de frontend
    soundFile: "", // Campo adicional para controle de frontend
  })

  const [images, setImages] = useState<string[]>([
    "/placeholder.svg?height=500&width=500",
    "/placeholder.svg?height=500&width=500",
    "/placeholder.svg?height=500&width=500",
  ])

  const [soundFileName, setSoundFileName] = useState<string>("")
  const router = useRouter()
  const { toast } = useToast()

  // Mapeamento de categoria para o tipo de produto
  const getCategoryType = (category: string): "car" | "formula1" | "helmet" => {
    switch (category) {
      case "cars":
        return "car"
      case "formula1":
        return "formula1"
      case "helmets":
        return "helmet"
      default:
        return "car"
    }
  }

  // Load product data if in edit mode
  useEffect(() => {
    if (editMode && productId) {
      const storageKey = `ferrari${category.charAt(0).toUpperCase() + category.slice(1)}`
      const products = JSON.parse(localStorage.getItem(storageKey) || "[]")
      const product = products.find((p: IProduct) => p._id === productId || p.id === productId)

      if (product) {
        setFormData({
          name: product.name,
          price: product.price.toString(),
          description: product.description,
          featured: product.featured || false,
          stock: product.stock !== undefined ? product.stock.toString() : "10",
          sold: product.sold !== undefined ? product.sold.toString() : "0",
          hasSound: !!product.soundFile, // Campo adicional
          soundFile: product.soundFile || "", // Campo adicional
        })
        setImages(product.images)
        setSoundFileName(product.soundFile ? "sound-file.mp3" : "")
      }
    }
  }, [editMode, productId, category])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Para campos numéricos, garantir que apenas números sejam aceitos
    if (name === "stock" || name === "sold") {
      const numericValue = value.replace(/\D/g, "")
      setFormData((prev) => ({ ...prev, [name]: numericValue }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSoundFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSoundFileName(file.name)
      // In a real app, you would upload the file to a server and get a URL back
      // For this demo, we'll just store the file name
      setFormData((prev) => ({ ...prev, soundFile: `/sounds/${file.name}` }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.price || !formData.description) {
      toast({
        title: "Missing fields",
        description: "Please fill out all required fields",
        variant: "destructive",
      })
      return
    }

    // Converter tipo de categoria para o formato do backend
    const productType = getCategoryType(category)

    // Create a product object using the backend structure
    const productData: Partial<IProduct> & { id?: string; soundFile?: string } = {
      id: editMode && productId ? productId : undefined, // Use existing ID if in edit mode
      _id: editMode && productId ? productId : undefined, // Use existing ID for MongoDB compatibility
      name: formData.name,
      price: Number.parseFloat(formData.price),
      description: formData.description,
      images: images,
      type: productType,
      featured: formData.featured,
      stock: Number.parseInt(formData.stock) || 10,
      sold: Number.parseInt(formData.sold) || 0,
    }

    // Add sound file metadata if applicable (campo apenas para frontend)
    if (formData.hasSound && formData.soundFile) {
      productData.soundFile = formData.soundFile
    }

    // In a real app, this would be sent to an API
    // For demo, we'll store in localStorage
    const storageKey = `ferrari${category.charAt(0).toUpperCase() + category.slice(1)}`
    const existingProducts = JSON.parse(localStorage.getItem(storageKey) || "[]")

    if (editMode && productId) {
      // Update existing product
      const updatedProducts = existingProducts.map((p: IProduct & { id?: string }) => 
        (p._id === productId || p.id === productId) ? { ...productData, id: p.id, _id: p._id } : p
      )
      localStorage.setItem(storageKey, JSON.stringify(updatedProducts))
      toast({
        title: "Product updated",
        description: `${formData.name} has been updated`,
      })
    } else {
      // Add new product with a new ID
      const newProduct = {
        ...productData,
        _id: `${productType}-${Date.now()}`,
        id: `${productType}-${Date.now()}`, // Compatibilidade com o frontend existente
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      localStorage.setItem(storageKey, JSON.stringify([...existingProducts, newProduct]))
      toast({
        title: "Product added",
        description: `${formData.name} has been added to the store`,
      })
    }

    // Reset form or redirect
    if (!editMode) {
      setFormData({
        name: "",
        price: "",
        description: "",
        featured: false,
        stock: "10",
        sold: "0",
        hasSound: category !== "helmets",
        soundFile: "",
      })
      setSoundFileName("")
    }

    // Redirect to admin dashboard
    router.push("/admin/products")
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ferrari SF90 Stradale"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleChange}
              placeholder="129.99"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                placeholder="10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sold">Units Sold</Label>
              <Input
                id="sold"
                name="sold"
                type="number"
                min="0"
                value={formData.sold}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of the product..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Product Images</Label>
            <div className="grid grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square rounded border bg-gray-50">
                  <div className="flex h-full items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gray-100 p-1 text-center text-xs">
                    Image {index + 1}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Image upload functionality would be implemented in a real application
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => handleSwitchChange("featured", checked)}
            />
            <Label htmlFor="featured">Featured Product</Label>
          </div>

          {category !== "helmets" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="hasSound"
                  checked={formData.hasSound}
                  onCheckedChange={(checked) => handleSwitchChange("hasSound", checked)}
                />
                <Label htmlFor="hasSound">Has Engine Sound</Label>
              </div>

              {formData.hasSound && (
                <div className="space-y-2 rounded-md border p-4">
                  <Label htmlFor="soundFile" className="flex items-center">
                    <Volume2 className="mr-2 h-4 w-4" />
                    Engine Sound File
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="soundFile"
                      type="file"
                      accept="audio/*"
                      onChange={handleSoundFileChange}
                      className="flex-1"
                    />
                    {soundFileName && (
                      <Alert className="flex-1 py-2">
                        <AlertDescription className="flex items-center text-xs">
                          <Volume2 className="mr-2 h-4 w-4" />
                          {soundFileName}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Upload an MP3 file of the engine sound. Maximum size: 5MB</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" className="bg-red-600 hover:bg-red-700">
            {editMode ? "Update Product" : "Add Product"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
