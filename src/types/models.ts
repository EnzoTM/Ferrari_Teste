/**
 * Interfaces para os modelos de dados do projeto
 */

// Interface para Endereço
export interface IAddress {
  _id?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Interface para Método de Pagamento
export interface IPaymentMethod {
  _id?: string;
  type: 'credit' | 'debit';
  cardNumber: string;
  cardHolderName: string;
  expirationDate: string;
  cvv: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interface para Produto
export interface IProduct {
  _id?: string;
  name: string;
  price: number;
  description: string;
  type: 'car' | 'helmet' | 'formula1';
  images: string[];
  featured?: boolean;
  stock?: number;
  sold?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Interface para Item do Carrinho
export interface ICartItem {
  _id?: string;
  product: IProduct;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
}

// Interface para Item do Pedido
export interface IOrderItem {
  _id?: string;
  product: IProduct;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
}

// Interface para Pedido
export interface IOrder {
  _id?: string;
  orderItem: IOrderItem[];
  paymentMethod: IPaymentMethod;
  shippingAddress: IAddress;
  totalPrice: number;
  createdAt?: string;
  updatedAt?: string;
}

// Interface para Usuário
export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  cpf: string;
  admin?: boolean;
  address?: IAddress | null;
  paymentMethod?: IPaymentMethod | null;
  cart: ICartItem[];
  orders: IOrder[];
  createdAt?: string;
  updatedAt?: string;
}

// Interface para o Carrinho no frontend
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
  phone: string;
  cpf: string;
}

// Interface para resposta de autenticação
export interface AuthResponse {
  token: string;
  user: IUser;
}