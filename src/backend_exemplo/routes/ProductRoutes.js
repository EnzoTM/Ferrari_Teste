const router = require('express').Router()

const ProductController = require('../controllers/ProductController')

router.delete('/dropProducts', ProductController.dropProducts)
router.delete('/removeModel/:modelId', ProductController.removeModel)
router.delete('/removeProduct/:productId', ProductController.removeProduct)
router.get('/getModelById/:modelId', ProductController.getModelByIds)
router.get('/getModels/:productId', ProductController.getModels)
router.get('/getProductById/:id', ProductController.getProductById)
router.get('/getProductByName/:name', ProductController.getProductByName)
router.get('/getProducts', ProductController.getProducts)
router.patch('/dropModels/:productId', ProductController.dropModels)
router.patch('/setImages/:productId', ProductController.setImages)
router.patch('/updateProduct/:productId', ProductController.updateProduct)
router.post('/addModel', ProductController.addModel)
router.post('/addProduct', ProductController.addProduct)
router.patch('/updateProductModel', ProductController.updateProductModel);
router.get('/getPopularProducts', ProductController.getPopularProducts);
router.get('/getRecentProducts', ProductController.getRecentProducts);
router.post('/filterProducts', ProductController.filterProducts);

router.post('/createProductModel', ProductController.CreateProductModel);
router.get('/getProductModels/:productId', ProductController.getProductModels);
router.delete('/deleteProductModel/:productId/:modelIndex', ProductController.deleteProductModel);

router.patch('/updateProduct/:productId', ProductController.updateProduct);

module.exports = router
