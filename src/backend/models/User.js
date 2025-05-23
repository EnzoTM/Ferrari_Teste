const mongoose = require("../db/conn");
const { Schema } = mongoose;
const { AddressSchema } = require('./Address');
const { PaymentMethodSchema } = require('./PaymentMethod');
const { OrderSchema } = require('./Order');
const { CartItemSchema } = require('./CartItem');

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor, insira um email válido']
    },
    password: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    cpf: {
      type: String,
      required: true,
      unique: true
    },
    admin: {
      type: Boolean,
      default: false
    },
    address: {
      type: AddressSchema,
      default: null
    },
    paymentMethod: {
      type: PaymentMethodSchema,
      default: null
    },
    cart: {
      type: [CartItemSchema],
      default: [] // Ensure this is always initialized as an empty array
    },
    orders: {
      type: [OrderSchema],
      default: [] // Ensure this is always initialized as an empty array
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;