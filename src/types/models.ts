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
  type: 'credit' | 'debit' | 'pix' | 'bankslip';
  cardNumber?: string;
  cardHolderName?: string;
  expirationDate?: string;
  cvv?: string;
  isDefault?: boolean;
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
  addresses?: IAddress[];
  paymentMethods?: IPaymentMethod[];
  cart?: ICartProduct[];
  orders?: IOrder[];
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
  type: 'car' | 'formula1' | 'helmet';
  images: string[];
  featured?: boolean;
  stock?: number;
  sold?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Interface para Item do Carrinho no backend
export interface ICartProduct {
  product: string | IProduct;
  quantity: number;
}

// Interface para Item do Carrinho no frontend
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

// Interface para produtos do Pedido
export interface IOrderProduct {
  product: string | IProduct;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

// Interface para Pedido
export interface IOrder {
  _id?: string;
  products: IOrderProduct[];
  paymentMethod?: string | IPaymentMethod;
  shippingAddress?: string | IAddress;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled';
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
  phone: string;
  cpf: string;
}

// Interface para resposta de autenticação
export interface AuthResponse {
  token: string;
  user: IUser;
}