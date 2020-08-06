var express = require('express');
var RegexEscape = require("regex-escape");
var multer = require('multer');
var path = require('path');
var mongo_sanitize = require("mongo-sanitize");
var moment = require('moment');
const { check, query, validationResult } = require('express-validator');
const config = require('../../config.js');

var Postings = require('../../model/postings');
var Images = require('../../model/images');
var Notifs = require('../../model/notifications');
var permissions = require('../../model/permissions');

var router = express.Router();

//-------------------------------
//   Helper functions
//-------------------------------
function mongoSanitizeQuery(req, res, next) {
    req.query = mongo_sanitize(req.query);
    next();
}

function mongoSanitizeBody(req, res, next) {
    req.body = mongo_sanitize(req.body);
    next();
}

const multer_image = multer({
    dest: './uploads',
    limits: {fileSize: config.MAX_IMAGE_SIZE},
    fileFilter: function(req, file, cb) {
        cb(null, file.mimetype == 'image/jpeg' || file.mimetype == 'image/png');
    }
});

function beforeNow(v) {
    return (new Date(v)) <= (new Date());
}

function isDate(v) {
    return !isNaN(new Date(v).getTime());
}

function clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
}

function hasEditPermissions(user, posting) {
    return permissions.canEdit(user, posting);
}

/**
 * DELETE api/postings/:id - delete a posting
 * Can only delete if user created the posting or if user is an admin
 */
// router.delete('/:id', async function(req, res) {
router.post('/:id', async function(req, res) {
    req.params.id = req.params.id.slice(1,);
    // req.params.id = req.params.id.toString();

    try {
        var post = await Postings.getPostingById(req.params.id);
    } catch (e) {
        return res.status(404).send(`Post with id ${req.params.id} not found`);
    }

    if (!hasEditPermissions(req.user, post)) {
        return res.status(403);
    }

    var result = await Postings.deleteById(req.params.id);
    if (result.ok == 1) {
        return res.redirect("/map")
    } else {
        return res.status(500).json(result);
    }
});

/**
 * POST api/postings/:id/return - mark a posting as being returned
 */
router.post('/:id/return', async function(req, res) {
    req.params.id = req.params.id.toString();

    try {
        var post = await Postings.getPostingById(req.params.id);
    } catch (e) {
        return res.status(404).send(`Post with id ${req.params.id} not found`);
    }

    if (!hasEditPermissions(req.user, post)) {
        return res.status(403);
    }

    if (post.status == 'returned') {
        return res.status(200).send("ok");
    }

    try {
        var result = await Postings.updatePosting(req.params.id, {
            status: 'returned',
            returnDate: new Date(),   
        });
        return res.status(200).send("ok");
    } catch (err) {
        return res.status(400).json(err.message);
    }
});

/**
 * POST api/postings/:id/found - notify user who created post that their item was found
 */
router.post('/:id/found', async function(req, res) {
    req.params.id = req.params.id.toString();

    try {
        var post = await Postings.getPostingById(req.params.id);
    } catch (e) {
        return res.status(404).send(`Post with id ${req.params.id} not found`);
    }

    if (!permissions.canNotifyFound(req.user, post)) {
        return res.status(403);
    }

    try {
        await Notifs.sendFoundMessage(post);
        return res.status(200).send({});
    } catch (err) {
        return res.status(400).json(err.message);
    }
});

/**
 * PUT api/postings/:id - replace attributes in a posting
 * Will only modify posting values that are specified in the request body
 * Can only update if user created the posting or if user is an admin
 *
 * Parameters:
 *      same as POST api/postings
 *      can also upload an image, which will change the image ID
 */
router.put('/:id', mongoSanitizeBody, multer_image.single('image'), [
    check('title').optional().isString().isLength({min:1, max:256}),
    check('status').optional().isString().isIn(['lost', 'found', 'stolen', 'returned']),
    check('item').optional().isString().isLength({min:1, max:256}),
    check('date').optional().custom(isDate).custom(beforeNow),
    check('campus').optional().isString().isIn(['burnaby', 'surrey', 'vancouver']),
    check('location').optional().isString().isLength({max: 256}),
    check('detail').optional().isString().isLength({max: 2500}),
], async function(req, res) {
    return res.status(400).send("Temporarily deprecated, use POST /api/postings with {id} passed in the body instead");
    // turn separate date and time values into a combined datetime
    // if (typeof req.body.date !== 'undefined') {
    //     req.body.date = new Date(`${req.body.date} ${req.body.time}`);
    //     delete req.body.time;
    // }

    // // validate the form inputs
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return res.status(400).json(errors.array());
    // }

    // req.params.id = req.params.id.toString();

    // try {
    //     var post = await Postings.getPostingById(req.params.id);
    // } catch (e) {
    //     // don't allow PUTting postings to a specific ID
    //     return res.status(404).send(`Post with id ${req.params.id} not found`);
    // }

    // if (!hasEditPermissions(req.user, post)) {
    //     return res.status(403);
    // }

    // var new_post_entries = {
    //     title: req.body.title,
    //     category: req.body.item,
    //     description: req.body.detail,
    //     status: req.body.status,
    //     campus: req.body.campus,
    //     location: req.body.location,
    //     lostDate: req.body.date,
    // };
    // if (req.file) {
    //     new_post_entries.imageID = await processImage(req.file);
    // }

    // for (let [key,val] of Object.entries(new_post_entries)) {
    //     if (typeof val === "undefined") {
    //         delete new_post_entries[key];
    //     }
    // }

    // try {
    //     var result = await Postings.updatePosting(req.params.id, new_post_entries);
    //     return res.status(200);
    // } catch (err) {
    //     return res.status(400).json(err.message);
    // }
});

