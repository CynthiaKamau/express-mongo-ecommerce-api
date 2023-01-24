const BlogCategory = require("../models/blogCategoryModel")
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

//create blog category
const createCategory = asyncHandler(async (req, res) => {
    try {
        const category = await BlogCategory.create(req.body);
        res.json({
            msg: category,
            success: true
        })
    } catch (error) {
        throw new Error(error);
    }
})

//get all blog categories
const getCategories = asyncHandler(async (req, res) => {
    try {
        const category = await BlogCategory.find();
        res.json({
            msg: category,
            success: true
        })
    } catch (error) {
        throw new Error(error)
    }
})

//get blog category
const getCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const category = await BlogCategory.findById(id);
        res.json({
            msg: category,
            success: true
        })
    } catch (error) {
        
    }
})

//update blog category
const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const category = await BlogCategory.findByIdAndUpdate(id, {
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

//delete blog category
const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const category = await BlogCategory.findByIdAndDelete(id);
        res.json({
            msg: category,
            success: true
        })
    } catch (error) {
        
    }
})

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory }