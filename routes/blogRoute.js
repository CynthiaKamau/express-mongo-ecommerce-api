const express = require("express");
const { createBlog, getBlogs, getBlog, updateBlog, deleteBlog, likeBlog, disLikeBlog } = require("../controller/blogController");
const router = express.Router()
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, isAdmin, createBlog)
router.get("/",  getBlogs)
router.get("/:id", getBlog)
router.put("/like", authMiddleware, likeBlog)
router.put("/dislike", authMiddleware, disLikeBlog)
router.put("/:id", authMiddleware, isAdmin, updateBlog)
router.delete("/:id", authMiddleware, isAdmin, deleteBlog)


module.exports = router;