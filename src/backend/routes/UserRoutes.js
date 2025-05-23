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

// Addresses routes
router.get('/addresses', verifyToken, UserController.getAddresses);
router.post('/addresses', verifyToken, UserController.addAddress);
router.put('/addresses/:addressId', verifyToken, UserController.updateAddress);
router.delete('/addresses/:addressId', verifyToken, UserController.deleteAddress);

// Payment methods routes
router.get('/payment-methods', verifyToken, UserController.getPaymentMethods);
router.post('/payment-methods', verifyToken, UserController.addPaymentMethod);
router.put('/payment-methods/:paymentId', verifyToken, UserController.updatePaymentMethod);
router.delete('/payment-methods/:paymentId', verifyToken, UserController.deletePaymentMethod);

// Cart routes
router.get('/cart', verifyToken, UserController.getCart);
router.post('/cart', verifyToken, UserController.addToCart);
router.put('/cart/:itemId', verifyToken, UserController.updateCartItem);
router.delete('/cart/:itemId', verifyToken, UserController.removeFromCart);
router.delete('/cart', verifyToken, UserController.clearCart);

// Order routes
router.get('/orders', verifyToken, UserController.getOrders);
router.get('/orders/:orderId', verifyToken, UserController.getOrderById);
router.post('/orders', verifyToken, UserController.createOrder);

// Rotas privadas - note these are now AFTER the specific routes
router.get('/:id', verifyToken, UserController.getUserById);
router.patch('/edit', verifyToken, imageUpload.single('image'), UserController.editUser);
router.put('/:id', verifyToken, UserController.editUser);
router.put('/:id/change-password', verifyToken, UserController.changePassword);

// Rotas de administrador
router.get('/', verifyToken, UserController.getAllUsers);
router.delete('/:id', verifyToken, UserController.deleteUser);

module.exports = router;