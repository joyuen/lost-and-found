var express = require('express');
var mongo_sanitize = require("mongo-sanitize");
const { check, query, validationResult } = require('express-validator');

var Notifs = require('../../model/notifications');

var router = express.Router();

// https://stackoverflow.com/a/51391081
const asyncHandler = fn => (req, res, next) => {
    return Promise
        .resolve(fn(req, res, next))
        .catch(next);
};

router.get('/read', asyncHandler(async function(req, res) {
    res.json(await Notifs.read(req.user.id));
}));

router.post('/removeAll', asyncHandler(async function(req, res) {
    await Notifs.removeAll(req.user.id);
    res.status(200).send({});
}));

router.post('/remove', asyncHandler(async function(req, res) {
    req.body = mongo_sanitize(req.body);
    var notifids;
    if (typeof req.body.notifids === "string") {
        notifids = [req.body.notifids];
    } else if (Array.isArray(req.body.notifids)) {
        notifids = req.body.notifids;
    } else {
        throw `Invalid argument -- ${req.body.notifids}`;
    }

    await Notifs.removeMany(req.user.id, notifids);
    res.status(200).send({});
}));

module.exports = router;