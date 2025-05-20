const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose'); // Add mongoose import

// Helpers
const createUserToken = require('../helpers/create-user-token');
const getToken = require('../helpers/get-token');
const getUserByToken = require('../helpers/get-user-by-token');

module.exports = class UserController {
  // Registro de usuário
  static async register(req, res) {
    const { name, email, phone, cpf, password } = req.body;

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

    // Criar usuário
    const user = new User({
      name,
      email,
      phone,
      cpf,
      password: passwordHash,
    });

    try {
      const newUser = await user.save();

      await createUserToken(newUser, req, res);
    } catch (error) {
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

  // Atualizar endereço do usuário
  static async updateAddress(req, res) {
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

    user.address = {
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      zipCode
    };

    try {
      await user.save();
      res.status(200).json({ message: 'Endereço atualizado com sucesso' });
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