const router = require('express').Router();
const CategoryController = require('../controllers/CategoryController');

// Middlewares
const verifyToken = require('../helpers/verify-token');

// Rotas públicas
router.get('/', CategoryController.getAll);
router.get('/main', CategoryController.getMainCategories);
router.get('/:id', CategoryController.getById);
router.get('/:id/subcategories', CategoryController.getSubcategories);

// Rotas privadas (admin)
router.post('/', verifyToken, CategoryController.create);
router.patch('/:id', verifyToken, CategoryController.update);
router.delete('/:id', verifyToken, CategoryController.delete);

module.exports = router;