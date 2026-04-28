const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
    device_id: {
        type: String,
        index: true,
        required: true
    },
    uid: {
        type: String,
        default: "NONE"
    },
    role: {
        type: String,
        enum: ["SYSTEM", "ADMIN", "USER", "UNKNOWN"],
        required: true
    },
    status: {
        type: String,
        enum: ["OFFLINE", "INFO_BOOT", "AUTHORIZED", "UNAUTHORIZED", "ALARM_TRIGGERED"],
        required: true
    },
    state: {
        type: String,
        enum: ["ARMED", "DISARMED", "TRIGGERED"],
        required: true
    },
    esp_timestamp: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: "60d" // TTL - apaga logs após 60 dias
    }
});

module.exports = mongoose.model("Log", LogSchema);