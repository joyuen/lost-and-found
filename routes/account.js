var express = require('express');
var User = require('../model/user');

var router = express.Router();
router.get('/', async function (req, res) {
    return res.render('account', { page: 'account', user: req.user });
});

router.post('/', async function (req, res, next) {
    user = req.user;

    if ((req.body.name == null || 0 === req.body.name.length)) {
        user.name = user.id;
    } else {
        user.name = req.body.name;
    }

    user.phone = req.body.phone;

    user.save(function (err) {
        if (err) {
            console.log(err);
            next(err);
        }
        res.render('account', { page: 'account', user: user });
    });
});

router.put('/:id', function (req, res, next) {
    if (req.user.admin != true) {
        return res.status(401).end();
    }

    User.findOne({ id: req.params.id }, function (err, user) {
        if (err) {
            console.log(err);
            next(err);
        }
        if ((req.body.name == null || 0 === req.body.name.length)) {
            user.name = user.id;
        } else {
            user.name = req.body.name;
        }

        user.phone = req.body.phone;

        if (req.body.admin) {
            user.admin = true;
        } else {
            user.admin = false;
        }

        user.save(function (err) {
            if (err) {
                console.log(err);
                next(err);
            }
            res.status(204);
            return res.end();
        });
    });

});

module.exports = router;
