const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Helpers
const createUserToken = require('../helpers/create-user-token');
const getToken = require('../helpers/get-token');
const getUserByToken = require('../helpers/get-user-by-token');

module.exports = class UserController {
  // Registro de usuário
  static async register(req, res) {
    const { name, email, phone, cpf, password, admin = false } = req.body;

    // Validações
    if (!name) {
      return res.status(422).json({ message: 'O nome é obrigatório' });
    }
    if (!email) {
      return res.status(422).json({ message: 'O email é obrigatório' });
    }
    if (!phone) {
      return res.status(422).json({ message: 'O telefone é obrigatório' });
    }
    if (!cpf) {
      return res.status(422).json({ message: 'O CPF é obrigatório' });
    }
    if (!password) {
      return res.status(422).json({ message: 'A senha é obrigatória' });
    }

    // Verificar se o usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(422).json({ message: 'Email já cadastrado, utilize outro email' });
    }

    // Verificar se CPF já existe
    const cpfExists = await User.findOne({ cpf });
    if (cpfExists) {
      return res.status(422).json({ message: 'CPF já cadastrado' });
    }

    // Criar senha hash
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Criar usuário com um carrinho vazio explicitamente definido
    const user = new User({
      name,
      email,
      phone,
      cpf,
      password: passwordHash,
      admin,
      cart: [], // Explicitly initialize as empty array to prevent schema issues
      orders: [] // Explicitly initialize as empty array
    });

    try {
      const newUser = await user.save();
      await createUserToken(newUser, req, res);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: error.message });
    }
  }

  // Login de usuário
  static async login(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(422).json({ message: 'O email é obrigatório' });
    }
    if (!password) {
      return res.status(422).json({ message: 'A senha é obrigatória' });
    }

    // Verificar se o usuário existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Verificar se a senha está correta
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(422).json({ message: 'Senha inválida' });
    }

    await createUserToken(user, req, res);
  }

  // Verificar usuário atual
  static async checkUser(req, res) {
    let currentUser = null;

    try {
      if (req.headers.authorization) {
        const token = getToken(req);
        
        // Wrap the JWT verification in a try-catch to prevent uncaught errors
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecreto');
          currentUser = await User.findById(decoded.id).select('-password');
        } catch (error) {
          console.error("JWT verification error:", error.message);
          // Token invalid but we don't want to throw an error, just return null user
        }
      }
      
      // Always send a 200 response, with either the user or null
      res.status(200).json(currentUser);
    } catch (error) {
      console.error("Error in checkUser:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  // Pegar usuário por ID
  static async getUserById(req, res) {
    const id = req.params.id;

    try {
      const user = await User.findById(id).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Editar usuário
  static async editUser(req, res) {
    let userId = null;

    // Check if user ID is in URL parameter
    if (req.params.id) {
      userId = req.params.id;
    } else {
      // Get user ID from token
      const token = getToken(req);
      const userFromToken = await getUserByToken(token);
      if (userFromToken) {
        userId = userFromToken._id;
      }
    }

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não identificado' });
    }

    try {
      // Find the user by ID
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Check if the user from the token has permission to edit this user
      const token = getToken(req);
      const userFromToken = await getUserByToken(token);

      // Only allow editing if it's the same user or the user is an admin
      if (userId !== userFromToken._id.toString() && !userFromToken.admin) {
        return res.status(401).json({ message: 'Acesso negado' });
      }

      const { name, email, phone, cpf, password, confirmPassword } = req.body;

      // Validações e atualizações
      if (name) {
        user.name = name;
      }

      if (email && email !== user.email) {
        const userExists = await User.findOne({ email });
        if (userExists && userExists._id.toString() !== userId) {
          return res.status(422).json({ message: 'Email já está em uso' });
        }
        user.email = email;
      }

      if (phone) {
        user.phone = phone;
      }

      if (cpf && cpf !== user.cpf) {
        const cpfExists = await User.findOne({ cpf });
        if (cpfExists && cpfExists._id.toString() !== userId) {
          return res.status(422).json({ message: 'CPF já está em uso' });
        }
        user.cpf = cpf;
      }

      // Verificar se o usuário enviou imagem
      if (req.file) {
        user.image = req.file.filename;
      }

      // Atualizar senha se fornecida
      if (password) {
        if (!confirmPassword) {
          return res.status(422).json({ message: 'A confirmação de senha é obrigatória' });
        }
        if (password !== confirmPassword) {
          return res.status(422).json({ message: 'A senha e a confirmação precisam ser iguais' });
        }

        // Criar senha hash
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        user.password = passwordHash;
      }

      await user.save();
      res.status(200).json({ message: 'Usuário atualizado com sucesso' });
    } catch (error) {
      console.error('Error in editUser:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Change password
  static async changePassword(req, res) {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword) {
      return res.status(422).json({ message: 'A senha atual é obrigatória' });
    }

    if (!newPassword) {
      return res.status(422).json({ message: 'A nova senha é obrigatória' });
    }

    try {
      // Verificar se id é válido
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(422).json({ message: 'ID inválido' });
      }

      // Find user
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Check if current password is correct
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(422).json({ message: 'Senha atual incorreta' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(newPassword, salt);

      // Update password
      user.password = passwordHash;
      await user.save();

      res.status(200).json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
      console.error('Error in changePassword:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get address
  static async getAddress(req, res) {
    try {
      const token = getToken(req);
      const user = await getUserByToken(token);

      if (!user) {
        return res.status(401).json({ message: 'Acesso negado' });
      }

      res.status(200).json({ address: user.address });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Add or update address
  static async updateAddress(req, res) {
    try {
      const token = getToken(req);
      const user = await getUserByToken(token);

      if (!user) {
        return res.status(401).json({ message: 'Acesso negado' });
      }

      const { street, number, complement, neighborhood, city, state, zipCode } = req.body;

      // Validações
      if (!street) {
        return res.status(422).json({ message: 'A rua é obrigatória' });
      }
      if (!number) {
        return res.status(422).json({ message: 'O número é obrigatório' });
      }
      if (!neighborhood) {
        return res.status(422).json({ message: 'O bairro é obrigatório' });
      }
      if (!city) {
        return res.status(422).json({ message: 'A cidade é obrigatória' });
      }
      if (!state) {
        return res.status(422).json({ message: 'O estado é obrigatório' });
      }
      if (!zipCode) {
        return res.status(422).json({ message: 'O CEP é obrigatório' });
      }

      // Create or update address
      user.address = {
        street,
        number,
        complement: complement || '',
        neighborhood,
        city,
        state,
        zipCode
      };

      await user.save();

      res.status(200).json({ 
        message: 'Endereço atualizado com sucesso',
        address: user.address
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get payment method
  static async getPaymentMethod(req, res) {
    try {
      const token = getToken(req);
      const user = await getUserByToken(token);

      if (!user) {
        return res.status(401).json({ message: 'Acesso negado' });
      }

      res.status(200).json({ paymentMethod: user.paymentMethod });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Add or update payment method
  static async updatePaymentMethod(req, res) {
    try {
      const token = getToken(req);
      const user = await getUserByToken(token);

      if (!user) {
        return res.status(401).json({ message: 'Acesso negado' });
      }

      const { type, cardNumber, cardHolderName, expirationDate, cvv } = req.body;

      // Validations
      if (!type) {
        return res.status(422).json({ message: 'O tipo de cartão é obrigatório' });
      }

      if (!['credit', 'debit'].includes(type)) {
        return res.status(422).json({ message: 'Tipo de cartão inválido' });
      }

      if (!cardNumber) {
        return res.status(422).json({ message: 'O número do cartão é obrigatório' });
      }
      
      if (!cardHolderName) {
        return res.status(422).json({ message: 'O nome no cartão é obrigatório' });
      }
      
      if (!expirationDate) {
        return res.status(422).json({ message: 'A data de validade é obrigatória' });
      }
      
      if (!cvv) {
        return res.status(422).json({ message: 'O código de segurança é obrigatório' });
      }

      // Create or update payment method
      user.paymentMethod = {
        type,
        cardNumber,
        cardHolderName,
        expirationDate,
        cvv
      };

      await user.save();

      // Return payment method without CVV for security
      const securePaymentMethod = {
        ...user.paymentMethod.toObject(),
        cvv: undefined
      };

      res.status(200).json({
        message: 'Método de pagamento atualizado com sucesso',
        paymentMethod: securePaymentMethod
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Add to cart
  static async addToCart(req, res) {
    try {
      const token = getToken(req);
      const user = await getUserByToken(token);

      if (!user) {
        return res.status(401).json({ message: 'Acesso negado' });
      }

      const { productId, quantity = 1, color, size } = req.body;

      // Validate product
      const product = await Product.findById(productId);
      
      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }

      // Create cart item
      const cartItem = {
        product: product._id,
        quantity: quantity,
      };

      // Check if same product with same attributes already exists in cart
      const existingItemIndex = user.cart.findIndex(item => 
        item.product.toString() === productId
      );

      if (existingItemIndex !== -1) {
        // Update quantity instead of adding new item
        user.cart[existingItemIndex].quantity += quantity;
      } else {
        // Add new item to cart
        user.cart.push(cartItem);
      }

      await user.save();

      // Populate product details for response
      await user.populate('cart.product');

      res.status(200).json({
        message: 'Produto adicionado ao carrinho',
        cart: user.cart
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Update cart item
  static async updateCartItem(req, res) {
    try {
      const token = getToken(req);
      const user = await getUserByToken(token);
      const { itemId } = req.params;
      const { quantity } = req.body;

      if (!user) {
        return res.status(401).json({ message: 'Acesso negado' });
      }

      // Find cart item
      const itemIndex = user.cart.findIndex(item => item._id.toString() === itemId);

      if (itemIndex === -1) {
        return res.status(404).json({ message: 'Item não encontrado no carrinho' });
      }

      // Update quantity
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        user.cart.splice(itemIndex, 1);
      } else {
        user.cart[itemIndex].quantity = quantity;
      }

      await user.save();
      
      // Populate product details for response
      await user.populate('cart.product');

      res.status(200).json({
        message: 'Carrinho atualizado com sucesso',
        cart: user.cart
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Remove from cart
  static async removeFromCart(req, res) {
    try {
      const token = getToken(req);
      const user = await getUserByToken(token);
      const { itemId } = req.params;

      if (!user) {
        return res.status(401).json({ message: 'Acesso negado' });
      }

      // Find cart item
      const itemIndex = user.cart.findIndex(item => item._id.toString() === itemId);

      if (itemIndex === -1) {
        return res.status(404).json({ message: 'Item não encontrado no carrinho' });
      }

      // Remove item
      user.cart.splice(itemIndex, 1);
      await user.save();

      res.status(200).json({
        message: 'Item removido do carrinho',
        cart: user.cart
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get cart
  static async getCart(req, res) {
    try {
      const token = getToken(req);
      const user = await getUserByToken(token);

      if (!user) {
        return res.status(401).json({ message: 'Acesso negado' });
      }

      // Populate product details for frontend display
      await user.populate('cart.product');

      res.status(200).json({ cart: user.cart });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Clear cart
  static async clearCart(req, res) {
    try {
      const token = getToken(req);
      const user = await getUserByToken(token);

      if (!user) {
        return res.status(401).json({ message: 'Acesso negado' });
      }

      user.cart = [];
      await user.save();

      res.status(200).json({
        message: 'Carrinho esvaziado com sucesso',
        cart: user.cart
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Create an order
  static async createOrder(req, res) {
    try {
      const token = getToken(req);
      const user = await getUserByToken(token);

      if (!user) {
        return res.status(401).json({ message: 'Acesso negado' });
      }

      // Validate if user has items in cart
      if (!user.cart || user.cart.length === 0) {
        return res.status(422).json({ message: 'Carrinho vazio. Adicione produtos antes de finalizar o pedido.' });
      }

      // Validate address
      if (!user.address) {
        return res.status(422).json({ message: 'Você precisa cadastrar um endereço antes de finalizar o pedido.' });
      }

      // Validate payment method
      if (!user.paymentMethod) {
        return res.status(422).json({ message: 'Você precisa cadastrar um método de pagamento antes de finalizar o pedido.' });
      }

      // Populate product details for order creation
      await user.populate('cart.product');

      // Create order products array with required information
      const orderProducts = user.cart.map(item => ({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images && item.product.images.length > 0 ? item.product.images[0] : null
      }));

      // Calculate order total
      const total = orderProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Create order
      const newOrder = {
        products: orderProducts,
        total,
        status: 'pending',
        paymentType: user.paymentMethod.type,
        shippingAddress: {
          street: user.address.street,
          number: user.address.number,
          complement: user.address.complement,
          neighborhood: user.address.neighborhood,
          city: user.address.city,
          state: user.address.state,
          zipCode: user.address.zipCode
        }
      };

      user.orders.push(newOrder);

      // Update product stock
      for (const item of user.cart) {
        const product = await Product.findById(item.product._id);
        if (product) {
          // Update stock count
          product.stock = Math.max(0, product.stock - item.quantity);
          product.sold += item.quantity;
          await product.save();
        }
      }

      // Clear cart
      user.cart = [];
      await user.save();

      res.status(201).json({ 
        message: 'Pedido criado com sucesso',
        order: user.orders[user.orders.length - 1]
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get all orders for the user
  static async getOrders(req, res) {
    try {
      const token = getToken(req);
      const user = await getUserByToken(token);

      if (!user) {
        return res.status(401).json({ message: 'Acesso negado' });
      }

      res.status(200).json({ orders: user.orders });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get order details
  static async getOrderById(req, res) {
    try {
      const token = getToken(req);
      const user = await getUserByToken(token);
      const { orderId } = req.params;

      if (!user) {
        return res.status(401).json({ message: 'Acesso negado' });
      }

      // Find order
      const order = user.orders.find(order => order._id.toString() === orderId);

      if (!order) {
        return res.status(404).json({ message: 'Pedido não encontrado' });
      }

      res.status(200).json({ order });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Listar todos usuários (admin)
  static async getAllUsers(req, res) {
    try {
      const token = getToken(req);
      const currentUser = await getUserByToken(token);

      if (!currentUser.admin) {
        return res.status(401).json({ message: 'Acesso negado' });
      }

      const users = await User.find().select('-password');
      res.status(200).json({ users });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Excluir usuário (admin)
  static async deleteUser(req, res) {
    try {
      const id = req.params.id;
      const token = getToken(req);
      const currentUser = await getUserByToken(token);

      if (!currentUser.admin) {
        return res.status(401).json({ message: 'Acesso negado' });
      }

      // Verificar se id é válido
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(422).json({ message: 'ID inválido' });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      await User.findByIdAndDelete(id);
      res.status(200).json({ message: 'Usuário removido com sucesso' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};