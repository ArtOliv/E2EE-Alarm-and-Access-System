const mqttClient = require("../mqtt/mqttClient");
const command = require("../models/command");
const log = require("../models/log");
const users = require("../models/users");
const admins = require("../models/admins")
const members = require("../models/members")

// Cria uma lista que guarda os clientes conectados
const activeSockets = new Set();

// Adiciona novo cliente que abre a interface
const addSocketConnection = (socket) => {
    activeSockets.add(socket);

    // Exclui usuário ao fechar a interface
    socket.on("close", () => {
        activeSockets.delete(socket);
    });
};

// Dispara mensagem para todo cliente conectado
const broadcastAlarmAck = (id, cmd, status) => {
    const payload = JSON.stringify({event: "cmd_ack", id: id, cmd: cmd, status: status});
    
    for(const socket of activeSockets){
        if(socket && socket.readyState === 1){
            socket.send(payload);
        }
    }
};

// Dispara novo log em tempo real
const broadcastNewLog = (logDoc, source) => {
    const payload = JSON.stringify({
        event: "new_log",
        log: {
            id: logDoc._id,
            time: new Date(logDoc.createdAt).toLocaleTimeString("pt-BR"),
            date: new Date(logDoc.createdAt).toLocaleDateString("pt-BR"),
            user: logDoc.user_name || logDoc.admin_name || "Desconhecido",
            tagId: source === "COMMAND" ? "Dashboard" : (log.uid === "NONE" ? "-" : logDoc.uid),
            role: source === "COMMAND" ? "ADMIN" : logDoc.role,
            status: source === "COMMAND" ? (logDoc.status === "RECEIVED_BY_ESP" ? "AUTHORIZED" : "PENDING") : logDoc.status,
            state: source === "COMMAND" ? logDoc.cmd : logDoc.state,
            source: source
        }
    });

    for(const socket of activeSockets){
        if(socket && socket.readyState === 1){
            socket.send(payload);
        }
    }
};

// Trata o que for recebido nos tópicos pelo ESP32
const initMqttLogic = () => {
    mqttClient.on("message", async (topic, payload) => {
        const messageStr = payload.toString();

        try{
            const data = JSON.parse(messageStr);

            if(topic === "system/alarm/cmd/ack"){
                const updateCmd = await command.findByIdAndUpdate(
                    data.cmd_id, 
                    {status: "RECEIVED_BY_ESP"},
                    {new: true}
                );

                console.log(`Comando ${data.cmd_id} confirmado pelo ESP32.`);
            
                if(updateCmd){
                    broadcastAlarmAck(updateCmd._id, updateCmd.cmd, "AUTHORIZED");
                }
            } else if(topic === "system/alarm/log"){
                let resolvedName = "Desconhecido";

                if(data.role === "SYSTEM"){
                    resolvedName = "Sistema";
                } else if(data.role === "ADMIN" || data.role === "USER"){
                    const safeUid = data.uid && data.uid !== "NONE" ? data.uid.toUpperCase().trim() : null;
                    if(safeUid){
                        const adminMatch = await admins.findOne({rfid_tag: safeUid}).lean();
                        if(adminMatch){
                            resolvedName = adminMatch.name;
                        } else {
                            const memberMatch = await members.findOne({rfid_tag: safeUid}).lean();
                            if(memberMatch) resolvedName = memberMatch.name;
                        }
                    }
                }

                data.user_name = resolvedName;

                const savedLog = await log.create(data);
                console.log(`Log salvo: [${data.status}] ID: ${data.device_id} Usuário: ${resolvedName}`);

                broadcastNewLog(savedLog, "LOG");
                
                // Trata sincronização com o ESP32
                if(data.role === "SYSTEM" && data.status === "INFO_BOOT"){
                    const userConfig = await users.findOne();

                    if(userConfig){
                        const payloadUsers = JSON.stringify({
                            admins: userConfig.admins,
                            users: userConfig.users
                        });

                        mqttClient.publish("system/alarm/config/users", payloadUsers);
                    } else {
                        console.log("Nenhuma configuração de usuários no banco para sincronizar.");
                    }
                }
            }
        } catch(err){
            console.error("Erro ao processar mensagem MQTT:", err);
        }
    });
};

// Trata o que for enviado para o ESP32
const sendAlarmCommand = async (adminId, action) => {
    // Busca o nome do admin
    const adminUser = await admins.findById(adminId).lean();
    const adminName = adminUser.name;

    // Cria o comando no banco de dados
    const newCommand = await command.create({
        cmd: action,
        admin_id: adminId,
        admin_name: adminName,
        status: "SENT"
    });

    broadcastNewLog(newCommand, "COMMAND");

    // Envia o JSON para o ESP32
    const payload = JSON.stringify({
        cmd: action,
        cmd_id: newCommand._id
    });

    mqttClient.publish("system/alarm/cmd", payload);
    console.log(`Comando ${action} enviado ao ESP32.`);

    return newCommand;
};

// Atualiza a lista de usuários autorizados no banco de dados e sicroniza com o ESP32
const updateUserConfig = async (admins, authorizedUsers) => {
    try{
        const updatedConfig = await users.findOneAndUpdate(
            {}, // Filtro vazio, pega o único documento
            {
                admins: admins,
                users: authorizedUsers,
                updatedAt: Date.now()
            },
            {
                upsert: true, // Se não existir cria documento
                new: true, // retorna documento atualizado
                setDefaultsOnInsert: true // Aplica valores default do Schema
            }
        );
        
        // Envia via MQTT para o ESP32 a nova configuração de usuários
        const payloadUsers = JSON.stringify({
            admins: updatedConfig.admins,
            users: updatedConfig.users
        });

        mqttClient.publish("system/alarm/config/users", payloadUsers);

        return updatedConfig;
    } catch(err){
        console.error("Erro ao atualizar configuração de usuários:", err);
        throw err;
    }
};

const syncUsers = async () => {
    try{
        // Busca tags existentes de Administradores
        const adminDocs = await admins.find({});
        const adminTags = adminDocs.map(a => a.rfid_tag).filter(tag => tag != null && tag.trim() !== "");

        // Busca tags de Membros
        const memberDocs = await members.find({});
        const memberTags = memberDocs.map(m => m.rfid_tag).filter(tag => tag != null && tag.trim() !== "");

        await updateUserConfig(adminTags, memberTags);

        return true;
    } catch(error){
        console.error("Erro na sincronização automática das tags:", error);
        throw error;
    }
}

module.exports = { initMqttLogic, sendAlarmCommand, updateUserConfig, syncUsers, addSocketConnection };