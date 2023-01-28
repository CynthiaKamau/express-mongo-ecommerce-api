const Product = require("../models/productModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const validateMongoDbId = require("../utils/validateMongodbId");
const cloudinaryUploading = require("../utils/cloudinary");
const fs = require("fs")

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
    queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryString));

    //sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    //limiting the fields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    //pagination
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) {
        throw new Error("This page does not exist");
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

//add to wishlist
const addToWishlist = asyncHandler(async (req, res) => {
  // get currently logged in user
  const { _id } = req.user;
  // get produt id to be added to wishlist
  const { productId } = req.body;
  try {
    const loggedInUser = await User.findById(_id);
    // find if user has product id in their wishlist
    const alreadyAdded = loggedInUser.wishlist.find(
      (id) => id.toString() === productId
    );
    if (alreadyAdded) {
      //if already added, find it and update it
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $pull: { wishlist: productId },
        },
        { new: true }
      );
      res.json({
        msg: user,
        success: true,
      });
    } else {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $push: { wishlist: productId },
        },
        { new: true }
      );
      res.json({
        msg: user,
        success: true,
      });
    }
  } catch (error) {
    throw new Error(error);
  }
});

// get rating
const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, productId, comment } = req.body;
  try {
    const product = await Product.findById(productId);
    let alreadyRated = product.ratings.find(
      (userId) => userId.postedby.toString() === _id.toString()
    );
    if (alreadyRated) {
      const updatingRating = await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        {
          $set: { "ratings.$.star": star, "ratings.$.comment": comment },
        },
        { new: true }
      );
    } else {
      const rateProduct = await Product.findByIdAndUpdate(
        productId,
        {
          $push: {
            ratings: {
              star: star,
              comment: comment,
              postedby: _id,
            },
          },
        },
        { new: true }
      );
    }
    const getAllRatings = await Product.findById(productId);
    let totalRating = getAllRatings.ratings.length;
    let ratingSum = getAllRatings.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev+curr, 0);
    let actualRating = Math.round(ratingSum / totalRating);
    let finalProduct = await Product.findByIdAndUpdate(
      productId,
      {
        totalrating: actualRating,
      },
      { new: true }
    );
    res.json({
      msg: finalProduct,
      success: true,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// upload image
const uploadImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id)
  try {
    const uploader = (path) => cloudinaryUploading(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path)
      urls.push(newPath)
      fs.unlinkSync(path)
    }
    const findProduct = await Product.findByIdAndUpdate(id, {
      images: urls.map((file) => {
        return file;
      }), 
    }, { new: true });
    res.json({
      msg: findProduct,
      success: true
    })
  } catch (error) {
    throw new Error(error)
  }
})

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating,
  uploadImages
};
