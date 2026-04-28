const mongoose = require("mongoose");

const CommandSchema = new mongoose.Schema({
    cmd: {
        type: String,
        enum: ["ARM", "DISARM"],
        required: true
    },
    admin_id: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["SENT", "RECEIVED_BY_ESP"],
        default: "SENT"
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: "60d" // TTL - apaga log de comandos após 60 dias
    }
});

module.exports = mongoose.model("Command", CommandSchema);