"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { API_ENDPOINTS, authFetchConfig, isAuthenticated } from "@/lib/api"

export interface ICartItem {
  id: string
  name: string
  price: number
  image: string
  category: string
  quantity?: number
}

interface Cart {
  items: ICartItem[]
  total: number
  itemCount: number
}

interface CartContextState {
  cart: Cart
  isLoading: boolean
  addItem: (item: ICartItem) => Promise<void>
  removeItem: (id: string) => Promise<void>
  updateItemQuantity: (id: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  itemCount: number
}

const CartContext = createContext<CartContextState | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0, itemCount: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Load cart from backend on mount
  useEffect(() => {
    if (isAuthenticated()) {
      loadCartFromBackend()
    }
  }, [])

  const loadCartFromBackend = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(API_ENDPOINTS.cart, authFetchConfig())
      
      if (response.ok) {
        const data = await response.json()
        
        const cartItems: ICartItem[] = data.cart.map((item: any) => ({
          id: item._id, // Use cart item's _id, not product._id
          name: item.product.name,
          price: item.product.price,
          image: item.product.images && item.product.images.length > 0 
            ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/public/images/products/${item.product.images[0]}`
            : "/placeholder.svg",
          category: item.product.type,
          quantity: item.quantity
        }))

        const total = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)
        const itemCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)

        setCart({ items: cartItems, total, itemCount })
      }
    } catch (error) {
      console.error("Error loading cart from backend:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = async (item: ICartItem) => {
    if (!isAuthenticated()) {
      toast({
        title: "Login necessário",
        description: "Você precisa fazer login para adicionar itens ao carrinho.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      
      const response = await fetch(API_ENDPOINTS.addToCart, authFetchConfig('POST', {
        productId: item.id,
        quantity: item.quantity || 1
      }))

      if (response.ok) {
        await loadCartFromBackend() // Reload cart from backend
        toast({
          title: "Item adicionado",
          description: `${item.name} foi adicionado ao carrinho.`,
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erro ao adicionar item ao carrinho")
      }
    } catch (error) {
      console.error("Error adding item to cart:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao adicionar item ao carrinho.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const removeItem = async (id: string) => {
    if (!isAuthenticated()) return

    try {
      setIsLoading(true)
      
      // Find the cart item to get the backend cart item ID
      const cartItem = cart.items.find(item => item.id === id)
      if (!cartItem) return

      const response = await fetch(API_ENDPOINTS.removeFromCart(id), authFetchConfig('DELETE'))

      if (response.ok) {
        await loadCartFromBackend() // Reload cart from backend
        toast({
          title: "Item removido",
          description: `${cartItem.name} foi removido do carrinho.`,
        })
      } else {
        throw new Error("Erro ao remover item do carrinho")
      }
    } catch (error) {
      console.error("Error removing item from cart:", error)
      toast({
        title: "Erro",
        description: "Erro ao remover item do carrinho.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateItemQuantity = async (id: string, quantity: number) => {
    if (!isAuthenticated()) return

    if (quantity <= 0) {
      await removeItem(id)
      return
    }

    try {
      setIsLoading(true)
      
      const response = await fetch(API_ENDPOINTS.updateCartItem(id), authFetchConfig('PUT', {
        quantity
      }))

      if (response.ok) {
        await loadCartFromBackend() // Reload cart from backend
      } else {
        throw new Error("Erro ao atualizar quantidade")
      }
    } catch (error) {
      console.error("Error updating item quantity:", error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar quantidade do item.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearCart = async () => {
    if (!isAuthenticated()) return

    try {
      setIsLoading(true)
      
      const response = await fetch(API_ENDPOINTS.clearCart, authFetchConfig('DELETE'))

      if (response.ok) {
        setCart({ items: [], total: 0, itemCount: 0 })
      } else {
        throw new Error("Erro ao limpar carrinho")
      }
    } catch (error) {
      console.error("Error clearing cart:", error)
      toast({
        title: "Erro",
        description: "Erro ao limpar carrinho.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const value: CartContextState = {
    cart,
    isLoading,
    addItem,
    removeItem,
    updateItemQuantity,
    clearCart,
    itemCount: cart.itemCount
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
