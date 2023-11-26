const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load user model
const user = require('../models/User');

module.exports = function(passport){
    passport.use(
        new LocalStrategy( {usernameField: 'email'}, (email, password, done) => {
            // Match user
            user.findOne({
                email: email
            }).then(user => {
                if(!user){
                    return done(null, false, {message: 'That email is not registered.'});
                }

                // Match Password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if(err) throw err;
                    if(isMatch) {
                        return done(null, user);
                    }

                    else {
                        return done(null, false, {message: 'Password is incorrect.'})
                    }
                });
            });
        })
    );
    passport.serializeUser(function(user, done){
        done(null, user.id);
    });

    passport.deserializeUser(async(id, done) => {
        try{
            let userFound = await user.findById(id);
            if(userFound != null) {
                console.log("Found user!");
            }
            done(null, userFound);
        }

        catch(err){
            console.log("Error: " + err.message)
        }
    });
};