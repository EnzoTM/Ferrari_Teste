const Category = require('../models/Category');
const mongoose = require('mongoose');
const getToken = require('../helpers/get-token');
const getUserByToken = require('../helpers/get-user-by-token');

module.exports = class CategoryController {
  // Criar uma nova categoria
  static async create(req, res) {
    try {
      const token = getToken(req);
      const user = await getUserByToken(token);

      if (!user || !user.admin) {
        return res.status(401).json({ message: 'Acesso negado' });
      }

      const { name, description, parent } = req.body;

      // Validações
      if (!name) {
        return res.status(422).json({ message: 'O nome é obrigatório' });
      }

      // Verificar se o nome já existe
      const categoryExists = await Category.findOne({ name });
      if (categoryExists) {
        return res.status(422).json({ message: 'Já existe uma categoria com este nome' });
      }

      // Verificar se a categoria pai existe
      if (parent) {
        const parentExists = await Category.findById(parent);
        if (!parentExists) {
          return res.status(422).json({ message: 'Categoria pai não encontrada' });
        }
      }

      // Criar a categoria
      const category = new Category({
        name,
        description,
        parent
      });

      await category.save();
      res.status(201).json({ 
        message: 'Categoria criada com sucesso', 
        category 
      });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Obter todas as categorias
  static async getAll(req, res) {
    try {
      const categories = await Category.find().sort('name').populate('parent');
      res.status(200).json({ categories });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Obter categorias principais (sem pai)
  static async getMainCategories(req, res) {
    try {
      const categories = await Category.find({ parent: null }).sort('name');
      res.status(200).json({ categories });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Obter categoria por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(422).json({ message: 'ID inválido' });
      }

      const category = await Category.findById(id).populate('parent');
      
      if (!category) {
        return res.status(404).json({ message: 'Categoria não encontrada' });
      }

      res.status(200).json({ category });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Obter subcategorias
  static async getSubcategories(req, res) {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(422).json({ message: 'ID inválido' });
      }

      const subcategories = await Category.find({ parent: id }).sort('name');
      res.status(200).json({ subcategories });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Atualizar categoria
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

      const category = await Category.findById(id);
      
      if (!category) {
        return res.status(404).json({ message: 'Categoria não encontrada' });
      }

      const { name, description, parent } = req.body;

      // Validações e atualizações
      if (name && name !== category.name) {
        const nameExists = await Category.findOne({ name, _id: { $ne: id } });
        if (nameExists) {
          return res.status(422).json({ message: 'Já existe uma categoria com este nome' });
        }
        category.name = name;
      }

      if (description !== undefined) {
        category.description = description;
      }

      // Validar categoria pai
      if (parent !== undefined) {
        if (parent === null) {
          category.parent = null;
        } else if (parent) {
          // Verificar se a categoria pai existe
          const parentExists = await Category.findById(parent);
          if (!parentExists) {
            return res.status(422).json({ message: 'Categoria pai não encontrada' });
          }
          
          // Verificar se não está tentando definir a si mesma como pai
          if (parent === id) {
            return res.status(422).json({ message: 'Uma categoria não pode ser pai de si mesma' });
          }
          
          // Verificar ciclos na hierarquia
          let current = parent;
          while (current) {
            const currentCategory = await Category.findById(current);
            if (!currentCategory) break;
            
            if (currentCategory.parent && currentCategory.parent.toString() === id) {
              return res.status(422).json({ message: 'Esta operação criaria um ciclo na hierarquia de categorias' });
            }
            
            current = currentCategory.parent;
          }
          
          category.parent = parent;
        }
      }

      await category.save();
      res.status(200).json({ message: 'Categoria atualizada com sucesso', category });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Excluir categoria
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

      const category = await Category.findById(id);
      
      if (!category) {
        return res.status(404).json({ message: 'Categoria não encontrada' });
      }

      // Verificar se existem subcategorias
      const subcategories = await Category.find({ parent: id });
      if (subcategories.length > 0) {
        return res.status(422).json({ 
          message: 'Esta categoria possui subcategorias. Remova-as primeiro ou atualize-as para outra categoria pai.' 
        });
      }

      // Verificar se há produtos nesta categoria
      const Product = require('../models/Product');
      const products = await Product.find({ category: id });
      if (products.length > 0) {
        return res.status(422).json({ 
          message: 'Esta categoria possui produtos associados. Remova-os ou atualize-os para outra categoria.' 
        });
      }

      await Category.findByIdAndDelete(id);
      res.status(200).json({ message: 'Categoria removida com sucesso' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};