const mongoose = require("mongoose");
const fastify = require("fastify")({ logger: true })
const dbConfig = require("./src/config/database");
const mqttService = require("./src/services/mqttService");

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
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
});

// Registro do JWT (JSON Web Token)
fastify.register(require("@fastify/jwt"), {
    secret: process.env.JWT_SECRET,
    cookie: {
        cookieName: "token",
        signed: true
    }
});

// Registro do Cookie
fastify.register(require("@fastify/cookie"), {
    secret: process.env.COOKIE_SECRET,
    hook: "onRequest"
});

// Registro do WebSocket
fastify.register(require("@fastify/websocket"));

// Registro das rotas da API
fastify.register(require("./src/routes/auth"), {prefix: "/api/auth"});
fastify.register(require("./src/routes/users"), {prefix: "/api/users"});
fastify.register(require("./src/routes/alarm"), {prefix: "/api/alarm"});
fastify.register(require("./src/routes/logs"), {prefix: "/api/logs"});

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