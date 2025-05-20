"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ICartItem } from "@/types/models"
import { API_ENDPOINTS, API_URL, fetchWithAuth, isAuthenticated } from "@/lib/api"

interface CartContextType {
  items: ICartItem[]
  addItem: (item: Omit<ICartItem, "quantity"> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  syncWithUserCart: () => Promise<void>
  saveCartToUser: () => Promise<boolean>
  checkout: () => Promise<boolean>
  itemCount: number
  subtotal: number
  total: number
  shipping: number
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ICartItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const shipping = 15.99

  // Carregar carrinho do localStorage na renderização inicial
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Falha ao analisar carrinho do localStorage:", error)
      }
    }
  }, [])

  // Tenta sincronizar com o carrinho do usuário se ele estiver logado
  useEffect(() => {
    if (isAuthenticated()) {
      syncWithUserCart();
    }
  }, []);

  // Salvar carrinho no localStorage sempre que ele mudar
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items))
  }, [items])

  // Sincroniza o carrinho local com o carrinho do usuário logado
  const syncWithUserCart = async () => {
    if (!isAuthenticated()) return;
    
    try {
      setIsLoading(true);
      const response = await fetchWithAuth(API_ENDPOINTS.userProfile);
      const userData = await response.json();
      
      if (userData && userData.user && userData.user.cart && userData.user.cart.length > 0) {
        // Converter os itens do carrinho do usuário para o formato do carrinho local
        const userCartItems: ICartItem[] = userData.user.cart.map((item: any) => ({
          id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.images && item.product.images.length > 0 
            ? `${API_URL}/public/images/products/${item.product.images[0]}`
            : '/placeholder.svg',
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          category: item.product.category
        }));
        
        // Mesclar os itens locais com os itens do carrinho do usuário
        const mergedCart = mergeCartItems([...items, ...userCartItems]);
        setItems(mergedCart);
      }
    } catch (error) {
      console.error('Erro ao sincronizar carrinho:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mescla carrinho, somando quantidades de itens iguais
  const mergeCartItems = (cartItems: ICartItem[]): ICartItem[] => {
    const itemMap = new Map<string, ICartItem>();
    
    cartItems.forEach(item => {
      const key = `${item.id}-${item.color || ''}-${item.size || ''}`;
      
      if (itemMap.has(key)) {
        const existingItem = itemMap.get(key)!;
        existingItem.quantity += item.quantity;
      } else {
        itemMap.set(key, { ...item });
      }
    });
    
    return Array.from(itemMap.values());
  };

  // Salva o carrinho no perfil do usuário logado
  const saveCartToUser = async (): Promise<boolean> => {
    if (!isAuthenticated() || items.length === 0) return false;
    
    try {
      setIsLoading(true);
      
      // Preparar os itens no formato que o backend espera
      const cartItems = items.map(item => ({
        product: item.id,
        quantity: item.quantity,
        color: item.color,
        size: item.size
      }));
      
      // Atualizar o carrinho do usuário
      const response = await fetchWithAuth(API_ENDPOINTS.cart, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: cartItems })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Erro ao salvar carrinho:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Finaliza a compra, transferindo itens do carrinho para pedidos
  const checkout = async (): Promise<boolean> => {
    if (!isAuthenticated() || items.length === 0) return false;
    
    try {
      setIsLoading(true);
      
      // Preparar os itens para o checkout
      const orderItems = items.map(item => ({
        product: item.id,
        quantity: item.quantity,
        price: item.price,
        color: item.color,
        size: item.size
      }));
      
      // Criar o pedido
      const response = await fetchWithAuth(API_ENDPOINTS.orders, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          items: orderItems,
          // Outros dados do pedido seriam adicionados aqui em uma implementação completa
          // shippingAddress, paymentMethod, etc.
        })
      });
      
      if (response.ok) {
        // Limpar carrinho após checkout bem-sucedido
        clearCart();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao finalizar compra:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = (newItem: Omit<ICartItem, "quantity"> & { quantity?: number }) => {
    setItems((currentItems) => {
      // Verificar se o item já existe no carrinho
      const existingItemIndex = currentItems.findIndex(
        (item) => item.id === newItem.id && 
                  item.color === newItem.color && 
                  item.size === newItem.size
      );
      
      const quantityToAdd = newItem.quantity || 1;
      
      if (existingItemIndex > -1) {
        // Item existe, incrementar quantidade
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex].quantity += quantityToAdd;
        return updatedItems;
      } else {
        // Item não existe, adicionar novo item com quantidade especificada ou default 1
        return [...currentItems, { ...newItem, quantity: quantityToAdd }];
      }
    });
  };

  const removeItem = (id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    
    setItems((currentItems) => 
      currentItems.map((item) => 
        (item.id === id ? { ...item, quantity } : item)
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const total = subtotal + shipping;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        syncWithUserCart,
        saveCartToUser,
        checkout,
        itemCount,
        subtotal,
        shipping,
        total,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return context;
}
