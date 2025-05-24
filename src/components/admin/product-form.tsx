"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Upload, Volume2, X, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { IProduct } from "@/types/models"
import { API_ENDPOINTS, fetchWithAuth } from "@/lib/api"
import Image from "next/image"

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
    stock: "10",
    sold: "0",
    hasSound: category !== "helmets",
    soundFile: "",
  })
  
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
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
      const fetchProduct = async () => {
        try {
          const response = await fetchWithAuth(API_ENDPOINTS.product(productId))
          const data = await response.json()
          
          if (data.product) {
            const product = data.product
            setFormData({
              name: product.name,
              price: product.price.toString(),
              description: product.description,
              featured: product.featured || false,
              stock: product.stock !== undefined ? product.stock.toString() : "10",
              sold: product.sold !== undefined ? product.sold.toString() : "0",
              hasSound: !!product.soundFile,
              soundFile: product.soundFile || "",
            })
            
            // Set image previews for existing product
            if (product.images && product.images.length > 0) {
              const imageUrls = product.images.map((img: string) => 
                img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/public/images/products/${img}`
              )
              setImagePreviews(imageUrls)
            }
            
            setSoundFileName(product.soundFile ? "sound-file.mp3" : "")
          }
        } catch (error) {
          console.error("Error fetching product:", error)
          toast({
            title: "Error",
            description: "Failed to load product data",
            variant: "destructive",
          })
        }
      }
      
      fetchProduct()
    }
  }, [editMode, productId, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
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
      setFormData((prev) => ({ ...prev, soundFile: `/sounds/${file.name}` }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Limit to 3 images total
    const remainingSlots = 3 - imageFiles.length
    const newFiles = Array.from(files).slice(0, remainingSlots)

    // Add new files to state
    setImageFiles((prev) => [...prev, ...newFiles])

    // Create preview URLs for new files
    const newPreviews = newFiles.map(file => URL.createObjectURL(file))
    setImagePreviews((prev) => [...prev, ...newPreviews])

    // Reset the file input value
    if (fileInputRef.current) fileInputRef.current.value = ""

    toast({
      title: "Images added",
      description: `${newFiles.length} image(s) selected for upload`,
    })
  }

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price || !formData.description) {
      toast({
        title: "Missing fields",
        description: "Please fill out all required fields",
        variant: "destructive",
      })
      return
    }

    // Check if we have at least one image for new products
    if (!editMode && imageFiles.length === 0) {
      toast({
        title: "Images required",
        description: "Please upload at least one product image",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare form data for API
      const apiFormData = new FormData()
      apiFormData.append('name', formData.name)
      apiFormData.append('price', formData.price)
      apiFormData.append('description', formData.description)
      apiFormData.append('type', getCategoryType(category))
      apiFormData.append('featured', formData.featured.toString())
      apiFormData.append('stock', formData.stock)

      // Add image files
      imageFiles.forEach((file) => {
        apiFormData.append('images', file)
      })

      let response
      if (editMode && productId) {
        // Update existing product
        response = await fetchWithAuth(API_ENDPOINTS.product(productId), {
          method: 'PATCH',
          body: apiFormData,
        })
      } else {
        // Create new product
        response = await fetchWithAuth(API_ENDPOINTS.products, {
          method: 'POST',
          body: apiFormData,
        })
      }

      const data = await response.json()

      if (response.ok) {
        toast({
          title: editMode ? "Product updated" : "Product created",
          description: data.message || `${formData.name} has been ${editMode ? 'updated' : 'added'} successfully`,
        })

        // Reset form for new products
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
          setImageFiles([])
          setImagePreviews([])
        }

        // Redirect to admin products page
        router.push("/admin/products")
      } else {
        throw new Error(data.message || "Failed to save product")
      }
    } catch (error) {
      console.error("Error saving product:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save product",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label className="block mb-2">Product Images</Label>
            <div className="grid grid-cols-3 gap-4">
              {imagePreviews.length > 0 ? (
                imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded border bg-gray-50 overflow-hidden">
                    <Image
                      src={preview}
                      alt={`Product image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-white p-1 rounded-full shadow-sm hover:bg-red-50"
                      title="Remove image"
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                ))
              ) : (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="relative aspect-square rounded border bg-gray-50">
                    <div className="flex h-full items-center justify-center">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {imagePreviews.length < 3 && (
              <div className="mt-4">
                <Input
                  ref={fileInputRef}
                  id="product-images"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleImageChange}
                  multiple={true}
                  className="mb-2"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500">
                  Upload up to 3 product images (JPG, JPEG, or PNG). Maximum size: 5MB per image.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => handleSwitchChange("featured", checked)}
              disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-red-600 hover:bg-red-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {editMode ? "Updating..." : "Adding..."}
              </>
            ) : (
              editMode ? "Update Product" : "Add Product"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
