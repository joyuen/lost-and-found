var express = require('express');
var User = require('../model/user');

var router = express.Router();
router.get('/', async function (req, res, next) {
    User.find({}, function (err, users) {
        if (err) {
            return next(err);
        }
        return res.render('admin', { user: req.user, users: users });
    });
});

/* Toggles admin privilege for current user.
 For demonstration purposes.
*/
router.get('/sudo', async function (req, res, next) {
    user = req.user;
    if (user.admin === true) {
        user.admin = false;
    } else {
        user.admin = true;
    }

    user.save(function (err) {
        if (err) {
            console.log(err);
            next(err);
        }
        res.redirect('/admin')
    });

});

module.exports = router;
