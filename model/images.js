var mongoose = require('mongoose');

var imageSchema = new mongoose.Schema({
    b64data : String,
});

/*
    save images from base 64 format
    "data:image/png;base64, iVBORw0KGgoAAAANS .... "
*/
imageSchema.statics.saveImageFromB64 = function(b64image) {
    return this.insertMany({        // there is no insertOne
        b64data : b64image
    }).then(result => result[0]._id);
};

imageSchema.statics.getImageB64 = function (imageid) {
    return this
        .findOne({_id: imageid}, {b64data: 1})
        .then(doc => doc.b64data);
}

var imageModel = mongoose.model('Image', imageSchema);
module.exports = imageModel;


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


// var fs = require('fs');
// var path = require('path');
// const uuidv4 = require('uuid').v4;

// var IMAGE_DIRECTORY = path.join(__dirname, '../uploads/images');       // todo: move to a better location 

// var imageModel = {
//     // saveImageFromFile : async function(filepath, ext) {
//     //     var new_id = uuidv4();
//     //     var new_filename = new_id + ext;
//     //     console.log(filepath, new_filename, path.join(IMAGE_DIRECTORY, new_filename));
//     //     fs.renameSync(filepath, path.join(IMAGE_DIRECTORY, new_filename));
//     //     return new_filename;
//     // },

//     saveImageFromB64 : async function(b64) {

//     },
    
//     getImageUrl : function(id) {
//         return `/images/${id}`;
//     },

//     getIds : function() {
//         return fs.readdirSync(IMAGE_DIRECTORY).map((filename) => {
//             return path.parse(filename).name;
//         });
//     }
// };

// module.exports = imageModel;
