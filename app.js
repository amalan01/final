const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require("express-session");
const passport = require('passport');
const app = express();
require('dotenv').config();

// image folder
app.use(express.static('uploads'))


// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').MongoURI;

// Connect to MongoDB
mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.log(err));

// EJS Middleware
app.use(expressLayouts);
app.set('view engine', 'ejs');


// Express body parser
app.use(express.urlencoded({extended: true}))
app.use(express.json());

// Express session
app.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: true
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect Flash
app.use(flash());

// Global variables
app.use(function(request, response, next){
    response.locals.success_msg = request.flash('success_msg');
    response.locals.error_msg = request.flash('error_msg');
    response.locals.error = request.flash('error');

    // caching disabled for every route
    response.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
})

// Routes
app.use('/users', require('./routes/users'));

// route prefix
app.use("", require('./routes/routes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server started on port: ${PORT}`));

