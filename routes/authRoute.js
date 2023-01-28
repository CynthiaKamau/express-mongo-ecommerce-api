const express = require("express");
const {
  createUser,
  loginUser,
  getUsers,
  getUser,
  deleteUser,
  updateUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logoutUser,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  getWishlist,
  updateUserAddres,
  userCart,
  getUserCart,
  emptyCart,
  applyCoupon,
  createOder,
  getOrder,
  updateOrderStatus,
} = require("../controller/userController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/admin-login", loginAdmin);
router.post("/cart", authMiddleware, userCart);
router.post("/cart/apply-coupon", authMiddleware, applyCoupon)
router.get("/cart", authMiddleware, getUserCart);
router.delete("/empty-cart", authMiddleware, emptyCart);
router.put("/order/update-order/:id", authMiddleware, isAdmin, updateOrderStatus);
router.get('/logout', logoutUser);
router.put('/update-password', authMiddleware, updatePassword);
router.post('/forgot-password-token', forgotPasswordToken)
router.post('/cart/cash-order', authMiddleware, createOder)
router.get('/get-orders', authMiddleware, getOrder)
router.put('/reset-password/:token', resetPassword)
router.get("/all-users", getUsers);
router.get("/", authMiddleware, getUser);
router.put("/edit-user", authMiddleware, isAdmin, updateUser);
router.delete("/delete-user", authMiddleware, isAdmin, deleteUser);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser);
router.get("/refresh", handleRefreshToken);
router.get("/wishlist", authMiddleware, getWishlist)
router.put("/save-address", authMiddleware, updateUserAddres)

module.exports = router;
