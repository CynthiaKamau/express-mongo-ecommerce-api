const mongoose = require("mongoose");

var blogCategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
); 

module.exports = mongoose.model("blogCategory", blogCategorySchema);
