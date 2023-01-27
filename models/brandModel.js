const mongoose = require("mongoose");

var brandSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
); 

module.exports = mongoose.model("brand", brandSchema);
