const mongoose = require("../db/conn");
const { Schema } = mongoose;
const { ProductSchema } = require("./Product");

const OrderItemSchema = new Schema({
  product: {
    type: ProductSchema,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  }
}, { timestamps: true });

module.exports = {
  OrderItemSchema,
  OrderItem: mongoose.model('OrderItem', OrderItemSchema)
};