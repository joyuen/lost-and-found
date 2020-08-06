var express = require('express');
var postings = require('../../model/postings');

var router = express.Router();
router.post('/', async function(req, res) {
    var n = parseFloat(req.body.n);
    var s = parseFloat(req.body.s);
    var w = parseFloat(req.body.w);
    var e = parseFloat(req.body.e);
    if(!isNaN(n+s+w+e)) {
        var posts = await postings.getPostingsWithin(n,s,w,e);
    }

    if(!posts || posts.error) {
        posts = null;   // The coordinates were prob not floats...
    }

    res.status(200).send(posts);
});

module.exports = router;