const User = require("../models/User");
const multer = require("multer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// helpers
const createUserToken = require("../helpers/create-user-token");
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");
const { upload } = require("../helpers/image-upload.js");

class UserController {
  static async register(req, res) {
    const { name, email, phone, password, confirmpassword, cpf } = req.body;

    // Validations

    if (!name) {
      res.status(422).json({ message: "O nome é obrigatório!" });
      return;
    }
    if (!email) {
      res.status(422).json({ message: "O email é obrigatório!" });
      return;
    }
    if (!phone) {
      res.status(422).json({ message: "O telefone é obrigatório!" });
      return;
    }
    if (!password) {
      res.status(422).json({ message: "A senha é obrigatória!" });
      return;
    }
    if (!confirmpassword) {
      res
        .status(422)
        .json({ message: "A confirmação da senha é obrigatória!" });
      return;
    }
    if (!cpf) {
      res.status(422).json({ message: "O cpf é obrigatório!" });
      return;
    }
    if (password !== confirmpassword) {
      res.status(422).json({ message: "As duas senhas precisam ser iguais!" });
      return;
    }

    // Check if user exists

    const userExists = await User.findOne({ email: email });

    if (userExists) {
      res.status(422).json({ message: "Email já cadastrado!" });
      return;
    }

    // Create a password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create a user

    const user = new User({
      name,
      email,
      phone,
      password: passwordHash,
      cpf,
      admin: false,
    });

    try {
      const newUser = await user.save();
      await createUserToken(newUser, req, res);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;

    if (!email) {
      res.status(422).json({ message: "Email é obrigatório!" });
      return;
    }

    if (!password) {
      res.status(422).json({ message: "A senha é obrigatória!" });
      return;
    }

    // Check if user exists

    const user = await User.findOne({ email: email });

    if (!user) {
      res
        .status(422)
        .json({ message: "Não há usuário cadastrado com esse email!" });
      return;
    }

    // Check if password matches db password

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      res.status(422).json({ message: "Senha inválida!" });
      return;
    }

    await createUserToken(user, req, res);
  }

  static async checkUser(req, res) {
    let currentUser;

    if (req.headers.authorization) {
      const token = getToken(req);
      const decoded = jwt.verify(token, "nossosecret");

      const user = await User.findById(decoded.id);
      if (user) {
        currentUser = user;
        currentUser.password = undefined;
      }
    } else {
      currentUser = null;
    }
 
    res.status(200).send(currentUser);
  }

  static async getUserById(req, res) {
    const { id } = req.params;

    try {
      const user = await User.findById(id).select("-password");
      res.status(200).send(user);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar usuário por ID" });
    }
  }

  // Controller method for editing a user
  static async editUser(req, res) {
    const userId = req.params.id;
    const updatedFields = req.body;
  
    try {
      // Check if the user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: `Não foi encontrado um usuário de id ${userId}` });
      }
  
      // Update the fields provided in the request body
      Object.keys(updatedFields).forEach((field) => {
        if (field !== "image") {
          user[field] = updatedFields[field];
        }
      });
  
      // Encrypt the password if provided in the updated fields
      if (updatedFields.password) {
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(updatedFields.password, salt);
        user.password = passwordHash;
      }
  
      // Handle image upload using the 'upload' middleware
      upload.single("image")(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
          // Multer error handling
          return res.status(400).json({ error: err.message });
        } else if (err) {
          // Other errors
          return res.status(400).json({ error: "Não foi possível o envio da imagem" });
        }
  
        if (req.file) {
          const imagePath = path.join("images/users", req.file.filename);
          user.image = imagePath; // Store the image path in the user object
        }
  
        // Save the updated user object to the database
        await user.save();
  
        res.json({ message: "Atualização do usuário concluída com sucesso" });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Falha ao atualizar o usuário" });
    }
  }

  static async addProductToCart(req, res) {
    try {
      const userId = req.params.id;
      const { name, price, color, size, quantity, modelIndex } = req.body;

      const user = await User.findById(userId);

      if (!user) {
        return res
          .status(404)
          .json({ error: `Não foi encontrado um usuário de id ${userId}` });
      }

      const product = {
        name,
        price,
        color,
        size,
        quantity,
        modelIndex
      };

      const purchase = {
        product,
      };

      user.cart.push(purchase);

      await user.save();

      res.json({ message: "Produto adicionado ao carrinho com sucesso" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Falha ao adicionar o produto ao carrinho" });
    }
  }

  static async finalizeCart(req, res) {
    try {
      const userId = req.params.id;
  
      const user = await User.findById(userId);
  
      if (!user) {
        return res
          .status(404)
          .json({ error: `Não foi encontrado um usuário de id ${userId}` });
      }
  
      // Transfer all products from cart to shopping list
      user.shopping.push(...user.cart);
  
      // Clear the cart
      user.cart = [];
  
      await user.save();
  
      res.json({ message: "Carrinho finalizado com sucesso" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Falha ao finalizar o carrinho" });
    }
  }

  static async printShops(req, res) {
    try {
      const users = await User.find({}).select("shopping");
      const products = [];

      users.forEach((user) => {
        user.shopping.forEach((purchase) => {
          products.push(purchase.product);
        });
      });

      res.json({ products });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Falha ao imprimir as lojas" });
    }
  }
}

module.exports = UserController;
