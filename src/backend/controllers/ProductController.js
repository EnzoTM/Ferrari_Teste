const Product = require('../models/Product');
const mongoose = require('mongoose');
const getToken = require('../helpers/get-token');
const getUserByToken = require('../helpers/get-user-by-token');
const fs = require('fs');
const path = require('path');

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
        type, 
        featured = false,
        stock = 0,
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
      if (!type) {
        return res.status(422).json({ message: 'O tipo é obrigatório' });
      }
      
      if (!['car', 'helmet', 'formula1'].includes(type)) {
        return res.status(422).json({ message: 'Tipo de produto inválido' });
      }

      // Verificar se o nome já existe
      const productExists = await Product.findOne({ name });
      if (productExists) {
        return res.status(422).json({ message: 'Já existe um produto com este nome' });
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
        type,
        images,
        featured,
        stock,
        sold: 0,
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
      const products = await Product.find().sort('-createdAt');
      res.status(200).json({ products });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Obter produtos em destaque
  static async getFeatured(req, res) {
    try {
      const products = await Product.find({ featured: true }).sort('-createdAt');
      res.status(200).json({ products });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Obter produtos por tipo
  static async getByType(req, res) {
    try {
      const { type } = req.params;
      
      if (!['car', 'helmet', 'formula1'].includes(type)) {
        return res.status(422).json({ message: 'Tipo de produto inválido' });
      }

      const products = await Product.find({ type }).sort('-createdAt');
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

      const product = await Product.findById(id);
      
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
          { description: { $regex: q, $options: 'i' } }
        ]
      }).sort('-createdAt');

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
        type, 
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

      if (price !== undefined) product.price = price;
      if (description) product.description = description;
      if (type) {
        if (!['car', 'helmet', 'formula1'].includes(type)) {
          return res.status(422).json({ message: 'Tipo de produto inválido' });
        }
        product.type = type;
      }
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

      // Remover imagem do array
      product.images = product.images.filter(image => image !== filename);

      // Verificar se ainda há pelo menos uma imagem
      if (product.images.length === 0) {
        return res.status(422).json({ message: 'O produto deve ter pelo menos uma imagem' });
      }

      // Salvar produto
      await product.save();

      // Attempt to remove the file from the filesystem
      try {
        const imagePath = path.join(__dirname, '../../public/images/products', filename);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (error) {
        console.error('Error removing image file:', error);
        // Continue execution even if file removal fails
      }

      res.status(200).json({ message: 'Imagem removida com sucesso', product });
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

      // Delete the product
      await Product.findByIdAndDelete(id);

      // Attempt to remove the product images from the filesystem
      try {
        for (const filename of product.images) {
          const imagePath = path.join(__dirname, '../../public/images/products', filename);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
      } catch (error) {
        console.error('Error removing image files:', error);
        // Continue execution even if file removal fails
      }

      res.status(200).json({ message: 'Produto removido com sucesso' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};