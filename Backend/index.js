const mongoose = require("mongoose");
const fastify = require("fastify")({ logger: true })
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

// Configuração do CORS
fastify.register(require("@fastify/cors"), {
    origin: process.env.FRONTEND_URL,
    credentials: true
});

// Registro do JWT (JSON Web Token)
fastify.register(require("@fastify/jwt"), {
    secret: process.env.JWT_SECRET
});

// Registro do Cookie
fastify.register(require("@fastify/cookie"), {
    secret: process.env.COOKIE_SECRET,
    hook: "onRequest"
});

// Registro das rotas da API
fastify.register(require("./src/routes/Auth"), {prefix: "/api"});

// Inicia server Fastify
const startFastify = async () => {
    try{
        await fastify.listen({port: 3000, host: "0.0.0.0"});
        console.log("Servidor Fastify rodando corretamente.");
    } catch(error){
        fastify.log.error(error);
        process.exit(1);
    }
};

startFastify();