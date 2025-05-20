const mongoose = require("../db/conn");
const { Schema } = mongoose;

const Purchase = new Schema({
  product: {
    id: {
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
    color: {
      type: String
    },
    size: {
      type: String
    },
    quantity: {
      type: Number,
      required: true
    },
    image: {
      type: String
    }
  },
}, { timestamps: true });

const Address = new Schema({
  street: {
    type: String,
    required: true
  },
  number: {
    type: String,
    required: true
  },
  complement: {
    type: String
  },
  neighborhood: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zipCode: {
    type: String,
    required: true
  }
});

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
    image: {
      type: String
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
      type: Address
    },
    cart: {
      type: [Purchase],
      default: []
    },
    orders: {
      type: [Purchase],
      default: []
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;