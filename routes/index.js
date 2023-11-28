const express = require('express');
const router = express.Router();
const Product = require('../models/product');

const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
// router.get('/', (require, response)=>
//     response.send('Welcome')
// );

router.get('/', forwardAuthenticated, (require, response) =>
    response.render('welcome')
);

router.get('/products', ensureAuthenticated, async (req, res) => {
    try {
        const productFromDB = await Product.find();
        res.render('index', {
            title: "Home Page",
            product: productFromDB
        });
    }

    catch (err) {
        console.log("Get all products::Error occured: " + err.message);
        res.json({ message: err.message })
    } 
});

router.get('/products/add', ensureAuthenticated, async (req, res) => {
    try {
        const productFromDB = await Product.find();
        res.render('add_product', {
            title: "Add",
            product: productFromDB
        });
    }

    catch (err) {
        console.log("Add products::Error occured: " + err.message);
        res.json({ message: err.message })
    } 
});


module.exports = router;
