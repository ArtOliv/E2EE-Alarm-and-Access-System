const mqtt = require("mqtt");
const mqttConfig = require("../config/mqtt");

const client = mqtt.connect(mqttConfig.url, mqttConfig.options);

client.on("connect", () => {
    console.log("Backend conectado ao Broker MQTT");

    const topics = ["system/alarm/log", "system/alarm/cmd/ack"];

    // Subscreve nos tópicos
    client.subscribe(topics, (err) => {
        if(!err){
            console.log("Inscrito nos tópicos corretamente")
        }
    });
});

module.exports = client;