/**
 * GET api/postings/:id - get a certain posting
 */
router.get('/:id', async function(req, res) {
    req.params.id = req.params.id.toString();
    var postid = req.params.id;
    try {
        var posting = await Postings.getPostingById(postid);
    } catch (e) {
        return res.status(404).send(`Post with id ${req.params.id} not found`);
    }
    res.json(posting);
});

/**
 * POST api/postings - upload posting to the server
 * returns the :id of the uploaded posting
 *
 * Parameters:
 *      id
 *      title -
 *      status -
 *      item -
 *      date -
 *      time -
 *      campus -
 *      location -
 *      detail -
 *      lat
 *      lng
 *      a single file [an image] can also be uploaded (max 10 MB)
 */
router.post('/', mongoSanitizeBody, multer_image.single('image'), [
    check('title').isString().isLength({min:1, max:256}),
    check('status').isString().isIn(['lost', 'found', 'stolen', 'returned']),
    check('item').isString().isLength({min:1, max:256}),
    // date, time, and timezone-offset will all be checked below
    check('date').customSanitizer((date, {req}) => {
        // hopefully this is safe
        var parsed_date = moment(`${date}`).utcOffset(req.body["timezone-offset"]).toDate();
        delete req.body["timezone-offset"];
        return parsed_date;
    }).custom(date => {
        return (new Date(2020, 0, 1) <= date) && (date <= new Date());
    }),
    check('campus').isString().isIn(['burnaby', 'surrey', 'vancouver']),
    check('location').isString().isLength({max: 256}),
    check('detail').isString().isLength({max: 2500}),
    check('postid').optional().isString(),
    check('lat').toFloat().customSanitizer(v => clamp(v, -90, 90)),
    check('lng').toFloat().customSanitizer(v => clamp(v, -180, 180)),
], async function(req, res) {
    // validate the form inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
    }

    // two possible actions
    if (typeof req.body.postid === 'undefined' || req.body.postid == "") {
        return await postCreate();
    } else {
        return await postUpdate();
    }

    async function postCreate() {
        if (req.user == undefined) {
            return res.status(400).send("login info is undefined -- are you logged in?");
        }

        var new_post = {
            title: req.body.title,
            category: req.body.item,
            description: req.body.detail,
            status: req.body.status,
            campus: req.body.campus,
            building: "",
            room: "",
            location: req.body.location,
            creationDate: new Date(),
            lostDate: req.body.date,
            postedBy: req.user.id,
            imageID: "",                // to be filled in
            coordinates: {
                type: "Point",
                coordinates: [req.body.lng, req.body.lat],
            },
            tags: [],
        };
        if (req.body.b64image) {
            new_post.imageID = await Images.saveImageFromB64(req.body.b64image);
        }
        if (req.body.tags) {
            new_post.tags = req.body.tags;
        }

        var id = await Postings.addPosting(new_post);
        return res.json(id);
    }

    async function postUpdate() {
        req.body.postid = req.body.postid.toString();

        try {
            var post = await Postings.getPostingById(req.body.postid);
        } catch (e) {
            return res.status(404).send(`Post with id ${req.body.postid} not found`);
        }

        if (!hasEditPermissions(req.user, post)) {
            return res.status(403);
        }

        var new_post_entries = {
            title: req.body.title,
            category: req.body.item,
            description: req.body.detail,
            status: req.body.status,
            campus: req.body.campus,
            location: req.body.location,
            lostDate: req.body.date,
            coordinates: {
                type: "Point",
                coordinates: [req.body.lng, req.body.lat],
            },
        };
        if (req.body.b64image) {
            new_post_entries.imageID = await Images.saveImageFromB64(req.body.b64image);
        }
        if (req.body.tags && /* temp fix so editing doesn't wipe the tags, replace with something proper */ req.body.tags != []) {
            new_post_entries.tags = req.body.tags;
        }

        // don't update any empty keys
        for (let [key,val] of Object.entries(new_post_entries)) {
            if (typeof val === "undefined") {
                delete new_post_entries[key];
            }
        }
        if (req.body.lat == undefined || req.body.lng == undefined) {
            delete new_post_entries['coordinates'];
        }

        try {
            var result = await Postings.updatePosting(req.body.postid, new_post_entries);
            return res.status(200).json(req.body.postid);
        } catch (err) {
            return res.status(400).json(err.message);
        }
    }

});

