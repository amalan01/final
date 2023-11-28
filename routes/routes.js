const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const fs = require('fs');
const multer = require('multer');

// Image upload
var fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

// Image middleware
var upload = multer({
    storage: fileStorage
}).single("image");

// Insert product into database route
router.post('/add', upload, async (req, res) => {
    try {
        const product = new Product({
            name: req.body.name,
            price: req.body.price,
            quantity: req.body.quantity,
            image: req.file.filename
        });

        await product.save();
        console.log("Product" + req.body.name + " saved successfully");
        req.session.message = {
            type: 'success',
            message: 'Product "' + req.body.name + '"added successfully!'
        };
        res.redirect('/products');
    }

    catch (err) {
        console.log("Insert product::Add product::Error occured:: " + err.message);
    }
});

// Route to get all products
router.get("/", async (req, res) => {
    try {
        const productFromDB = await Product.find();
        res.render('index', {
            title: "Home Page",
            product: productFromDB
        });
    }

    catch (err) {
        console.log("patrick::Get all products::Error occured: " + err.message);
        res.json({ message: err.message })
    }
});


// Route to edit product
router.get('/edit/:id', async (req, res) => {
    try {
        let id = req.params.id;
        let productToEdit = await Product.findById(id)

        if (productToEdit == null) {
            res.redirect('/');
        }
        else {
            res.render("edit_product", { title: 'Edit Product', product: productToEdit });
        }
    }

    catch (err) {
        console.log("Error::Route to edit product " + err.message);
        res.redirect('/');
    }
});

// Route to update product
router.post('/update/:id', upload, async (req, res) => {
    try {
        let id = req.params.id;
        let new_image = '';

        if (req.file) {
            new_image = req.file.filename;
            try {
                fs.unlinkSync("./uploads" + req.body.old_image);
            }

            catch (err) {
                console.log("Error::Upload image " + err.message);
            }
        }

        else {
            new_image = req.body.old_image;
        }

        let result = await Product.findByIdAndUpdate(id, {
            name: req.body.name,
            price: req.body.price,
            quantity: req.body.quantity,
            image: new_image
        });

        req.session.message = {
            type: 'success',
            message: 'Product update successfull!'
        }

        res.redirect('/products')

    }

    catch (err) {
        console.log("Error::Route to update product " + err.message);
        res.json({ message: err.message, type: 'danger' });
    }
});

// Route to delete product
router.get('/delete/:id', async (req, res) => {
    try {
        let id = req.params.id;
        let result = await Product.findByIdAndRemove(id);

        if (result.image != '') {
            try {
                fs.unlinkSync('./uploads/' + result.image);
            }

            catch (e) {
                console.log("Error::Delete image::Error occured: " + e.message);
            }
        }

        req.session.message = {
            type: 'info',
            message: "Product deleted successfully."
        }

        res.redirect('/products')
    }

    catch (err) {
        console.log("Error::Route to delete product " + err.message);
        res.json({ message: err.message, type: 'danger' });
    }
});

router.get('/products', (req, res) => {
    res.send("All products");
});

router.get('/products/add', (req, res) => {
    res.render("add_product", { title: 'Add Product' });
});

module.exports = router;