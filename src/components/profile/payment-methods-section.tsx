"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { API_URL, API_ENDPOINTS, authFetchConfig } from "@/lib/api"
import { 
  Plus, Edit, Trash2, CreditCard, CheckCircle2, 
  Wallet, QrCode, Receipt, BanknoteIcon 
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
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
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PaymentMethod {
  _id?: string
  type: 'credit' | 'debit' | 'pix' | 'bankslip'
  cardNumber?: string
  cardHolderName?: string
  expirationDate?: string
  cvv?: string
  isDefault: boolean
}

export default function PaymentMethodsSection() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [currentPayment, setCurrentPayment] = useState<PaymentMethod | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  // Fetch payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(API_ENDPOINTS.paymentMethods, authFetchConfig())
        
        if (!response.ok) {
          throw new Error('Failed to fetch payment methods')
        }
        
        const data = await response.json()
        setPaymentMethods(data.paymentMethods || [])
      } catch (error) {
        console.error("Error fetching payment methods:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar seus métodos de pagamento.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPaymentMethods()
  }, [toast])

  const handlePaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validatePaymentForm()) {
      return
    }
    
    try {
      const isEditing = !!currentPayment?._id
      const url = isEditing 
        ? `${API_ENDPOINTS.paymentMethods}/${currentPayment?._id}` 
        : API_ENDPOINTS.paymentMethods
      
      const method = isEditing ? 'PUT' : 'POST'
      const response = await fetch(url, authFetchConfig(method, {body: currentPayment}))
      
      if (!response.ok) {
        throw new Error(isEditing ? 'Falha ao atualizar método de pagamento' : 'Falha ao adicionar método de pagamento')
      }
      
      const data = await response.json()
      
      // Garantir que os métodos de pagamento sejam atualizados corretamente
      if (Array.isArray(data.paymentMethods)) {
        setPaymentMethods(data.paymentMethods)
      } else if (isEditing && currentPayment) {
        // Atualizar localmente se o servidor não retornar a lista completa
        const updatedPaymentMethods = paymentMethods.map(payment => 
          payment._id === currentPayment._id ? {...currentPayment} : payment
        );
        
        // Se o método foi marcado como padrão, atualizar outros métodos
        if (currentPayment.isDefault) {
          updatedPaymentMethods.forEach(payment => {
            if (payment._id !== currentPayment._id) {
              payment.isDefault = false;
            }
          });
        }
        
        setPaymentMethods(updatedPaymentMethods);
      } else if (currentPayment) {
        // Adicionar novo método localmente se o servidor não retornar a lista completa
        const newPayment = {...currentPayment, _id: data._id || Date.now().toString()};
        
        // Se o novo método for padrão, garantir que outros não sejam
        if (newPayment.isDefault) {
          const updatedPaymentMethods = paymentMethods.map(payment => ({
            ...payment,
            isDefault: false
          }));
          setPaymentMethods([...updatedPaymentMethods, newPayment]);
        } else {
          setPaymentMethods([...paymentMethods, newPayment]);
        }
      }
      
      setIsPaymentDialogOpen(false)
      
      toast({
        title: isEditing ? "Método de pagamento atualizado" : "Método de pagamento adicionado",
        description: isEditing 
          ? "Seu método de pagamento foi atualizado com sucesso." 
          : "Seu método de pagamento foi adicionado com sucesso."
      })
    } catch (error) {
      console.error("Error saving payment method:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive"
      })
    }
  }

  const handleDeletePayment = async (paymentId: string) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.paymentMethods}/${paymentId}`,
        authFetchConfig('DELETE')
      )
      if (!response.ok) {
        throw new Error('Failed to delete payment method')
      }
      const data = await response.json()
      
      // Garantir que os métodos de pagamento sejam atualizados corretamente
      if (Array.isArray(data.paymentMethods)) {
        setPaymentMethods(data.paymentMethods)
      } else {
        // Remover o método de pagamento localmente se o servidor não retornar a lista completa
        setPaymentMethods(paymentMethods.filter(method => method._id !== paymentId))
      }
      
      toast({
        title: "Método de pagamento removido",
        description: "O método de pagamento foi removido com sucesso."
      })
    } catch (error) {
      console.error("Error deleting payment method:", error)
      toast({
        title: "Erro",
        description: "Não foi possível remover o método de pagamento.",
        variant: "destructive"
      })
    }
  }

  const handleSetDefaultPayment = async (paymentId: string) => {
    try {
      // Find the payment method and set isDefault to true
      const payment = paymentMethods.find(method => method._id === paymentId)
      if (!payment) return
      
      const response = await fetch(
        `${API_ENDPOINTS.paymentMethods}/${paymentId}`,
        authFetchConfig('PUT', { ...payment, isDefault: true })
      )
      if (!response.ok) {
        throw new Error('Failed to set default payment method')
      }
      const data = await response.json()
      
      // Garantir que os métodos de pagamento sejam atualizados corretamente
      if (Array.isArray(data.paymentMethods)) {
        setPaymentMethods(data.paymentMethods)
      } else {
        // Atualizar os métodos de pagamento localmente se o servidor não retornar a lista completa
        setPaymentMethods(paymentMethods.map(method => ({
          ...method,
          isDefault: method._id === paymentId
        })))
      }
      
      toast({
        title: "Método de pagamento padrão atualizado",
        description: "Seu método de pagamento padrão foi atualizado com sucesso."
      })
    } catch (error) {
      console.error("Error setting default payment method:", error)
      toast({
        title: "Erro",
        description: "Não foi possível definir o método de pagamento padrão.",
        variant: "destructive"
      })
    }
  }

  const validatePaymentForm = () => {
    const errors: Record<string, string> = {}
    
    if (!currentPayment) return false
    
    if (!currentPayment.type) {
      errors.type = 'O tipo de pagamento é obrigatório'
    }
    
    // Additional validations for credit/debit cards
    if (currentPayment.type === 'credit' || currentPayment.type === 'debit') {
      if (!currentPayment.cardNumber) {
        errors.cardNumber = 'O número do cartão é obrigatório'
      } else if (!/^\d{13,19}$/.test(currentPayment.cardNumber.replace(/\s/g, ''))) {
        errors.cardNumber = 'Número de cartão inválido'
      }
      
      if (!currentPayment.cardHolderName) {
        errors.cardHolderName = 'O nome do titular é obrigatório'
      }
      
      if (!currentPayment.expirationDate) {
        errors.expirationDate = 'A data de validade é obrigatória'
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(currentPayment.expirationDate)) {
        errors.expirationDate = 'Formato inválido. Use MM/AA'
      }
      
      if (!currentPayment.cvv) {
        errors.cvv = 'O código de segurança é obrigatório'
      } else if (!/^\d{3,4}$/.test(currentPayment.cvv)) {
        errors.cvv = 'CVV inválido'
      }
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (currentPayment) {
      setCurrentPayment({
        ...currentPayment,
        [name]: value
      })
    }
  }

  const handleSelectChange = (value: string) => {
    if (currentPayment) {
      setCurrentPayment({
        ...currentPayment,
        type: value as 'credit' | 'debit' | 'pix' | 'bankslip',
        // Reset card fields if changing from credit/debit to another payment type
        ...(!['credit', 'debit'].includes(value) && {
          cardNumber: '',
          cardHolderName: '',
          expirationDate: '',
          cvv: ''
        })
      })
    }
  }

  const addNewPaymentMethod = () => {
    setCurrentPayment({
      type: 'credit',
      cardNumber: '',
      cardHolderName: '',
      expirationDate: '',
      cvv: '',
      isDefault: paymentMethods.length === 0 // First payment method is default
    })
    setIsPaymentDialogOpen(true)
  }

  const editPaymentMethod = (payment: PaymentMethod) => {
    setCurrentPayment({...payment})
    setIsPaymentDialogOpen(true)
  }

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <CreditCard className="h-5 w-5 text-blue-600" />
      case 'debit':
        return <BanknoteIcon className="h-5 w-5 text-green-600" />
      case 'pix':
        return <QrCode className="h-5 w-5 text-purple-600" />
      case 'bankslip':
        return <Receipt className="h-5 w-5 text-orange-600" />
      default:
        return <Wallet className="h-5 w-5" />
    }
  }

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'credit':
        return 'Cartão de Crédito'
      case 'debit':
        return 'Cartão de Débito'
      case 'pix':
        return 'PIX'
      case 'bankslip':
        return 'Boleto Bancário'
      default:
        return type
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Métodos de Pagamento</h2>
        <Button onClick={addNewPaymentMethod} className="bg-red-600 hover:bg-red-700">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Método
        </Button>
      </div>

      {paymentMethods.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <Wallet className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">Nenhum método de pagamento cadastrado</h3>
          <p className="mt-2 text-sm text-gray-500">
            Adicione um método de pagamento para facilitar suas compras.
          </p>
          <Button onClick={addNewPaymentMethod} className="mt-4 bg-red-600 hover:bg-red-700">
            Adicionar Método de Pagamento
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {paymentMethods.map((payment) => (
            <Card key={payment._id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getPaymentIcon(payment.type)}
                    <CardTitle className="text-base font-medium">
                      {getPaymentTypeLabel(payment.type)}
                    </CardTitle>
                  </div>
                  {payment.isDefault && (
                    <Badge className="bg-green-600">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Padrão
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-2 text-sm">
                {(payment.type === 'credit' || payment.type === 'debit') && (
                  <>
                    <p className="font-medium">{payment.cardHolderName}</p>
                    <p>{payment.cardNumber}</p>
                    <p>Validade: {payment.expirationDate}</p>
                  </>
                )}
                {payment.type === 'pix' && (
                  <p>Pagamento instantâneo via PIX</p>
                )}
                {payment.type === 'bankslip' && (
                  <p>Pagamento via boleto bancário</p>
                )}
              </CardContent>
              <CardFooter className="pt-2">
                <div className="flex w-full space-x-2">
                  {!payment.isDefault && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-green-600 hover:text-green-700"
                      onClick={() => handleSetDefaultPayment(payment._id!)}
                    >
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      Tornar Padrão
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => editPaymentMethod(payment)}
                  >
                    <Edit className="mr-1 h-4 w-4" />
                    Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 hover:text-red-700"
                        disabled={paymentMethods.length === 1}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Remover
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover método de pagamento?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Você tem certeza que deseja remover este método de pagamento? Esta ação não poderá ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleDeletePayment(payment._id!)}
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentPayment?._id ? "Editar Método de Pagamento" : "Adicionar Método de Pagamento"}
            </DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo com as informações do seu método de pagamento.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePaymentSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Pagamento *</Label>
                <Select 
                  value={currentPayment?.type} 
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Selecione o tipo de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">Cartão de Crédito</SelectItem>
                    <SelectItem value="debit">Cartão de Débito</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="bankslip">Boleto Bancário</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.type && (
                  <p className="text-xs text-red-600">{formErrors.type}</p>
                )}
              </div>

              {/* Credit/Debit Card Fields */}
              {(currentPayment?.type === 'credit' || currentPayment?.type === 'debit') && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Número do Cartão *</Label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      value={currentPayment?.cardNumber || ""}
                      onChange={handleInputChange}
                      placeholder="0000 0000 0000 0000"
                    />
                    {formErrors.cardNumber && (
                      <p className="text-xs text-red-600">{formErrors.cardNumber}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardHolderName">Nome do Titular *</Label>
                    <Input
                      id="cardHolderName"
                      name="cardHolderName"
                      value={currentPayment?.cardHolderName || ""}
                      onChange={handleInputChange}
                      placeholder="Nome como está no cartão"
                    />
                    {formErrors.cardHolderName && (
                      <p className="text-xs text-red-600">{formErrors.cardHolderName}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expirationDate">Validade *</Label>
                      <Input
                        id="expirationDate"
                        name="expirationDate"
                        value={currentPayment?.expirationDate || ""}
                        onChange={handleInputChange}
                        placeholder="MM/AA"
                      />
                      {formErrors.expirationDate && (
                        <p className="text-xs text-red-600">{formErrors.expirationDate}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV *</Label>
                      <Input
                        id="cvv"
                        name="cvv"
                        value={currentPayment?.cvv || ""}
                        onChange={handleInputChange}
                        placeholder="123"
                      />
                      {formErrors.cvv && (
                        <p className="text-xs text-red-600">{formErrors.cvv}</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* PIX Message */}
              {currentPayment?.type === 'pix' && (
                <div className="rounded-md bg-blue-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <QrCode className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Informação sobre PIX</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>
                          Ao escolher PIX como método de pagamento, você receberá um QR code no momento da compra 
                          para realizar o pagamento instantâneo.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Boleto Message */}
              {currentPayment?.type === 'bankslip' && (
                <div className="rounded-md bg-yellow-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Receipt className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Informação sobre Boleto</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Ao escolher Boleto como método de pagamento, você receberá um boleto bancário 
                          para pagamento em até 3 dias úteis.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" className="bg-red-600 hover:bg-red-700">
                {currentPayment?._id ? "Atualizar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}