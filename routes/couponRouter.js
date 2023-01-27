const express = require("express");
const { createCoupon, getCoupon, getCoupons, updateCoupon, deleteCoupon } = require("../controller/couponController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router()

router.post("/", authMiddleware, isAdmin, createCoupon)
router.put("/:id", authMiddleware, isAdmin, updateCoupon)
router.delete("/:id", authMiddleware, isAdmin, deleteCoupon)
router.get("/:id", authMiddleware, isAdmin, getCoupon)
router.get("/", authMiddleware, isAdmin, getCoupons)

module.exports = router;