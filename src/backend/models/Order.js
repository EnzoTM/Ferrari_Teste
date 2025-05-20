const mongoose = require("../db/conn");
const { Schema } = mongoose;

const OrderSchema = new Schema({
  products: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    image: {
      type: String
    }
  }],
  paymentMethod: {
    type: Schema.Types.ObjectId,
    ref: 'PaymentMethod'
  },
  shippingAddress: {
    type: Schema.Types.ObjectId,
    ref: 'Address'
  },
}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);

module.exports = {
  OrderSchema,
  Order
};