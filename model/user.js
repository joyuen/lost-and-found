var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    id: String,
    name: String,
    phone: String,
    admin: {
        type: Boolean,
        default: false
    },
});

userSchema.virtual('email').get(function () {
    return this.id + '@sfu.ca';
});

var User = mongoose.model('User', userSchema);

module.exports = User;
