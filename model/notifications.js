var mongoose = require('mongoose');

var UserId = String;
var notifSchema = new mongoose.Schema({
    message : String,       // HTML string
    sent : Date,
    recipients : [UserId],
});

notifSchema.statics.send = async function(message, users) {
    if (typeof users === "string") {
        users = [users];
    }

    return this.insertMany({        // there is no insertOne
        message: message,
        sent: new Date(),
        recipients: users,
    });
};

notifSchema.statics.read = async function(userid) {
    return this
        .find({recipients: userid}, {_id: 1, message: 1, sent: 1})
        .sort({sent: -1});
};

notifSchema.statics.remove = async function(userid, notifid) {
    return this.updateOne(
        {_id: notifid},
        { $pull: {recipients: userid}}
    );
};

notifSchema.statics.removeMany = async function(userid, notifids) {
    return this.updateMany(
        {_id: {$in: notifids}},
        { $pull: {recipients: userid}}
    );
};

notifSchema.statics.removeAll = async function(userid) {
    return this.updateMany(
        {},
        { $pull: {recipients: userid}}
    );
};

notifSchema.statics.clean = async function(userid) {
    return this.deleteMany(
        {recipients: {$size: 0}}
    );
};

notifSchema.statics.sendFoundMessage = async function(post) {
    return this.send(
        `An item you were looking for has been found! <a href='${post.getLink()}' target='_blank'>${post.title}</a>`,
        post.postedBy
    );
};

var NotifModel = mongoose.model('Notification', notifSchema);
module.exports = NotifModel;


// recipients : [{
//     user: UserId,
//     deleted: Boolean,
// }],    
    // return this.find({
    //     recipients: {$elemMatch: {user: userid, deleted: false}}
    // });
// this is to remove any users
    // return this.update(
    //     {_id: notifid},
    //     { $pull: { recipients: {$elemMatch: {user: userid}}}},
    // })
    // notifSchema.statics.send = function(message, users) {
    //     var recipients = users.map(u => ({user: u, deleted: false}));
    //     return this.insertMany({
    //         message: message,
    //         sent: new Date(),
    //         recipients: recipients,
    //     });
    // };