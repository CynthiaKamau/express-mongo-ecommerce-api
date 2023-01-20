const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");

//create product
const createProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.create(req.body);
    product.save();
    res.json({
      msg: product,
      success: true,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// get all products
const getProducts = asyncHandler(async (req, res) => {
    try {
        const products = await Product.find();
        res.json({
            msg: products,
            success: true
        })
    } catch (error) {
        throw new Error(error)
    }
})

//get a product
const getProduct = asyncHandler(async(req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if(product) {
            res.json({
                msg: product,
                success: true
            })
        } else {
            throw new Error('Product with the specified id does not exist')
        }
    } catch (error) {
        throw new Error(error)
    }
})

module.exports = { createProduct, getProducts, getProduct };