/**
 * GET /?(params) - get postings, under search conditions
 * Returns JSON {token: string, data: (array of Postings), [numTotal: ...]}
 * If no token is specified in the search params, a "numTotal" attribute is added
 *      with the total number of postings matched by the search.
 * Postings are paginated -- request only returns a few postings (default 10).
 * To continue a search, pass in the returned token as a param along with the same search parameters.
 *
 * Only certain attributes are returned in the Postings:
 *      id, status, campus, lostDate, title, campusFull, statusFull
 * for more, run queries to the individual posts /api/posting/:id
 * or change this function to return more attributes
 *
 * Parameters:
 *      [if any are not specified, then assume 'all']
        keywords        - text search through the posting
        status          - exact match
        category        - exact match
        campus          - exact match
        building        - substring search
        room            - substring search
        lostDateStart   - date range, must be parseable by Date()
        lostDateEnd     - date range, must be parseable by Date()
        numPostings: num postings to return. Defaults to 20
        [token]
 */

router.get('/', mongoSanitizeQuery, [
    query('keywords').optional().isString().isLength({min:0, max:256}),
    query('status').optional().isString().isLength({min:0, max:256}),
    query('category').optional().isString().isLength({min:0, max:256}),
    query('campus').optional().isString().isLength({min:0, max:256}),
    query('building').optional().isString().isLength({min:0, max:256}),
    query('room').optional().isString().isLength({min:0, max:256}),
    query('lostDateStart').optional().isString().custom(isDate),
    query('lostDateEnd').optional().isString().custom(isDate),
    query('numPostings').optional().isInt({min:0, max:50}).toInt(),      // possibly make the min/max check a sanitizer
    query('token').optional().isString().custom(isDate),     // while the token is still a date
], async function (req, res, next) {
    if (req.query.numPostings === undefined) {
        req.query.numPostings = 10;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    function createQuery(query) {
        var query = Postings.find();

        if (req.query.keywords) {
            query = query.find({$text: {$search: req.query.keywords}});
            // add textscore as attribute in documents, if we want to sort or filter by it later
            // query = query.select({score: {$meta: "textScore"}});
        }

        if (req.query.status) {
            query = query.where('status').equals(req.query.status);
        }
        if (req.query.category) {
            query = query.where('category').equals(req.query.category);
        }
        if (req.query.campus) {
            query = query.where('campus').equals(req.query.campus);
        }
        if (req.query.building) {
            // the regex is for substring searching
            // the (?i) makes it case insensitive
            var escapedBuilding = "(?i)" + RegexEscape(req.query.building);
            query = query.where('building').regex(escapedBuilding);
        }
        if (req.query.room) {
            // the regex is for substring searching
            // the (?i) makes it case insensitive
            var escapedRoom = "(?i)" + RegexEscape(req.query.room);
            query = query.where('room').regex(escapedRoom);
        }

        if (req.query.lostDateStart) {
            var lostDateStart = new Date(req.query.lostDateStart);
            query = query.where('lostDate').gte(lostDateStart);
        }
        if (req.query.lostDateEnd) {
            var lostDateEnd = new Date(req.query.lostDateEnd);
            query = query.where('lostDate').lte(lostDateEnd);
        }
        if (req.query.token) {
            var tokenDate = new Date(req.query.token);
            query = query.where('lostDate').lt(tokenDate);      // should be fine to have overlapping conditions right?
        }
        query = query.where('lostDate').lte(new Date());
        return query;
    }

    function projectPosting(p) {
        var x = p.toObject();
        // put in some virtuals
        x.id = p.id;
        x.campusFull = p.campusFull;
        x.statusFull = p.statusFull;
        delete x._id;
        return x;
    }

    var results = await createQuery()
        .select('_id status title campus lostDate')
        .sort({lostDate: -1})
        .limit(req.query.numPostings)
        .exec();

    results = results.map(projectPosting);

    if (results.length == 0) {
        //          |    |         |            |
        //  lostStart   token      lostEnd      now
        // pick the earliest time
        function minDate(arr) {
            return arr.filter(x => typeof x != "undefined").reduce((x,y) => ((x>y) ? y : x));
        }
        var token = minDate([
            new Date(req.query.lostDateStart),
            new Date(req.query.lostDateEnd),
            new Date(req.query.token),
            new Date()]);
    } else {
        var token = results[results.length-1].lostDate;
    }

    // return the number of total documents, on the first search
    var numTotal;
    if (!req.query.token) {
        numTotal = await createQuery().count().exec();
    }

    res.json({
        user: req.user.id,
        token: token,
        data: results,
        numTotal: numTotal,
    });
});

module.exports = router;
