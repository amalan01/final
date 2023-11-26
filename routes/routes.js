const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const multer = require('multer');
const fs = require("fs");

const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

router.get('/', (request, response) => response.render('index'));

// router.get('/dashboard', ensureAuthenticated, (req, res) => {
//     res.render('dashboard', {
//         user: req.user,
//         // product: req.product
//     })
// });

// image upload
var fileStorage = multer.diskStorage({
    destination: function (req, file, cb)
    {
        cb (null, "./uploads");
    },

    filename: function(req, file, cb)
    {
        cb (null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
})

// image middleware
var upload = multer({
    storage: fileStorage
}). single("image");

// Insert a user into database
router.post('/add', upload, async(req, res) => {
    try{
        const product = new Product({
            ProductID: req.body.ProductID,
            ProductName: req.body.ProductName,
            Quantity: req.body.Quantity,
            Price: req.body.Price,
            image: req.file.filename,
        });
        await product.save();
        console.log("Product " + req.body.ProductName + " saved successfully!");
        req.session.message = {
            type: 'success',
            message: 'Product "' + req.body.ProductName + '" added successfully!'
        };

        res.redirect('/dashboard');
    }

    catch(err) {
        console.log("Add Product Error" + err);
    }
});

router.get('/dashboard', ensureAuthenticated, async(req, res) => {
    try {
        const productsFromDB = await Product.find();
        console.log(productsFromDB);
        res.render('dashboard', {
            title: "Home Page",
            user: req.user,
            products: productsFromDB
            
        })
    }

    catch(err) {
        console.log("Get all products Error: " + err);
        res.json({message: err.message});
    }
});


router.get('/add', (req, res) => {
    res.render("add_products", { title: 'Add Products'});
})

router.get('/delete/:id', async(req, res) => {
    try 
    {
        let id = req.params.id;
        let result = await Product.findByIdAndRemove(id);
        if (result.image != '')
        {
            try 
            {
                fs.unlinkSync('./uploads/' + result.image);
            }

            catch (e)
            {
                console.log("Delete image error: " + e.message);
            }
        }
        req.session.message = {
            type: 'info',
            message: 'Product deleted successfully'
        }
        res.redirect('/dashboard');
    }

    catch(err)
    {
        console.log("Error occured on delete product: " + err.message);
        res.json({message: err.message});
    }
})

router.get("/edit/:id", async(req, res) => {
    try
    {
        let id = req.params.id;
        let productToEdit = await Product.findById(id);
        if(productToEdit == null)
        {
            res.redirect("/dashboard");
        }
        else
        {
            res.render("edit_products", {title: "Edit Products", product: productToEdit});
        }
    }

    catch (error)
    {
        console.log("Error Product Edit: " + error.message);
        res.redirect("/dashboard");
    }
    
})

router.post("/update/:id", upload, async(req, res) => {
    try 
    {
        let id = req.params.id;
        let new_image = '';
        if(req.file)
        {
            new_image = req.file.filename;
            try
            {
                fs.unlinkSync("./uploads/" + req.body.old_image);
            }

            catch (e)
            {
                console.log("Error :: upload image error occurred " + e.message)
            }
        }

        else
        {
            new_image = req.body.old_image;
        }

        let result = await Product.findByIdAndUpdate(id, {
            ProductID: req.body.ProductID,
            ProductName: req.body.ProductName,
            Quantity: req.body.Quantity,
            Price: req.body.Price,
            image: new_image
        });

        req.session.message = {
            type: 'success',
            message: 'Product updated successfully!'
        }

        res.redirect('/dashboard');
    }
    catch (err)
    {
        console.log("Error :: route to update product Error occured: " + err.message);
        res.json({message: err.message, type: 'danger'})
    }
})

module.exports = router;
