const Brand = require("../models/brandModel")
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

//create brand
const createBrand = asyncHandler(async (req, res) => {
    try {
        const brand = await Brand.create(req.body);
        res.json({
            msg: brand,
            success: true
        })
    } catch (error) {
        throw new Error(error);
    }
})

//get all brands
const getBrands = asyncHandler(async (req, res) => {
    try {
        const brands = await Brand.find();
        res.json({
            msg: brands,
            success: true
        })
    } catch (error) {
        throw new Error(error)
    }
})

//get Brand
const getBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const brand = await Brand.findById(id);
        res.json({
            msg: brand,
            success: true
        })
    } catch (error) {
        
    }
})

//update brand
const updateBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const brand = await Brand.findByIdAndUpdate(id, {
            title: req.body?.title
        }, { new: true});
        res.json({
            msg: brand,
            success: true
        })
    } catch (error) {
        throw new Error(error);
    }
})

//delete brand
const deleteBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const brand = await Brand.findByIdAndDelete(id);
        res.json({
            msg: brand,
            success: true
        })
    } catch (error) {
        
    }
})

module.exports = { getBrand, getBrands, createBrand, updateBrand, deleteBrand }