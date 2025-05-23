"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { ICartItem, ICart, CartContextState } from "@/types/models"
import { useToast } from "@/components/ui/use-toast"

const CartContext = createContext<CartContextState | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<ICart>(() => {
    // Inicializa o carrinho com valores do localStorage, se disponível
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("ferrariCart")
      if (savedCart) {
        try {
          return JSON.parse(savedCart)
        } catch (error) {
          console.error("Erro ao analisar carrinho salvo:", error)
        }
      }
    }
    return { items: [], total: 0 }
  })

  const { toast } = useToast()

  // Salvar carrinho no localStorage quando mudar
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ferrariCart", JSON.stringify(cart))
    }
  }, [cart])

  // Calcular o total do carrinho
  const calculateTotal = (items: ICartItem[]): number => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  // Adicionar item ao carrinho
  const addItem = (newItem: Omit<ICartItem, "quantity"> & { quantity?: number }) => {
    setCart((prevCart) => {
      // Verificar se o item já existe no carrinho
      const existingItemIndex = prevCart.items.findIndex((item) => item.id === newItem.id)
      let updatedItems: ICartItem[]

      if (existingItemIndex >= 0) {
        // Se já existe, aumentar a quantidade
        updatedItems = [...prevCart.items]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + (newItem.quantity || 1)
        }
      } else {
        // Se não existe, adicionar novo item
        updatedItems = [
          ...prevCart.items,
          { ...newItem, quantity: newItem.quantity || 1 } as ICartItem
        ]
      }

      // Calcular o novo total
      const newTotal = calculateTotal(updatedItems)

      toast({
        title: "Item adicionado ao carrinho",
        description: `${newItem.name} foi adicionado ao seu carrinho`,
      })

      return { items: updatedItems, total: newTotal }
    })
  }

  // Remover item do carrinho
  const removeItem = (itemId: string) => {
    setCart((prevCart) => {
      const updatedItems = prevCart.items.filter((item) => item.id !== itemId)
      const newTotal = calculateTotal(updatedItems)

      // Mostrar toast de notificação
      const removedItem = prevCart.items.find((item) => item.id === itemId)
      if (removedItem) {
        toast({
          title: "Item removido",
          description: `${removedItem.name} foi removido do seu carrinho`,
        })
      }

      return { items: updatedItems, total: newTotal }
    })
  }

  // Atualizar quantidade de um item
  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return

    setCart((prevCart) => {
      const itemIndex = prevCart.items.findIndex((item) => item.id === itemId)
      if (itemIndex === -1) return prevCart

      const updatedItems = [...prevCart.items]
      updatedItems[itemIndex] = { ...updatedItems[itemIndex], quantity }
      const newTotal = calculateTotal(updatedItems)

      return { items: updatedItems, total: newTotal }
    })
  }

  // Limpar o carrinho
  const clearCart = () => {
    setCart({ items: [], total: 0 })
    toast({
      title: "Carrinho limpo",
      description: "Todos os itens foram removidos do seu carrinho",
    })
  }

  // Converter o carrinho para o formato do backend
  const getBackendCartFormat = () => {
    return cart.items.map(item => ({
      product: item.id,
      quantity: item.quantity
    }))
  }

  // Total de itens no carrinho (soma das quantidades)
  const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateItemQuantity,
        clearCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
