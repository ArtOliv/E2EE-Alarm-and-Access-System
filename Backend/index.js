const mongoose = require("mongoose");
const dbConfig = require("./src/config/Database");
const mqttService = require("./src/services/MqttService");

// Conecta ao MongoDb
mongoose.connect(dbConfig.url, dbConfig.options)
    .then(() => {
        console.log("Conectado ao MongoDB com sucesso!");
        // Inicializa as rotinas MQTT
        mqttService.initMqttLogic();
    })
    .catch(err => {
        console.log("Erro ao conectar com o MongoDB:", err);
        process.exit(1);
    });
