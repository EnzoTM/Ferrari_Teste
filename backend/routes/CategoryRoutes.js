const router = require('express').Router();
const CategoryController = require('../controllers/CategoryController');
const Category = require("../models/Category")

router.post('/AddCategory', CategoryController.addCategory);
router.get('/ShowCategories', CategoryController.getAllCategories);
router.delete("/categories/:categoryName", CategoryController.deleteCategory);


module.exports = router;
