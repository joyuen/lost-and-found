var passport = require('passport');
var CasStrategy = require('passport-cas2').Strategy;
var User = require('../model/user.js');

var cas = new CasStrategy({
    casURL: 'https://cas.sfu.ca/cas'
},
    // This is the `verify` callback
    function (username, profile, done) {
        console.log(profile);
        User.findOne({ id: username }, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                user = new User({
                    id: username,
                    name: username
                });
                user.save(function (err) {
                    if (err) console.log(err);
                    return done(err, user);
                });
            } else {
                //found user. Return
                return done(err, user);
            }
            done(err, user);
        });
    });

passport.use(cas);

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findOne({ id: id }, function (err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            user = new User({
                id: id,
            });
            user.save(function (err) {
                if (err) console.log(err);
                return done(err, user);
            });
        }
        return done(err, user);
    });
});

function isAuthenticated(req, res, next) {
    if (req.user) {
        return next();
    } else {
        return res.redirect('/auth/cas');
    }
};

module.exports = function (app) {
    app.all('/auth/cas',
        passport.authenticate('cas', {
            successRedirect: '/',
            failureRedirect: '/auth/cas'
        }));

    app.get('/logout', function (req, res) {
        var returnURL = 'https://www.sfu.ca';
        cas.logout(req, res, returnURL);
    });

    app.use(isAuthenticated);
};
