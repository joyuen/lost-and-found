'use strict';
const vision = require('@google-cloud/vision');
const express = require('express');
const router = express.Router();
const features = [
    {
        type: 'LABEL_DETECTION',
        maxResults: 5
    },
    {
        type: 'LOGO_DETECTION',
        maxResults: 3
    }
];

const options = {
    credentials: require('../../config').GEC_CREDENTIALS
}
const client = new vision.ImageAnnotatorClient(options);

router.post('/', express.text({ type: '*/*', limit: '50mb' }), async function (req, res) {
    let buff = new Buffer(req.body, 'base64');
    let request = {
        image: buff,
        features: features
    };
    client.annotateImage(request).then(response => {
        let logos = response[0].logoAnnotations;
        let labels = response[0].labelAnnotations;
        res.json({ labels: labels, logos: logos });
    }).catch(err => {
        console.error(err);
        res.status(500).send(err);
    });
});

module.exports = router;
