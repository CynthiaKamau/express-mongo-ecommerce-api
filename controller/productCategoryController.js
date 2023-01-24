const ProductCategory = require("../models/productCategoryModel")
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

//create product category
const createCategory = asyncHandler(async (req, res) => {
    try {
        const category = await ProductCategory.create(req.body);
        res.json({
            msg: category,
            success: true
        })
    } catch (error) {
        throw new Error(error);
    }
})

//get all product categories
const getCategories = asyncHandler(async (req, res) => {
    try {
        const category = await ProductCategory.find();
        res.json({
            msg: category,
            success: true
        })
    } catch (error) {
        throw new Error(error)
    }
})

//get product category
const getCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const category = await ProductCategory.findById(id);
        res.json({
            msg: category,
            success: true
        })
    } catch (error) {
        
    }
})

//update product category
const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const category = await ProductCategory.findByIdAndUpdate(id, {
            title: req.body?.title
        }, { new: true});
        res.json({
            msg: category,
            success: true
        })
    } catch (error) {
        throw new Error(error);
    }
})

//delete product category
const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const category = await ProductCategory.findByIdAndDelete(id);
        res.json({
            msg: category,
            success: true
        })
    } catch (error) {
        
    }
})

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory }