"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { API_ENDPOINTS, API_URL, PRODUCT_TYPES, fetchWithAuth, isAdmin, isAuthenticated } from "@/lib/api"
import { IProduct, ICategory } from "@/types/models"
import { Loader2, PlusCircle, Pencil, Trash2, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import Link from "next/link"

export default function AdminProductsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [products, setProducts] = useState<IProduct[]>([])
  const [categories, setCategories] = useState<ICategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null)
  
  // Form para novo produto ou edição
  const [productForm, setProductForm] = useState({
    name: "",
    price: 0,
    description: "",
    category: "",
    type: PRODUCT_TYPES.CAR,
    tags: "",
    featured: false,
    stock: 1
  })
  
  const [productImages, setProductImages] = useState<FileList | null>(null)

  // Verificar autenticação e permissões de admin
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!isAuthenticated() || !isAdmin()) {
          router.push('/login')
          return
        }

        // Carregar produtos e categorias
        setIsLoading(true)
        await Promise.all([
          loadProducts(),
          loadCategories()
        ])
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const loadProducts = async () => {
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.products)
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos. Tente novamente mais tarde.",
        variant: "destructive"
      })
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.categories)
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error("Erro ao carregar categorias:", error)
    }
  }

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement
      setProductForm(prev => ({ ...prev, [name]: checkbox.checked }))
    } else {
      setProductForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const resetForm = () => {
    setProductForm({
      name: "",
      price: 0,
      description: "",
      category: "",
      type: PRODUCT_TYPES.CAR,
      tags: "",
      featured: false,
      stock: 1
    })
    setProductImages(null)
    setSelectedProduct(null)
  }

  const handleEditProduct = (product: IProduct) => {
    setSelectedProduct(product)
    setProductForm({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      type: product.type,
      tags: product.tags ? product.tags.join(', ') : '',
      featured: product.featured || false,
      stock: product.stock || 1
    })
  }

  const handleDeleteClick = (product: IProduct) => {
    setSelectedProduct(product)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedProduct || !selectedProduct._id) return
    
    try {
      setIsSubmitting(true)
      const response = await fetchWithAuth(API_ENDPOINTS.product(selectedProduct._id), {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast({
          title: "Produto excluído",
          description: "O produto foi excluído com sucesso.",
          variant: "default"
        })
        
        // Recarregar a lista de produtos
        await loadProducts()
      } else {
        const data = await response.json()
        throw new Error(data.message || "Erro ao excluir produto")
      }
    } catch (error) {
      console.error("Erro ao excluir produto:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao excluir produto",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      
      // Preparar formData para envio de arquivos
      const formData = new FormData()
      formData.append('name', productForm.name)
      formData.append('price', productForm.price.toString())
      formData.append('description', productForm.description)
      formData.append('category', productForm.category)
      formData.append('type', productForm.type)
      formData.append('stock', productForm.stock.toString())
      formData.append('featured', productForm.featured.toString())
      
      // Processar tags
      const tagsArray = productForm.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
      
      formData.append('tags', JSON.stringify(tagsArray))
      
      // Adicionar imagens
      if (productImages) {
        for (let i = 0; i < productImages.length; i++) {
          formData.append('images', productImages[i])
        }
      }
      
      // Determinar URL e método com base se é criação ou edição
      const url = selectedProduct && selectedProduct._id 
        ? API_ENDPOINTS.product(selectedProduct._id)
        : API_ENDPOINTS.products
      
      const method = selectedProduct && selectedProduct._id ? 'PATCH' : 'POST'
      
      const response = await fetchWithAuth(url, {
        method,
        body: formData,
        // Não definir o Content-Type, o navegador vai configurar automaticamente com o boundary para o FormData
      })
      
      if (response.ok) {
        const action = selectedProduct ? "atualizado" : "criado"
        toast({
          title: `Produto ${action}`,
          description: `O produto foi ${action} com sucesso.`,
          variant: "default"
        })
        
        // Recarregar a lista de produtos e resetar o formulário
        await loadProducts()
        resetForm()
      } else {
        const data = await response.json()
        throw new Error(data.message || `Erro ao ${selectedProduct ? "atualizar" : "criar"} produto`)
      }
    } catch (error) {
      console.error("Erro ao salvar produto:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar produto",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Gerenciar Produtos</h1>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
              <DialogDescription>
                {selectedProduct 
                  ? "Edite os detalhes do produto existente." 
                  : "Preencha os campos para adicionar um novo produto."}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="name" className="text-right">
                    Nome
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={productForm.name}
                    onChange={handleProductChange}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="price" className="text-right">
                    Preço
                  </label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={productForm.price}
                    onChange={handleProductChange}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="stock" className="text-right">
                    Estoque
                  </label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={handleProductChange}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="type" className="text-right">
                    Tipo
                  </label>
                  <Select 
                    name="type" 
                    value={productForm.type}
                    onValueChange={(value) => setProductForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PRODUCT_TYPES.CAR}>Carro</SelectItem>
                      <SelectItem value={PRODUCT_TYPES.FORMULA1}>Fórmula 1</SelectItem>
                      <SelectItem value={PRODUCT_TYPES.HELMET}>Capacete</SelectItem>
                      <SelectItem value={PRODUCT_TYPES.MERCHANDISE}>Merchandise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="category" className="text-right">
                    Categoria
                  </label>
                  <Select 
                    name="category" 
                    value={productForm.category}
                    onValueChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category._id} value={category._id as string}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="tags" className="text-right">
                    Tags
                  </label>
                  <Input
                    id="tags"
                    name="tags"
                    value={productForm.tags}
                    onChange={handleProductChange}
                    className="col-span-3"
                    placeholder="Separadas por vírgula"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="featured" className="text-right">
                    Destaque
                  </label>
                  <Input
                    id="featured"
                    name="featured"
                    type="checkbox"
                    checked={productForm.featured}
                    onChange={(e) => setProductForm(prev => ({ 
                      ...prev, 
                      featured: e.target.checked 
                    }))}
                    className="col-span-3 h-4 w-4"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-start gap-4">
                  <label htmlFor="description" className="text-right">
                    Descrição
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={productForm.description}
                    onChange={handleProductChange}
                    className="col-span-3"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="images" className="text-right">
                    Imagens
                  </label>
                  <Input
                    id="images"
                    name="images"
                    type="file"
                    onChange={(e) => setProductImages(e.target.files)}
                    className="col-span-3"
                    multiple
                    accept="image/*"
                  />
                </div>
                
                {selectedProduct && selectedProduct.images && selectedProduct.images.length > 0 && (
                  <div className="grid grid-cols-4 items-start gap-4">
                    <label className="text-right">Imagens atuais</label>
                    <div className="col-span-3 flex flex-wrap gap-2">
                      {selectedProduct.images.map((image, index) => (
                        <div key={index} className="relative h-20 w-20">
                          <Image
                            src={`${API_URL}/public/images/products/${image}`}
                            alt={`Imagem ${index + 1} do produto`}
                            fill
                            className="rounded-md object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    selectedProduct ? "Atualizar" : "Criar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagem</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Destaque</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      {product.images && product.images.length > 0 ? (
                        <div className="relative h-10 w-10">
                          <Image
                            src={`${API_URL}/public/images/products/${product.images[0]}`}
                            alt={product.name}
                            fill
                            className="rounded-md object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-gray-200" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>R$ {product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      {product.type === 'car' && 'Carro'}
                      {product.type === 'formula1' && 'Fórmula 1'}
                      {product.type === 'helmet' && 'Capacete'}
                      {product.type === 'merchandise' && 'Merchandise'}
                    </TableCell>
                    <TableCell>{product.stock || 0}</TableCell>
                    <TableCell>{product.featured ? 'Sim' : 'Não'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditProduct(product)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteClick(product)}
                          className="text-red-600 hover:bg-red-100 hover:text-red-700"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Nenhum produto encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Diálogo de confirmação de exclusão */}
      {showDeleteDialog && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir o produto "{selectedProduct?.name}"?
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteDialog(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  "Excluir"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
