const mongoose = require('../db/conn');
const Model = require('./Model');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    tags: {
        type: [String],
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    type: {
        type: String,
        enum: ['car', 'helmet', 'merchandise', 'formula1'],
        required: true
    },
    price: {
        type: Number,
        validate: {
            validator: function(value) {
                return value >= 0;
            },
            message: 'O preço necessita ser um valor positivo'
        },
        required: true
    },
    images: {
        type: [String],
        required: true
    },
    availableModels: {
        type: [Model],
        default: []
    },
    description: {
        type: String,
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    specifications: {
        type: mongoose.Schema.Types.Mixed
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    }
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;