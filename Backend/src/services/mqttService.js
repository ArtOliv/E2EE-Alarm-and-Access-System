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
const broadcastAlarmAck = (cmd) => {
    const payload = JSON.stringify({event: "cmd_ack", cmd: cmd});
    
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
                    broadcastAlarmAck(updateCmd.cmd);
                }
            } else if(topic === "system/alarm/log"){
                await log.create(data);
                console.log(`Log salvo: [${data.status}] ID: ${data.device_id}`);
                
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
    // Cria o comando no banco de dados
    const newCommand = await command.create({
        cmd: action,
        admin_id: adminId,
        status: "SENT"
    });

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