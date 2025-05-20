const router = require('express').Router();
const ProductController = require('../controllers/ProductController');

// Middlewares
const verifyToken = require('../helpers/verify-token');
const { imageUpload } = require('../helpers/image-upload');

// Rotas públicas
router.get('/', ProductController.getAll);
router.get('/featured', ProductController.getFeatured);
router.get('/type/:type', ProductController.getByType);
router.get('/search', ProductController.search);
router.get('/:id', ProductController.getById);

// Rotas privadas (admin)
router.post('/', verifyToken, imageUpload.array('images'), ProductController.create);
router.patch('/:id', verifyToken, imageUpload.array('images'), ProductController.update);
router.delete('/:id', verifyToken, ProductController.delete);
router.patch('/:id/remove-image', verifyToken, ProductController.removeImage);

module.exports = router;