const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema({
    admins: [{
        type: String
    }],
    users: [{
        type: String
    }],
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Users", UsersSchema);