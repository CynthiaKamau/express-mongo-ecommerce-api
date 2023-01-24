const express = require('express');
const { getCategories, getCategory, createCategory, updateCategory, deleteCategory } = require('../controller/productCategoryController');
const { isAdmin, authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategory);
router.post('/', authMiddleware, isAdmin, createCategory);
router.put('/:id', authMiddleware, isAdmin, updateCategory)
router.delete('/:id', authMiddleware, isAdmin, deleteCategory)
module.exports = router;