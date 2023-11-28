const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');


// Load User model
const User = require('../models/User');

router.get('/login', (require, response) =>
    response.render('login')
);

router.get('/register', (require, response) =>
    response.render('register')
);

router.post('/register', (request, response) => {
    // console.log(request.body);
    // response.send('register handle');
    const { name, email, password, password2 } = request.body;
    let errors = [];

    // Check required fields
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill out all fields.' })
    }

    // Check password match
    if (password != password2) {
        errors.push({ msg: 'Passwords do not match.' })
    }

    // Check password length
    if (password.length < 6) {
        errors.push({ msg: 'Passwords must be at least 6 characters.' })
    }

    if (errors.length > 0) {
        response.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    }

    // Validate for existing email
    else {
        User.findOne({ email: email }).then(user => {

            if (user) {
                errors.push({ msg: 'Email already exists.' });
                response.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                });
            }

            else {
                // Create new user
                const newUser = new User({
                    name,
                    email,
                    password
                })
                //console.log(newUser);

                // Password bcrypt
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {

                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => {
                                request.flash('success_msg', 'You are now registered and can login'
                                );
                                response.redirect('/users/login');
                            })
                            .catch(err => console.log(err));
                    });
                });
                //response.send('pass')
            }
        });
    }
});

// Login handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/products',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next)
})

// Loguout handle
router.get('/logout', (req, res,) => {
    if (req.user) {
        req.session.destroy()
        res.clearCookie('connect.sid')
        res.redirect('/users/login');
    }
    else {
        res.redirect('/users/login');
    }
});

module.exports = router;