require('dotenv').config();

module.exports = {
    url: process.env.MQTT_URL || 'mqtt://mosquitto:1883',
    options: {
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
    }
};