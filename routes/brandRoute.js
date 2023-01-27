const express = require("express");
const { createBrand, getBrand, getBrands, updateBrand, deleteBrand } = require("../controller/brandController");
const router = express.Router()
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, isAdmin, createBrand)
router.get("/",  getBrands)
router.get("/:id", getBrand)
router.put("/:id", authMiddleware, isAdmin, updateBrand)
router.delete("/:id", authMiddleware, isAdmin, deleteBrand)


module.exports = router;