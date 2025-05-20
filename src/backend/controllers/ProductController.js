const Product = require('../models/Product');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const getToken = require('../helpers/get-token');
const getUserByToken = require('../helpers/get-user-by-token');

module.exports = class ProductController {
  // Criar um novo produto
  static async create(req, res) {
    try {
      const token = getToken(req);
      const user = await getUserByToken(token);

      if (!user || !user.admin) {
        return res.status(401).json({ message: 'Acesso negado' });
      }

      const { 
        name, 
        price, 
        description, 
        category, 
        type, 
        tags = [], 
        specifications = {}, 
        featured = false,
        stock = 0
      } = req.body;

      // Validações
      if (!name) {
        return res.status(422).json({ message: 'O nome é obrigatório' });
      }
      if (!price) {
        return res.status(422).json({ message: 'O preço é obrigatório' });
      }
      if (!description) {
        return res.status(422).json({ message: 'A descrição é obrigatória' });
      }
      if (!category) {
        return res.status(422).json({ message: 'A categoria é obrigatória' });
      }
      if (!type) {
        return res.status(422).json({ message: 'O tipo é obrigatório' });
      }

      // Verificar se o nome já existe
      const productExists = await Product.findOne({ name });
      if (productExists) {
        return res.status(422).json({ message: 'Já existe um produto com este nome' });
      }

      // Verificar se a categoria existe
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(422).json({ message: 'Categoria não encontrada' });
      }

      // Obter imagens do produto
      let images = [];
      if (req.files) {
        images = req.files.map(file => file.filename);
      }

      if (images.length === 0) {
        return res.status(422).json({ message: 'As imagens são obrigatórias' });
      }

      // Criar o produto
      const product = new Product({
        name,
        price,
        description,
        category,
        type,
        tags,
        images,
        specifications,
        featured,
        stock
      });

      await product.save();
      res.status(201).json({ 
        message: 'Produto criado com sucesso', 
        product 
      });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Obter todos os produtos
  static async getAll(req, res) {
    try {
      const products = await Product.find().sort('-createdAt').populate('category');
      res.status(200).json({ products });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Obter produtos em destaque
  static async getFeatured(req, res) {
    try {
      const products = await Product.find({ featured: true }).sort('-createdAt').populate('category');
      res.status(200).json({ products });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Obter produtos por tipo
  static async getByType(req, res) {
    try {
      const { type } = req.params;
      
      if (!['car', 'helmet', 'merchandise', 'formula1'].includes(type)) {
        return res.status(422).json({ message: 'Tipo de produto inválido' });
      }

      const products = await Product.find({ type }).sort('-createdAt').populate('category');
      res.status(200).json({ products });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Obter produtos por categoria
  static async getByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(422).json({ message: 'ID de categoria inválido' });
      }

      const products = await Product.find({ category: categoryId }).sort('-createdAt').populate('category');
      res.status(200).json({ products });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Obter produto por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(422).json({ message: 'ID inválido' });
      }

      const product = await Product.findById(id).populate('category');
      
      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }

      res.status(200).json({ product });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Buscar produtos
  static async search(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(422).json({ message: 'Termo de busca não informado' });
      }

      const products = await Product.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { tags: { $in: [new RegExp(q, 'i')] } }
        ]
      }).sort('-createdAt').populate('category');

      res.status(200).json({ products });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Atualizar produto
  static async update(req, res) {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(422).json({ message: 'ID inválido' });
      }

      const token = getToken(req);
      const user = await getUserByToken(token);

      if (!user || !user.admin) {
        return res.status(401).json({ message: 'Acesso negado' });
      }

      const product = await Product.findById(id);
      
      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }

      const { 
        name, 
        price, 
        description, 
        category, 
        type, 
        tags, 
        specifications,
        featured,
        stock
      } = req.body;

      // Atualizar campos se fornecidos
      if (name && name !== product.name) {
        const nameExists = await Product.findOne({ name, _id: { $ne: id } });
        if (nameExists) {
          return res.status(422).json({ message: 'Já existe um produto com este nome' });
        }
        product.name = name;
      }

      if (price) product.price = price;
      if (description) product.description = description;
      
      if (category) {
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
          return res.status(422).json({ message: 'Categoria não encontrada' });
        }
        product.category = category;
      }
      
      if (type) product.type = type;
      if (tags) product.tags = tags;
      if (specifications) product.specifications = specifications;
      if (featured !== undefined) product.featured = featured;
      if (stock !== undefined) product.stock = stock;

      // Adicionar novas imagens se enviadas
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => file.filename);
        product.images = [...product.images, ...newImages];
      }

      await product.save();
      res.status(200).json({ message: 'Produto atualizado com sucesso', product });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Remover imagem do produto
  static async removeImage(req, res) {
    try {
      const { id } = req.params;
      const { filename } = req.body;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(422).json({ message: 'ID inválido' });
      }

      if (!filename) {
        return res.status(422).json({ message: 'Nome do arquivo não informado' });
      }

      const token = getToken(req);
      const user = await getUserByToken(token);

      if (!user || !user.admin) {
        return res.status(401).json({ message: 'Acesso negado' });
      }

      const product = await Product.findById(id);
      
      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }

      // Verificar se a imagem existe
      if (!product.images.includes(filename)) {
        return res.status(404).json({ message: 'Imagem não encontrada' });
      }

      // Remover imagem
      product.images = product.images.filter(image => image !== filename);

      // Salvar produto
      await product.save();

      res.status(200).json({ message: 'Imagem removida com sucesso', product });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Adicionar modelo ao produto
  static async addModel(req, res) {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(422).json({ message: 'ID inválido' });
      }

      const token = getToken(req);
      const user = await getUserByToken(token);

      if (!user || !user.admin) {
        return res.status(401).json({ message: 'Acesso negado' });
      }

      const product = await Product.findById(id);
      
      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }

      const { size, color, quantity } = req.body;

      if (!size) {
        return res.status(422).json({ message: 'O tamanho é obrigatório' });
      }
      if (!color) {
        return res.status(422).json({ message: 'A cor é obrigatória' });
      }
      if (!quantity) {
        return res.status(422).json({ message: 'A quantidade é obrigatória' });
      }

      // Verificar se o modelo já existe
      const modelExists = product.availableModels.find(
        model => model.size === size && model.color === color
      );

      if (modelExists) {
        return res.status(422).json({ message: 'Este modelo já existe para o produto' });
      }

      // Adicionar novo modelo
      const newModel = {
        _id: new mongoose.Types.ObjectId(),
        size,
        color,
        quantity
      };

      product.availableModels.push(newModel);

      // Atualizar estoque total
      product.stock = product.availableModels.reduce((total, model) => total + model.quantity, 0);

      await product.save();
      res.status(200).json({ message: 'Modelo adicionado com sucesso', product });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Remover modelo do produto
  static async removeModel(req, res) {
    try {
      const { id, modelId } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(modelId)) {
        return res.status(422).json({ message: 'ID inválido' });
      }

      const token = getToken(req);
      const user = await getUserByToken(token);

      if (!user || !user.admin) {
        return res.status(401).json({ message: 'Acesso negado' });
      }

      const product = await Product.findById(id);
      
      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }

      // Verificar se o modelo existe
      const modelExists = product.availableModels.find(
        model => model._id.toString() === modelId
      );

      if (!modelExists) {
        return res.status(404).json({ message: 'Modelo não encontrado' });
      }

      // Remover modelo
      product.availableModels = product.availableModels.filter(
        model => model._id.toString() !== modelId
      );

      // Atualizar estoque total
      product.stock = product.availableModels.reduce((total, model) => total + model.quantity, 0);

      await product.save();
      res.status(200).json({ message: 'Modelo removido com sucesso', product });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Excluir produto
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(422).json({ message: 'ID inválido' });
      }

      const token = getToken(req);
      const user = await getUserByToken(token);

      if (!user || !user.admin) {
        return res.status(401).json({ message: 'Acesso negado' });
      }

      const product = await Product.findById(id);
      
      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }

      await Product.findByIdAndDelete(id);
      res.status(200).json({ message: 'Produto removido com sucesso' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};