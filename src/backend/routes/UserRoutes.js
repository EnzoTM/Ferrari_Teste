const router = require('express').Router();
const UserController = require('../controllers/UserController');

// Middlewares
const verifyToken = require('../helpers/verify-token');
const { imageUpload } = require('../helpers/image-upload');

// Rotas públicas
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/check', UserController.checkUser);
router.get('/checkuser', UserController.checkUser); // Add this line for frontend compatibility

// Rotas privadas
router.get('/:id', verifyToken, UserController.getUserById);
router.patch('/edit', verifyToken, imageUpload.single('image'), UserController.editUser);
router.patch('/address', verifyToken, UserController.updateAddress);
router.put('/:id', verifyToken, UserController.editUser);
router.put('/:id/change-password', verifyToken, UserController.changePassword);

// Rotas de administrador
router.get('/', verifyToken, UserController.getAllUsers);
router.delete('/:id', verifyToken, UserController.deleteUser);

module.exports = router;