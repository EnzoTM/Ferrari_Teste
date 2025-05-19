const mongoose = require("../db/conn");
const Product = require("../models/Product");
const { upload } = require("../imguploadconfig/multer.js");

module.exports = class ProductController {
  static async addProduct(req, res) {
    const { name, tags, gender, price, images, description } = req.body;

    try {
      if (!name) {
        throw new Error("O produto necessita ser nomeado");
      }

      const existingProduct = await Product.findOne({ name });
      if (existingProduct) {
        throw new Error("Já existe um produto com o mesmo nome");
      }

      if (!tags || tags.length === 0) {
        throw new Error(
          "O produto necessita estar associado a pelo menos uma categoria"
        );
      }

      if (!["Masculino", "Feminino", "Unissex"].includes(gender)) {
        throw new Error(
          "O produto necessita ser classificado em um gênero válido"
        );
      }

      if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        throw new Error("O produto necessita ter um preço qualquer positivo");
      }

      if (!description) {
        throw new Error("O produto precisa ter uma descrição!");
      }

      const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name,
        tags,
        gender,
        price,
        images,
        description,
        AvailableModels: [],
      });

      await product.save();

      res.status(200).json({ message: "Produto adicionado com sucesso" });
    } catch (error) {
      res.status(422).json({ message: error.message });
    }
  }

  static async setImages(req, res) {
    const productId = req.params.productId;

    try {
      const product = await Product.findById(productId);

      if (!product) {
        return res
          .status(404)
          .json({ error: `Um produto de id ${productId} não foi encontrado` });
      }

      upload.array("images")(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ error: err.message });
        } else if (err) {
          return res.status(500).json({ error: "Houve uma falha no envio" });
        }

        const images = req.files.map((file) => file.filename);
        product.images = images;

        await product.save();

        return res.status(200).json({ message: "Envio concluído com sucesso" });
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async addModel(req, res) {
    const { productId, size, color, quantity } = req.body;

    try {
      const product = await Product.findById(productId);

      if (!product) {
        throw new Error("Produto não encontrado");
      }

      const validSizes = ["PP", "P", "M", "G", "XG"];
      if (!validSizes.includes(size)) {
        throw new Error("Tamanho inválido");
      }

      const validColors = [
        "AliceBlue",
        "AntiqueWhite",
        "Aqua",
        "Aquamarine",
        "Azure",
        "Beige",
        "Bisque",
        "Black",
        "BlanchedAlmond",
        "Blue",
        "BlueViolet",
        "Brown",
        "BurlyWood",
        "CadetBlue",
        "Chartreuse",
        "Chocolate",
        "Coral",
        "CornflowerBlue",
        "Cornsilk",
        "Crimson",
        "Cyan",
        "DarkBlue",
        "DarkCyan",
        "DarkGoldenRod",
        "DarkGray",
        "DarkGrey",
        "DarkGreen",
        "DarkKhaki",
        "DarkMagenta",
        "DarkOliveGreen",
        "DarkOrange",
        "DarkOrchid",
        "DarkRed",
        "DarkSalmon",
        "DarkSeaGreen",
        "DarkSlateBlue",
        "DarkSlateGray",
        "DarkSlateGrey",
        "DarkTurquoise",
        "DarkViolet",
        "DeepPink",
        "DeepSkyBlue",
        "DimGray",
        "DimGrey",
        "DodgerBlue",
        "FireBrick",
        "FloralWhite",
        "ForestGreen",
        "Fuchsia",
        "Gainsboro",
        "GhostWhite",
        "Gold",
        "GoldenRod",
        "Gray",
        "Grey",
        "Green",
        "GreenYellow",
        "HoneyDew",
        "HotPink",
        "IndianRed",
        "Indigo",
        "Ivory",
        "Khaki",
        "Lavender",
        "LavenderBlush",
        "LawnGreen",
        "LemonChiffon",
        "LightBlue",
        "LightCoral",
        "LightCyan",
        "LightGoldenRodYellow",
        "LightGray",
        "LightGrey",
        "LightGreen",
        "LightPink",
        "LightSalmon",
        "LightSeaGreen",
        "LightSkyBlue",
        "LightSlateGray",
        "LightSlateGrey",
        "LightSteelBlue",
        "LightYellow",
        "Lime",
        "LimeGreen",
        "Linen",
        "Magenta",
        "Maroon",
        "MediumAquaMarine",
        "MediumBlue",
        "MediumOrchid",
        "MediumPurple",
        "MediumSeaGreen",
        "MediumSlateBlue",
        "MediumSpringGreen",
        "MediumTurquoise",
        "MediumVioletRed",
        "MidnightBlue",
        "MintCream",
        "MistyRose",
        "Moccasin",
        "NavajoWhite",
        "Navy",
        "OldLace",
        "Olive",
        "OliveDrab",
        "Orange",
        "OrangeRed",
        "Orchid",
        "PaleGoldenRod",
        "PaleGreen",
        "PaleTurquoise",
        "PaleVioletRed",
        "PapayaWhip",
        "PeachPuff",
        "Peru",
        "Pink",
        "Plum",
        "PowderBlue",
        "Purple",
        "RebeccaPurple",
        "Red",
        "RosyBrown",
        "RoyalBlue",
        "SaddleBrown",
        "Salmon",
        "SandyBrown",
        "SeaGreen",
        "SeaShell",
        "Sienna",
        "Silver",
        "SkyBlue",
        "SlateBlue",
        "SlateGray",
        "SlateGrey",
        "Snow",
        "SpringGreen",
        "SteelBlue",
        "Tan",
        "Teal",
        "Thistle",
        "Tomato",
        "Turquoise",
        "Violet",
        "Wheat",
        "White",
        "WhiteSmoke",
        "Yellow",
        "YellowGreen",
      ];

      if (!validColors.includes(color)) {
        throw new Error("A cor fornecida é inválida");
      }

      const existingModel = product.AvailableModels.find(
        (model) => model.size === size && model.color === color
      );
      if (existingModel) {
        throw new Error(
          "Já existe um modelo de mesmo tamanho e cor para este produto"
        );
      }

      const parsedQuantity = parseInt(quantity);
      if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
        throw new Error("Quantidade inválida");
      }

      const newModel = {
        _id: new mongoose.Types.ObjectId(),
        size,
        color,
        quantity: parsedQuantity,
      };

      product.AvailableModels.push(newModel);

      await product.save();

      res.status(200).json({ message: "Modelo adicionado com sucesso" });
    } catch (error) {
      res.status(422).json({ message: error.message });
    }
  }

  static async getProducts(req, res) {
    try {
      const products = await Product.find();

      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar os produtos" });
    }
  }

  static async getProductById(req, res) {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          message: `O produto de id ${req.params.id} não foi encontrado.`,
        });
      }

      return res.status(200).json(product);
    } catch (error) {
      return res.status(500).json({
        message: "Não foi possível recuperar os produtos",
        error: error.message,
      });
    }
  }

  static async getProductByName(req, res) {
    try {
      const { name } = req.params;

      // Search the products database for a product with a matching name
      const product = await Product.findOne({ name });

      if (!product) {
        return res.status(404).json({ error: "Produto não encontrado" });
      }

      return res.json(product);
    } catch (error) {
      console.error("Error retrieving product:", error);
      return res.status(500).json({ error: "Falha ao recuperar o produto" });
    }
  }

  static async getModels(req, res) {
    try {
      const product = await Product.findById(req.params.productId);

      if (!(product && product.AvailableModels)) {
        return res.status(404).json({
          message: `Modelos para o produto de id ${req.params.id} não foram encontrados`,
        });
      }
      return res.status(200).json(product.AvailableModels);
    } catch (error) {
      return res.status(500).json({
        message: "Não foi possível recuperar os modelos",
        error: error.message,
      });
    }
  }

  static async getModelByIds(req, res) {
    try {
      const product = await Product.findById(req.params.productId);

      if (!product) {
        return res.status(404).json({
          message: `O produto de id ${req.params.productId} não foi encontrado`,
        });
      }

      const model = product.AvailableModels.id(req.params.modelId);

      if (!model) {
        return res.status(404).json({
          message: `O modelo de id ${req.params.modelId} não foi encontrado`,
        });
      }

      return res.status(200).json(model);
    } catch (error) {
      return res.status(500).json({
        message: "Não foi possível recuperar o modelo",
        error: error.message,
      });
    }
  }

  static async dropProducts(req, res) {
    try {
      await Product.deleteMany();

      res.status(200).json({
        message: "Todos os produtos, se algum, foram apagados com sucesso",
      });
    } catch (error) {
      res.status(500).json({ error: "Não foi possível apagar os produtos" });
    }
  }

  static async dropModels(req, res) {
    try {
      const product = await Product.findById(req.params.productId);

      if (!product) {
        return res.status(404).json({
          message: `O produto de id ${req.params.modelId} não foi encontrado`,
        });
      }

      product.AvailableModels = [];

      await product.save();

      return res.status(200).json({
        message: `Todos os modelos, se algum, do produto ${req.params.productId} foram apagados`,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Não foi possível apagar os modelos",
        error: error.message,
      });
    }
  }

  static async removeProduct(req, res) {
    try {
      const productId = req.params.productId;

      const product = await Product.findByIdAndDelete(productId);

      if (!product) {
        return res.status(404).json({
          message: `O produto de id ${req.params.modelId} não foi encontrado`,
        });
      }

      return res
        .status(200)
        .json({ message: "Produto removido com sucesso", product });
    } catch (error) {
      return res.status(500).json({
        message: "Não foi possível apagar o produto",
        error: error.message,
      });
    }
  }

  static async removeModel(req, res) {
    try {
      const productId = req.params.productId;
      const product = await Product.findById(productId);

      if (!product) {
        return res
          .status(404)
          .json({ message: `O produto de id ${productId} não foi encontrado` });
      }

      const modelId = req.params.modelId;

      const modelIndex = product.AvailableModels.findIndex(
        (model) => model._id.toString() === modelId
      );

      if (modelIndex === -1) {
        return res
          .status(404)
          .json({ message: `O modelo de id ${modelId} não foi encontrado` });
      }

      product.AvailableModels.splice(modelIndex, 1);

      await product.save();

      return res.status(200).json({
        message: `O Modelo de id ${modelId} foi removido com sucesso`,
        product,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Não foi possível apagar o modelo",
        error: error.message,
      });
    }
  }

  // static async updateProduct(req, res) {
  //   const { productId } = req.params;
  //   const updates = req.body;

  //   try {
  //     const product = await Product.findById(productId);
  //     if (!product) {
  //       return res
  //         .status(404)
  //         .json({ message: `O produto de id ${productId} não foi encontrado` });
  //     }

  //     const existingKeys = Object.keys(product.toObject());
  //     const updateKeys = Object.keys(updates);
  //     const invalidKeys = updateKeys.filter(
  //       (key) => !existingKeys.includes(key)
  //     );

  //     if (invalidKeys.length > 0) {
  //       return res.status(400).json({
  //         message: `As seguintes chaves são inválidas e serão ignoradas: ${invalidKeys.join(
  //           ", "
  //         )}`,
  //       });
  //     }

  //     Object.keys(updates).forEach((key) => {
  //       product[key] = updates[key];
  //     });

  //     await product.save();

  //     return res
  //       .status(200)
  //       .json({ message: "Produto atualizado com sucesso", product });
  //   } catch (error) {
  //     return res.status(500).json({
  //       message: "Não foi possível atualizar o produto",
  //       error: error.message,
  //     });
  //   }
  // }

  static async updateProductModel(req, res) {
    const { productId, modelIndex, newQuantity } = req.body;

    try {
      const product = await Product.findById(productId);

      if (!product) {
        return res
          .status(404)
          .json({ message: `O produto de id ${productId} não foi encontrado` });
      }

      if (modelIndex < 0 || modelIndex >= product.AvailableModels.length) {
        return res.status(400).json({ message: "Índice de modelo inválido" });
      }

      const model = product.AvailableModels[modelIndex];
      model.quantity -= newQuantity;
      console.log(model);

      await product.save();

      return res
        .status(200)
        .json({ message: "Modelo de produto atualizado com sucesso", product });
    } catch (error) {
      return res.status(500).json({
        message: "Não foi possível atualizar o modelo do produto",

        error: error.message,
      });
    }
  }

  static async getAllProducts(req, res) {
    try {
      const products = await Product.find();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar os produtos" });
    }
  }

  static async getPopularProducts(req, res) {
    try {
      const products = await Product.find({ popular: true });
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar os produtos populares" });
    }
  }

  static async getRecentProducts(req, res) {
    try {
      const products = await Product.find().sort({ createdAt: -1 }).limit(10);
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar os produtos recentes" });
    }
  }

  static async filterProducts(req, res) {
    try {
      const { name } = req.body;
      let products = [];

      if (name) {
        products = await Product.find({
          name: { $regex: name, $options: "i" },
        });
      } else {
        products = await Product.find();
      }

      res.status(200).json(products);
    } catch (error) {
      console.error("Erro ao filtrar os produtos:", error);
      res.status(500).json({ message: "Erro ao filtrar os produtos" });
    }
  }

  static async CreateProductModel(req, res) {
    const { productId, size, color, quantity } = req.body;

    try {
      const product = await Product.findById(productId);

      if (!product) {
        throw new Error("Produto não encontrado");
      }

      const existingModel = product.AvailableModels.find(
        (model) => model.size === size && model.color === color
      );

      if (existingModel) {
        throw new Error(
          "Já existe um modelo com o mesmo tamanho e cor para este produto"
        );
      }

      const parsedQuantity = parseInt(quantity);

      if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
        throw new Error("Quantidade inválida");
      }

      const newModel = {
        size,
        color,
        quantity: parsedQuantity,
      };

      product.AvailableModels.push(newModel);

      await product.save();

      res.status(200).json({ message: "Modelo adicionado com sucesso" });
    } catch (error) {
      res.status(422).json({ message: error.message });
    }
  }

  static async getProductModels(req, res) {
    const { productId } = req.params;

    try {
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          message: `O produto de id ${productId} não foi encontrado`,
        });
      }

      const models = product.AvailableModels;

      res.status(200).json(models);
    } catch (error) {
      res.status(500).json({
        message: "Não foi possível recuperar os modelos do produto",
        error: error.message,
      });
    }
  }

  static async deleteProductModel(req, res) {
    const { productId, modelIndex } = req.params;

    try {
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          message: `O produto de id ${productId} não foi encontrado`,
        });
      }

      if (modelIndex < 0 || modelIndex >= product.AvailableModels.length) {
        return res.status(400).json({ message: "Índice de modelo inválido" });
      }

      product.AvailableModels.splice(modelIndex, 1);
      await product.save();

      res.status(200).json({
        message: `O modelo de índice ${modelIndex} foi removido com sucesso`,
      });
    } catch (error) {
      res.status(500).json({
        message: "Não foi possível remover o modelo do produto",
        error: error.message,
      });
    }
  }

  static async updateProduct(req, res) {
    const { productId } = req.params;
    const updates = req.body;

    try {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          message: `O produto de id ${productId} não foi encontrado`,
        });
      }

      const existingKeys = Object.keys(product.toObject());
      const updateKeys = Object.keys(updates);
      const invalidKeys = updateKeys.filter(
        (key) => !existingKeys.includes(key)
      );

      if (invalidKeys.length > 0) {
        return res.status(400).json({
          message: `As seguintes chaves são inválidas e serão ignoradas: ${invalidKeys.join(
            ", "
          )}`,
        });
      }

      Object.keys(updates).forEach((key) => {
        product[key] = updates[key];
      });

      await product.save();

      return res
        .status(200)
        .json({ message: "Produto atualizado com sucesso", product });
    } catch (error) {
      return res.status(500).json({
        message: "Não foi possível atualizar o produto, verifique se preencheu todo formulário!",
        error: error.message,
      });
    }
  }
};
