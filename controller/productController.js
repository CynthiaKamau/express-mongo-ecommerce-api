const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");

//create product
const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
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
    //filtering
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);

    let queryString = JSON.stringify(queryObj);
    queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

    let query = Product.find(JSON.parse(queryString))

    //sorting
    if(req.query.sort) {
        const sortBy = req.query.sort.split(',').join(" ");
        query = query.sort(sortBy)
    } else {
        query = query.sort('-createdAt')
    }

    //limiting the fields
    if(req.query.fields) {
        const fields = req.query.fields.split(',').join(" ");
        query = query.select(fields)
    } else {
        query = query.select('-__v')
    }

    //pagination
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page -1 ) * limit;
    query = query.skip(skip).limit(limit);
    if(req.query.page) {
        const productCount = await Product.countDocuments()
        if(skip >= productCount) {
            throw new Error('This page does not exist')
        }
    }

    const products = await query;
    res.json({
      msg: products,
      success: true,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//get a product
const getProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (product) {
      res.json({
        msg: product,
        success: true,
      });
    } else {
      throw new Error("Product with the specified id does not exist");
    }
  } catch (error) {
    throw new Error(error);
  }
});

//update product
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (product) {
      if (req.body.title) {
        req.body.slug = slugify(req.body.title);
      }
      const updateProduct = await Product.findOneAndUpdate({ id }, req.body, {
        new: true,
      });
      res.json({
        msg: updateProduct,
        success: true,
      });
    } else {
      throw new Error("Product with id does not exist");
    }
  } catch (error) {
    throw new Error(error);
  }
});

//delete product
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (product) {
      if (req.body.title) {
        req.body.slug = slugify(req.body.title);
      }
      const deleteProduct = await Product.findByIdAndDelete(id);
      res.json({
        msg: deleteProduct,
        success: true,
      });
    } else {
      throw new Error("Product with id does not exist");
    }
  } catch (error) {
    throw new Error(error);
  }
});


module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
