const express = require('express');

var router = express.Router();
router.use('/postings', require('./postings'));
router.use('/region', require('./region'));
router.use('/vision', require('./vision'));
router.use('/notifications', require('./notifications'));
router.use('/image', require('./image'));

module.exports = router;