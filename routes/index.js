var express = require('express');
var Postings = require('../model/postings');
var permissions = require('../model/permissions');

var router = express.Router();
router.get('/', async function(req, res) {
    
    var countlost = await Postings.find({"status": "lost"}).count();
    var countfound = await Postings.find({"status": "found"}).count();
    var countreturned = await Postings.find({"status": "returned"}).count();
    var countstolen = await Postings.find({"status": "stolen"}).count();
    console.log("hey index endpoint")
    console.log(countlost)
    console.log(countfound)
    console.log(countreturned)
    console.log(countstolen)

    res.render('index', {
        "countlost": countlost,
        "countfound": countfound,
        "countreturned": countreturned,
        "countstolen": countstolen,
    });
});

module.exports = router;