const { Connection } = require("mongoose");
const { sendAlarmCommand, addSocketConnection } = require("../services/mqttService");
const command = require("../models/command");

module.exports = async function(fastify, options){
    // Rota para enviar comnado de controle do alarme
    fastify.post("/command", async (request, reply) => {
        try{
            await request.jwtVerify();

            const {cmd} = request.body;

            if(!cmd || (cmd !== "ARM" && cmd !== "DISARM")){
                return reply.status(400).send({error: "Comando inválido."});
            }

            await sendAlarmCommand(request.user.id, cmd);
            return reply.send({message: "Comando enviado."});
        } catch(error){
            return reply.status(500).send({error: "Erro interno do servidor."});
        }
    });

    // Rota para buscar estado do alarme
    fastify.get("/status", async (request, reply) => {
        try{
            await request.jwtVerify();

            const lastCommand = await command.findOne({status: "RECEIVED_BY_ESP"}).sort({createdAt: -1});

            const isArmed = lastCommand ? lastCommand.cmd === "ARM" : false;

            return reply.send({isArmed});
        } catch(error){
            return reply.status(500).send({error: "Erro interno do servidor."});
        }
    });

    // Rota para escutar respostas via websocket
    fastify.get("/ws", {websocket: true}, (connection, req) => {
        addSocketConnection(connection);
    });
}

