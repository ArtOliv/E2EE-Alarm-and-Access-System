const log = require("../models/log");
const members = require("../models/members")
const admins = require("../models/admins")
const command = require("../models/command")
const { addSocketConnection } = require("../services/mqttService")

// Funções auxiliares
async function getSystemLogs(roles, dateFilter, totalToFetch){
    const query = {role: {$in: roles}, ...dateFilter};
    const rawLogs = await log.find(query).sort({createdAt: -1}).limit(totalToFetch).lean();

    return rawLogs.map(l => ({
        id: l._id,
        createdAt: l.createdAt,
        time: new Date(l.createdAt).toLocaleTimeString("pt-BR"),
        date: new Date(l.createdAt).toLocaleDateString("pt-BR"),
        user: l.user_name || "Desconhecido",
        tagId: l.uid === "NONE" ? "-" : l.uid,
        role: l.role,
        status: l.status,
        state: l.state,
        source: "LOG"
    }));
}

async function getCommandLogs(dateFilter, totalToFetch){
    const query = {...dateFilter};
    const rawCmds = await command.find(query).sort({createdAt: -1}).limit(totalToFetch).lean();

    return rawCmds.map(c => ({
        id: c._id,
        createdAt: c.createdAt,
        time: new Date(c.createdAt).toLocaleTimeString("pt-BR"),
        date: new Date(c.createdAt).toLocaleDateString("pt-BR"),
        user: c.admin_name || "Desconhecido",
        tagId: "Dashboard",
        role: "ADMIN",
        status: c.status === "RECEIVED_BY_ESP" ? "AUTHORIZED" : "PENDING", 
        state: c.cmd,
        source: "COMMAND"
    }));
}

module.exports = async function(fastify, options){
    fastify.get("/", async (request, reply) => {
        try{
            await request.jwtVerify();

            const {type = "access", startDate, endDate, page = 1, limit = 20} = request.query;

            const numLimit = Number(limit);
            const numSkip = (Number(page) - 1) * numLimit;
            const totalToFetch = numSkip + numLimit;

            const dateFilter = {};
            if(startDate) dateFilter.$gte = new Date(startDate);
            if(endDate) dateFilter.$lte = new Date(endDate);
            const finalDateFilter = Object.keys(dateFilter).length > 0 ? {createdAt: dateFilter} : {};

            let results = [];

            if(type === "access"){
                const logs = await getSystemLogs(["ADMIN", "USER", "UNKNOWN"], finalDateFilter, totalToFetch);
                results = logs.slice(numSkip, totalToFetch);
            } else if(type === "system"){
                const logs = await getSystemLogs(["SYSTEM"], finalDateFilter, totalToFetch);
                results = logs.slice(numSkip, totalToFetch);
            } else if(type === "command"){
                const cmds = await getCommandLogs(finalDateFilter, totalToFetch);
                results = cmds.slice(numSkip, totalToFetch);
            }

            return reply.send(results);
        } catch(error){
            return reply.status(500).send({error: "Erro interno no servidor."})
        }
    });

    // Rota para escutar respostas via websocket
    fastify.get("/ws", {websocket: true}, (connection, req) => {
        addSocketConnection(connection);
    });
}

