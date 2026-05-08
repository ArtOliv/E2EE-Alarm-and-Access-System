const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    rfid_tag: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true   
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Member", MemberSchema);