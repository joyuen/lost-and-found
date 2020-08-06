var express = require('express');
var Images = require('../../model/images');

var router = express.Router();
router.get('/:id', async function(req, res) {
    var id = req.params.id.toString();
    var image;
    try {
        image = await Images.getImageB64(id);
    } catch (e) {
        return res.status(404).send(`Image not found`);
    }

    res.status(200).send(image);
});

module.exports = router;