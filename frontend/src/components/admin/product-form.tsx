"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Upload, Volume2, X, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { IProduct } from "@/types/models"
import { API_ENDPOINTS, fetchWithAuth, API_URL } from "@/lib/api"
import Image from "next/image"

interface ProductFormProps {
  title: string
  editMode?: boolean
  productId?: string
}

export default function ProductForm({ title, editMode = false, productId }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    type: "car" as "car" | "formula1" | "helmet",
    featured: false,
    stock: "10",
    sold: "0",
    hasSound: true,
  })
  
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
  const [soundFile, setSoundFile] = useState<File | null>(null)
  const [existingSoundFile, setExistingSoundFile] = useState<string>("")
  const [shouldDeleteSound, setShouldDeleteSound] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const soundInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Load product data if in edit mode
  useEffect(() => {
    if (editMode && productId) {
      const fetchProduct = async () => {
        try {
          const response = await fetchWithAuth(API_ENDPOINTS.product(productId))
          
          if (!response.ok) {
            throw new Error(`Failed to fetch product: ${response.status}`)
          }
          
          const contentType = response.headers.get("content-type")
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Server returned invalid response format")
          }
          
          const data = await response.json()
          
          if (data.product) {
            const product = data.product
            setFormData({
              name: product.name,
              price: product.price.toString(),
              description: product.description,
              type: product.type || "car",
              featured: product.featured || false,
              stock: product.stock !== undefined ? product.stock.toString() : "10",
              sold: product.sold !== undefined ? product.sold.toString() : "0",
              hasSound: !!product.soundFile,
            })
            
            // Set image previews for existing product
            if (product.images && product.images.length > 0) {
              const imageUrls = product.images.map((img: string) => 
                img.startsWith('http') ? img : `${API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/public/images/products/${img}`
              )
              setImagePreviews(imageUrls)
              setExistingImages([...product.images])
            }
            
            // Set existing sound file
            if (product.soundFile) {
              setExistingSoundFile(product.soundFile)
            }
          }
        } catch (error) {
          console.error("Error fetching product:", error)
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to load product data",
            variant: "destructive",
          })
        }
      }
      
      fetchProduct()
    }
  }, [editMode, productId, toast])

  // Update hasSound when type changes
  useEffect(() => {
    const newHasSound = formData.type !== "helmet"
    setFormData(prev => ({
      ...prev,
      hasSound: newHasSound
    }))
    
    // If changing to helmet and in edit mode, mark existing sound for deletion
    if (formData.type === "helmet" && editMode && existingSoundFile && !shouldDeleteSound) {
      setShouldDeleteSound(true)
      setExistingSoundFile("")
    }
  }, [formData.type, editMode, existingSoundFile, shouldDeleteSound, soundFile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === "stock" || name === "sold") {
      const numericValue = value.replace(/\D/g, "")
      setFormData((prev) => ({ ...prev, [name]: numericValue }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleTypeChange = (value: "car" | "formula1" | "helmet") => {
    setFormData((prev) => ({ ...prev, type: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSoundFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/mpeg']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Formato inválido",
          description: "Por favor, envie apenas arquivos MP3, WAV, OGG ou M4A",
          variant: "destructive",
        })
        return
      }
      
      // Validar tamanho (máximo 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo de áudio deve ter no máximo 5MB",
          variant: "destructive",
        })
        return
      }
      
      setSoundFile(file)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Limit to 3 images total (including existing ones)
    const totalExistingImages = editMode ? existingImages.length - imagesToDelete.length : 0
    const remainingSlots = 3 - totalExistingImages - imageFiles.length
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
    const isExistingImage = editMode && index < existingImages.length
    
    if (isExistingImage) {
      // Mark existing image for deletion
      const imageFilename = existingImages[index]
      if (!imagesToDelete.includes(imageFilename)) {
        setImagesToDelete(prev => [...prev, imageFilename])
      }
      // Remove from previews
      setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    } else {
      // Remove new image (not yet uploaded)
      const newImageIndex = index - existingImages.length
      setImageFiles((prev) => prev.filter((_, i) => i !== newImageIndex))
      setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const removeSoundFile = () => {
    if (editMode && existingSoundFile) {
      // Mark sound file for deletion
      setShouldDeleteSound(true)
      setExistingSoundFile("")
    } else {
      // Remove new sound file (not yet uploaded)
      setSoundFile(null)
      if (soundInputRef.current) {
        soundInputRef.current.value = ""
      }
    }
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

    // Check if we have at least one image (existing or new) after deletions
    const remainingExistingImages = existingImages.length - imagesToDelete.length
    const totalImages = remainingExistingImages + imageFiles.length
    if (totalImages === 0) {
      toast({
        title: "Images required",
        description: "Please upload at least one product image",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Step 1: Delete sound file if marked for deletion
      if (editMode && productId && shouldDeleteSound) {
        try {
          const response = await fetchWithAuth(`${API_ENDPOINTS.product(productId)}/remove-sound`, {
            method: 'DELETE',
          })
          if (!response.ok) {
            console.error('Failed to delete sound file')
          }
        } catch (error) {
          console.error('Error deleting sound file:', error)
        }
      }

      // Step 2: Update product data
      const apiFormData = new FormData()
      apiFormData.append('name', formData.name)
      apiFormData.append('price', formData.price)
      apiFormData.append('description', formData.description)
      apiFormData.append('type', formData.type)
      apiFormData.append('featured', formData.featured.toString())
      apiFormData.append('stock', formData.stock)
      apiFormData.append('sold', formData.sold)

      // Add new image files
      imageFiles.forEach((file) => {
        apiFormData.append('images', file)
      })

      // Add sound file if provided
      if (formData.hasSound && soundFile) {
        apiFormData.append('soundFile', soundFile)
      }

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

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = "Failed to save product"
        
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        
        throw new Error(errorMessage)
      }

      // Step 3: Delete marked images after product update
      if (editMode && productId && imagesToDelete.length > 0) {
        for (const imageFilename of imagesToDelete) {
          try {
            const response = await fetchWithAuth(`${API_ENDPOINTS.product(productId)}/remove-image`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ filename: imageFilename }),
            })
            if (!response.ok) {
              console.error(`Failed to delete image: ${imageFilename}`)
            }
          } catch (error) {
            console.error(`Error deleting image ${imageFilename}:`, error)
          }
        }
      }

      const data = await response.json()
      
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
          type: "car",
          featured: false,
          stock: "10",
          sold: "0",
          hasSound: true,
        })
        setSoundFile(null)
        setImageFiles([])
        setImagePreviews([])
        setExistingImages([])
        setExistingSoundFile("")
      }

      // Redirect to admin products page
      router.push("/admin/products")
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
            <Label htmlFor="type">Product Type</Label>
            <Select value={formData.type} onValueChange={handleTypeChange} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Select product type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="car">Carro</SelectItem>
                <SelectItem value="formula1">Fórmula 1</SelectItem>
                <SelectItem value="helmet">Capacete</SelectItem>
              </SelectContent>
            </Select>
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

          {/* Product Images */}
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

          {/* Audio upload section */}
          {formData.type !== "helmet" && (
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
                  
                  {/* Show existing sound file */}
                  {existingSoundFile && !shouldDeleteSound && (
                    <Alert className="mb-2">
                      <Volume2 className="h-4 w-4" />
                      <AlertDescription className="flex items-center justify-between">
                        <span>Arquivo atual: {existingSoundFile}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeSoundFile}
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Show new sound file */}
                  {soundFile && (
                    <Alert className="mb-2">
                      <Volume2 className="h-4 w-4" />
                      <AlertDescription className="flex items-center justify-between">
                        <span>Novo arquivo: {soundFile.name}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeSoundFile}
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Input
                    ref={soundInputRef}
                    id="soundFile"
                    type="file"
                    accept="audio/mp3,audio/wav,audio/ogg,audio/mp4,audio/mpeg"
                    onChange={handleSoundFileChange}
                    disabled={isSubmitting}
                  />
                  
                  <p className="text-xs text-gray-500">
                    Upload an MP3, WAV, OGG or M4A file of the engine sound. Maximum size: 5MB
                  </p>
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
