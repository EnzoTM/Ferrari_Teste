/**
 * Configurações e funções para interação com a API
 */

// URL base da API
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Tipos de produtos disponíveis
export const PRODUCT_TYPES = {
  car: 'car',
  helmet: 'helmet',
  f1: 'f1',
  accessory: 'accessory'
}

// Todos os endpoints da API
export const API_ENDPOINTS = {
  // Auth endpoints
  login: `${API_URL}/api/users/login`,
  register: `${API_URL}/api/users/register`,
  
  // User endpoints
  users: `${API_URL}/api/users`,
  user: (id: string) => `${API_URL}/api/users/${id}`,
  
  // Product endpoints
  products: `${API_URL}/api/products`,
  product: (id: string) => `${API_URL}/api/products/${id}`,
  productsByType: (type: string) => `${API_URL}/api/products/type/${type}`,
  featured: `${API_URL}/api/products/featured`,
  featuredProducts: `${API_URL}/api/products/featured`,
  
  // Category endpoints
  categories: `${API_URL}/api/categories`,
  category: (id: string) => `${API_URL}/api/categories/${id}`,
  
  // Cart endpoints
  cart: `${API_URL}/api/cart`,
  cartItems: (userId: string) => `${API_URL}/api/cart/${userId}`,
  
  // Order endpoints
  orders: `${API_URL}/api/orders`,
  order: (id: string) => `${API_URL}/api/orders/${id}`,
  userOrders: (userId: string) => `${API_URL}/api/orders/user/${userId}`
}

// Funções auxiliares para autenticação
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

export const getUserId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userId')
  }
  return null
}

export const isUserAdmin = (): boolean => {
  try {
    // First check if authenticated
    if (!isAuthenticated()) return false;
    
    // Get user data from local storage
    const userJSON = localStorage.getItem('user');
    if (!userJSON) return false;
    
    const user = JSON.parse(userJSON);
    // Check admin property directly
    return user.admin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Alias para isUserAdmin para compatibilidade com código existente
export const isAdmin = isUserAdmin

export const isAuthenticated = (): boolean => {
  return !!getAuthToken()
}

// Configuração padrão para requisições autenticadas
export const authFetchConfig = (method: string = 'GET', body: any = null): RequestInit => {
  const token = getAuthToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const config: RequestInit = {
    method,
    headers
  }
  
  if (body) {
    config.body = JSON.stringify(body)
  }
  
  return config
}

// Função auxiliar para fazer fetch com autenticação
export const fetchWithAuth = (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken()
  
  const headers: HeadersInit = {
    ...options.headers,
    'Content-Type': 'application/json'
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return fetch(url, {
    ...options,
    headers
  })
}

// Função para realizar upload de imagens
export const uploadImage = async (file: File, type: 'product' | 'user'): Promise<string> => {
  const token = getAuthToken()
  if (!token) throw new Error('Autenticação necessária')
  
  const formData = new FormData()
  formData.append('image', file)
  
  const endpoint = type === 'product' 
    ? `${API_URL}/api/products/upload`
    : `${API_URL}/api/users/upload`
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erro ao fazer upload da imagem')
    }
    
    const data = await response.json()
    return data.filename
  } catch (error) {
    console.error('Erro ao fazer upload:', error)
    throw error
  }
}

// Funções para operações de usuário
export const getUserProfile = async (): Promise<any> => {
  try {
    // First try to get from localStorage for immediate display
    const userJSON = localStorage.getItem('user');
    if (userJSON) {
      const localUser = JSON.parse(userJSON);
      
      // Now make the API call to get updated data
      const userId = getUserId();
      if (userId) {
        try {
          // Check if API_URL is defined
          if (!API_URL) {
            console.error("API_URL is undefined");
            return localUser; // Return local data as fallback
          }
          
          const response = await fetchWithAuth(`${API_URL}/api/users/${userId}`);
          
          if (response.ok) {
            const userData = await response.json();
            // Update localStorage with fresh data
            localStorage.setItem('user', JSON.stringify(userData.user || userData));
            return userData.user || userData;
          } else {
            console.error("API response not OK:", await response.text());
            return localUser; // Return local data as fallback
          }
        } catch (error) {
          console.error("Error fetching updated profile:", error);
          // Return the local data if API call fails
          return localUser;
        }
      }
      return localUser;
    }
    
    // If no local data, try multiple approaches to get user data
    const token = getAuthToken();
    if (!token) throw new Error("Not authenticated");
    
    // Check if API_URL is defined
    if (!API_URL) {
      throw new Error("API_URL is undefined - check your environment variables");
    }
    
    try {
      // Try the /check endpoint instead of /checkuser
      const response = await fetch(`${API_URL}/api/users/check`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        // If check fails, try with userId
        const userId = getUserId();
        if (userId) {
          const userResponse = await fetchWithAuth(`${API_URL}/api/users/${userId}`);
          if (userResponse.ok) {
            const data = await userResponse.json();
            const userData = data.user || data;
            localStorage.setItem('user', JSON.stringify(userData));
            return userData;
          }
        }
        throw new Error(`Failed to fetch user profile: ${response.status}`);
      }
      
      const data = await response.json();
      // The API might return either the user object directly or inside a 'user' property
      const userData = data.user || data;
      
      if (!userData) {
        throw new Error("User data not found in response");
      }
      
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error("Error in API call:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    throw error;
  }
}

// Função para fazer logout
export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('user')
    // Redirecionar para a página inicial ou de login
    window.location.href = '/'
  }
}