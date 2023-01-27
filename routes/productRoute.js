const express = require("express");
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating,
} = require("../controller/productController");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createProduct);
router.get("/", getProducts);
router.get("/:id", getProduct);
router.put("/wishlist", authMiddleware, addToWishlist);
// router.put("/:id", authMiddleware, isAdmin, updateProduct)
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);
router.put("/rating", authMiddleware, rating);
module.exports = router;
