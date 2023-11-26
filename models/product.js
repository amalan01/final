const mongoose = require('mongoose');
const ProductSchema = new mongoose.Schema({
    ProductID:{
        type: String,
        require: true
    },

    image:{
        type: String,
        require: true
    },

    ProductName:{
        type: String,
        require: true
    },

    Quantity:{
        type: String,
        require: true
    },

    Price:{
        type: String,
        require: true
    },
})

// const Product = mongoose.model('Product', ProductSchema);
// module.exports = Product;
module.exports = mongoose.model('Product', ProductSchema);