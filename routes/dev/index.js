const express = require('express');

var router = express.Router();
router.use('/generate_postings', require('./generate_postings'));

module.exports = router;