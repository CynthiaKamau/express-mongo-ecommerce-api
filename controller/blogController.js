const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const { loginUser } = require("./userController");
const cloudinaryUploading = require("../utils/cloudinary");
const fs = require("fs")

// create blogs
const createBlog = asyncHandler(async (req, res) => {
  try {
    const newBlog = await Blog.create(req.body);
    res.json({
      msg: newBlog,
      success: true,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// get all blogs
const getBlogs = asyncHandler(async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.json({
      msg: blogs,
      success: true,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// get blog
const getBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const blog = await Blog.findById(id).populate('likes').populate("dislikes");
    await Blog.findByIdAndUpdate(
      id,
      {
        $inc: { numViews: 1 },
      },
      { new: true }
    );
    res.json({
      msg: blog,
      success: true,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// update blog
const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const blog = await Blog.findByIdAndUpdate(
      id,
      {
        title: req.body?.title,
        category: req.body?.category,
        description: req.body?.description,
      },
      { new: true }
    );
    res.json({
      msg: blog,
      success: true,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// delete blog
const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const blog = await Blog.findByIdAndDelete(id);
    res.json({
      msg: blog,
      success: true,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// like blog
const likeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;
  validateMongoDbId(blogId);

  // find blog you want to like
  const blog = await Blog.findById(blogId);
  // check current user
  const user_id = req.user?._id;
  // find if user has liked the blog
  const isLiked = blog?.isLiked;
  // find if user disliked the blog
  const alreadyDisliked = blog?.dislikes?.find(
    (userId) => userId?.toString() === user_id?.toString()
  );

  if (alreadyDisliked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { dislikes: user_id },
        isDisliked: false,
      },
      { new: true }
    );

    res.json({
      mgs: blog,
      success: true,
    });
  }

  if (isLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: user_id },
        isLiked: false,
      },
      { new: true }
    );

    res.json({
      mgs: blog,
      success: true,
    });
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { likes: user_id },
        isLiked: true,
      },
      { new: true }
    );

    res.json({
      mgs: blog,
      success: true,
    });
  }
});

// dislike blog
const disLikeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;
  validateMongoDbId(blogId);

  // find blog you want to like
  const blog = await Blog.findById(blogId);
  // check current user
  const user_id = req.user?.user_id;
  // find if user has liked the blog
  const isDisLiked = blog?.isDisliked;
  // find if user disliked the blog
  const alreadyLiked = blog?.likes?.find(
    (userId) => userId?.toString() === user_id?.toString()
  );

  if (alreadyLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: user_id },
        isLiked: false,
      },
      { new: true }
    );

    res.json({
      mgs: blog,
      success: true,
    });
  }

  if (isDisLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { dislikes: user_id },
        isDisliked: false,
      },
      { new: true }
    );

    res.json({
      mgs: blog,
      success: true,
    });
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { dislikes: user_id },
        isDisliked: true,
      },
      { new: true }
    );

    res.json({
      mgs: blog,
      success: true,
    });
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
    const findBlog = await Blog.findByIdAndUpdate(id, {
      images: urls.map((file) => {
        return file;
      }), 
    }, { new: true });
    res.json({
      msg: findBlog,
      success: true
    })
  } catch (error) {
    throw new Error(error)
  }
})

module.exports = {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  disLikeBlog,
  uploadImages
};
