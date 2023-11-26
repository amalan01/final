const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Login Page
router.get('/login', (request, response) => response.render('login'));

// Register Page
router.get('/register', (request, response) => response.render('register'));

// Register Handle
router.post('/register', (request, response) => {
    // console.log(request.body);
    // response.send('Register Handle')
    const {name, email, password, password2} = request.body;
    let errors = [];

    // Check required fields
    if (!name || !email || !password || !password2) {
        errors.push({ msg: "Please enter all fields. "})
    }

    // Check passwords match
    if (password != password2){
        errors.push({msg: 'Passwords do not match. '})
    }

    // Check password length
    if (password.length < 6){
        errors.push({msg: 'Password must be at least 6 characters. '})
    }

    if( errors.length > 0) {
        response.render('register', {
            errors,
            name, 
            email,
            password,
            password2
        })
    }

    // Check for existing email
    else {
        User.findOne({email: email}).then(user => {

            if(user) {
                errors.push({msg: 'Email already exists'});
                response.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                });
            }

            else {
                const newUser = new User({
                    name,
                    email,
                    password
                })

                // console.log(newuser);

                // password bcrypt
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save().then(user => {
                            request.flash('success_msg', 'You are now registerd and can log in');
                            response.redirect('/users/login');
                        }).catch(err => console.log(err));

                        
                    })
                })

            }
        });
    }

    
});

// Login Handle 
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next)
})

// Logout Handle
router.get('/logout', (req, res) => {
    if(req.user) {
        req.session.destroy();
        res.clearCookie('connect.sid');
        res.redirect('/users/login')
    }
    else {
        res.redirect('/users/login');
    }
})

module.exports = router;