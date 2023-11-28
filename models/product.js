const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },

    price: {
        type: String,
        require: true
    },

    quantity: {
        type: String,
        require: true
    },

    image: {
        type: String,
        require: true
    },

    created: {
        type: Date,
        require: true,
        default: Date.now
    },
})

module.exports = mongoose.model('Product', productSchema);
