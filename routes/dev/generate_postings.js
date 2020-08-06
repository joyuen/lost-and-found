const express = require('express');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const postings = require('../../model/postings');

const generate_post = require('./generate_postings_words');

const template = Handlebars.compile(fs.readFileSync(path.join(__dirname, "generate_postings.hbs")).toString());

var router = express.Router();
router.get('/', async function(req, res) {
    var npostings = (await postings.getAllPostings()).length;
    console.log(npostings);
    res.send(template({
        userid: "pnw1", // req.user.id
        num_postings: npostings,
    }));
});

router.post('/post', async function(req, res) {
    var num = req.body.num;
    var results = [];
    for (var i=0; i<num; i++) {
        var newpost = generate_post({ userid: req.user.id });
        var pid = await postings.addPosting(newpost);
        results.push(pid);
        // results[pid] = newpost;
    }
    res.send(results);
});

module.exports = router;