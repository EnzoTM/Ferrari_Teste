const mongoose = require("../db/conn");
const { Schema } = mongoose;

const PaymentMethodSchema = new Schema({
  type: {
    type: String,
    enum: ['credit', 'debit', 'pix', 'bankslip'],
    required: true
  },
  cardNumber: {
    type: String,
    // Only required for credit/debit card payments
  },
  cardHolderName: {
    type: String,
    // Only required for credit/debit card payments
  },
  expirationDate: {
    type: String,
    // Only required for credit/debit card payments
  },
  cvv: {
    type: String,
    // Only required for credit/debit card payments
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = {
  PaymentMethodSchema,
  PaymentMethod: mongoose.model('PaymentMethod', PaymentMethodSchema)
};