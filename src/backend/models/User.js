const mongoose = require("../db/conn");
const { Schema } = mongoose;
const { AddressSchema } = require('./Address');
const { PaymentMethodSchema } = require('./PaymentMethod');
const { OrderSchema } = require('./Order');

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
    addresses: {
      type: [AddressSchema],
      default: []
    },
    paymentMethods: {
      type: [PaymentMethodSchema],
      default: []
    },
    cart: [{
      product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
      },
    }],
    orders: {
      type: [OrderSchema],
      default: []
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;