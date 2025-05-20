const mongoose = require("../db/conn");
const Model = mongoose.Schema(
  {
    _id: mongoose.Types.ObjectId,
    size: {
      type: String,
      enum: ["PP", "P", "M", "G", "XG"],
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      validate: {
        validator: function (value) {
          return Number.isInteger(value) && value >= 0;
        },
        message: "A quantidade necessita ser um valor positivo e inteiro.",
      },
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = Model;