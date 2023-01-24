const mongoose = require("mongoose");

var productCategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
); 

module.exports = mongoose.model("productCategory", productCategorySchema);
