var express = require('express');
var Postings = require('../model/postings');
var Images = require('../model/images');
var User = require('../model/user');
var permissions = require('../model/permissions');

var router = express.Router();
router.get('/', async function(req, res) {
    var posting_id = req.query.id;
    var posting = await Postings.getPostingById(posting_id);
    var username = posting.postedBy;
    var user = await User.findOne({ id: username }).exec();

    posting.image_data = (posting.imageID) ? (await Images.getImageB64(posting.imageID)) : "";

    res.render('viewpost', {
        "post": posting,
        "user": user,
        "caneditpermissions": permissions.canEdit(user, posting),
        "cannotifyfound": permissions.canNotifyFound(user, posting),
        "canreturn": permissions.canReturn(user, posting),
    });
});

module.exports = router;