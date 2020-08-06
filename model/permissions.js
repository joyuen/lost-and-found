module.exports = {
    canEdit: function (user, posting) {
        if (user.admin) {
            return true;
        }
        if (posting.postedBy == user.id) {
            return true;
        }
        return false;
    },

    canReturn: function (user, posting) {
        return this.canEdit(user, posting) && posting.status != "returned";
    },

    canNotifyFound: function (user, posting) {
        return user.admin && (posting.status == "lost" || posting.status == "stolen");
    }
};