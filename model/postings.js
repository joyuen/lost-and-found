var mongoose = require('mongoose');

// Create an object type UserException
function DatabaseException(message) {
    this.message = message;
    this.name = 'DatabaseException';
}

// Make the exception convert to a pretty string when used as a string
// (e.g., by the error console)
DatabaseException.prototype.toString = function() {
    return `${this.name}: "${this.message}"`;
}

//---------------------------------------
//  Posting Model
//---------------------------------------
// custom mongoose types
function string_not_empty(length) {       // String that must contain content in it
    return {
        type: String,
        required: true,
        minlength: 1,
        maxlength: length,
    };
}

function string_optional(length) {       // String that can be left blank
    return {
        type: String,
        maxlength: length,
        default: '',
    };
}

const point_schema = new mongoose.Schema({
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  });

const posting_schema = new mongoose.Schema({
    title: string_not_empty(256),
    category: string_not_empty(256),
    description: string_optional(2000),
    status: {
        type: String,
        required: true,
        enum: ["lost", "found", "stolen", "returned"],
    },

    campus: {
        type: String,
        required: true,
        enum: ["surrey", "burnaby", "vancouver"],
    },
    building: string_optional(256),       // todo: add verification on this
    room: string_optional(256),
    location: string_optional(256),
    coordinates: {
        type: point_schema,
        required: true,
    },

    creationDate: {type: Date, required: true},
    lostDate: {type: Date, required: true},
    returnDate: {type: Date}, // this will be set later when the item is returned
    tags: [String],           // ML tags based on the image, can be empty
    imageID: string_optional(256),
    postedBy: string_not_empty(256),
});

// Create indexes
posting_schema.index({ title: "text", category: "text", description: "text", tags: "text"}, {name: "keyword_index"});

// Custom validators
posting_schema.path('lostDate').validate(function (v) {
    return (new Date(this.lostDate) <= new Date(this.creationDate));
});

posting_schema.path('returnDate').validate(function (v) {
    return (new Date(this.lostDate) <= new Date(this.returnDate));
});

posting_schema.path('returnDate').validate(function (v) {
    return (this.status == "returned");
});

// Virtual attributes
posting_schema.virtual('id').get(function() {
    return this._id;        // maybe do something fancy with it later
})

posting_schema.virtual('campusFull').get(function() {
    switch (this.campus) {
        case "surrey": return "Surrey Campus";
        case "burnaby": return "Burnaby Campus";
        case "vancouver": return "Vancouver Campus";
    }
});

posting_schema.virtual('statusFull').get(function() {
    // just capitalize the first letter, nothing special yet
    return this.status[0].toUpperCase() + this.status.slice(1);
});

// Helper queries
posting_schema.statics.deleteById = function(id) {
    var database_id = id;
    return this.deleteOne({_id: database_id});
};

/**
 *  Add a posting to the database
 *  @param {object} posting - attributes to construct the posting document with (see schema)
 *  @returns id of the posting just created
 *  @throws validation error if posting is invalid
 */
posting_schema.statics.addPosting = async function(posting) {
    return this.create(posting).then(doc => {
        return doc.id;
    });
};

/**
 *  @returns cursor to iterate through all postings
 */
posting_schema.statics.getAllPostings = async function() {
    var query = Postings.find();
    return query.exec();
};

/**
 * @param {string} id - the posting id
 * @returns posting corresponding to the id
 */
posting_schema.statics.getPostingById = async function(posting_id) {
    // turn posting id -> _id attribute in database
    // but they're the same right now, so nothing fancy
    var database_id = posting_id;
    var query = Postings.find({_id: database_id}).limit(1);
    return query.exec().then(docs => {
        if (docs.length == 0) {
            throw DatabaseException(`no posting with id ${posting_id} found`);
        }
        return docs[0];
    });
};

/**
 *  @returns cursor to iterate through all postings within coordinates
 */
posting_schema.statics.getPostingsWithin = async function(n,s,w,e) {
    var query = Postings.find({coordinates:{$geoWithin:{$box:[[w,s],[e,n]]}}},{creationDate:0, __v:0});
    return query.exec();
};

posting_schema.statics.updatePosting = async function(id, attrs) {
    // I can't figure out mongoose's update validators, so we're doing it manually and turning off validation
    var post = await Postings.getPostingById(id);
    for (let [key,val] of Object.entries(attrs)) {
        post[key] = val;
    }

    var err = post.validateSync();
    if (err) {
        throw err;
    }

    return await Postings.findOneAndUpdate(
        {_id: id},
        post
    ).exec();

};

posting_schema.methods.getLink = function() {
    return `/viewpost/?id=${this.id}`;
};

var Postings = mongoose.model('posting', posting_schema);
module.exports = Postings;
