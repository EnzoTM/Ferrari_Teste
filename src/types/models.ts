/**
 * Interfaces para os modelos de dados do projeto
 */

// Interface para Usuário
export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
  image?: string;
  isAdmin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Interface para Categoria
export interface ICategory {
  _id?: string;
  name: string;
  description?: string;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interface para Produto
export interface IProduct {
  _id?: string;
  name: string;
  price: number;
  description: string;
  type: 'car' | 'formula1' | 'helmet' | 'other';
  images?: string[];
  featured?: boolean;
  stock?: number;
  tags?: string[];
  category?: string | ICategory;
  createdAt?: string;
  updatedAt?: string;
}

// Interface para Item do Carrinho
export interface ICartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

// Interface para o Carrinho completo
export interface ICart {
  items: ICartItem[];
  total: number;
}

// Interface para estado do contexto do carrinho
export interface CartContextState {
  cart: ICart;
  addItem: (item: Omit<ICartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
}

// Interface para Pedido
export interface IOrder {
  _id?: string;
  user: string | IUser;
  items: ICartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled';
  paymentMethod: 'credit_card' | 'bank_transfer' | 'pix';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  shippingAddress: string;
  trackingCode?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interface para Resposta da API
export interface ApiResponse<T> {
  message?: string;
  error?: string;
  data?: T;
}

// Interface para Credenciais de Login
export interface LoginCredentials {
  email: string;
  password: string;
}

// Interface para dados de Registro de Usuário
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

// Interface para resposta de autenticação
export interface AuthResponse {
  token: string;
  user: IUser;
}