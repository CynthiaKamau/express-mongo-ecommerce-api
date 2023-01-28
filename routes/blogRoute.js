const express = require("express");
const {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  disLikeBlog,
  uploadImages,
} = require("../controller/blogController");
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const {
  uploadPhoto,
  blogImageResize,
} = require("../middlewares/uploadImagesMiddleware");

router.post("/", authMiddleware, isAdmin, createBlog);
router.get("/", getBlogs);
router.get("/:id", getBlog);
router.put(
  "/upload-images/:id",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 10),
  blogImageResize,
  uploadImages
);
router.put("/like", authMiddleware, likeBlog);
router.put("/dislike", authMiddleware, disLikeBlog);
router.put("/:id", authMiddleware, isAdmin, updateBlog);
router.delete("/:id", authMiddleware, isAdmin, deleteBlog);

module.exports = router;
