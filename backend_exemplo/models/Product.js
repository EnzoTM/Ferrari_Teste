const mongoose = require('../db/conn');
const Model = require('./Model');

const Product = mongoose.model(
    'Product',
    new mongoose.Schema({
        _id: mongoose.Types.ObjectId,
        name: {
            type: String,
            unique: true,
            required: true
        },
        tags: {
            type: Array,
            required: true
        },
        gender: {
            type: String,
            enum: ['Masculino', 'Feminino', 'Unissex'],
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
            type: Array,
            required: true
        },
        AvailableModels: {
            type: [Model],
            sparse: true
        },
        description: {
            type: String,
            required: true
        }
    }, { timestamps: true })
);

module.exports = Product;
