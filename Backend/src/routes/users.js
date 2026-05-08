const admin = require("../models/admins")
const members = require("../models/members")
const { syncUsers } = require("../services/mqttService");

module.exports = async function(fastify, options){
    // Rota para criar administradores
    fastify.post("/create-admin", async (request, reply) => {
        try{
            await request.jwtVerify();

            if(request.user.role !== "MASTER"){
                return reply.status(403).send({error: "Acesso negado."});
            }

            const {name, email, password, rfid_tag} = request.body;

            if(!name || !email || !password){
                return reply.status(400).send({error: "Nome. e-mail e senha são obrigatórios."});
            }

            const existingAdmin = await admin.findOne({email});
            if(existingAdmin){
                return reply.status(409).send({error: "Este e-mail já está em uso."});
            }

            if(rfid_tag){
                const existingTag = await admin.findOne({rfid_tag});
                if(existingTag){
                    return reply.status(409).send({error: "Este Tag ID já está em uso."});
                }
            }

            const newAdmin = new admin({
                name,
                email,
                password,
                rfid_tag: rfid_tag ? rfid_tag.toUpperCase().trim() : undefined,
                role: "ADMIN"
            });

            await newAdmin.save();

            if(rfid_tag){
                await syncUsers();
            }

            return reply.status(201).send({message: "Administrador criado com sucesso!"});
        } catch(error){
            console.error("ERRO FATAL AO CRIAR ADMIN:", error);

            return reply.status(500).send({error: "Erro interno do servidor ao cadastrar."});
        }
    });

    // Rota para listar administradores
    fastify.get("/admins", async (request, reply) => {
        try{
            await request.jwtVerify();

            if(request.user.role !== "MASTER"){
                return reply.status(403).send({error: "Acesso negado."});
            }

            const adminsList = await admin.find({_id: {$ne: request.user.id}}).select("-password");

            return reply.send(adminsList);
        } catch(error){
            return reply.status(500).send({error: "Erro ao buscar administradores."});
        }
    });

    // Rota para excluir administradores
    fastify.delete("/admin/:id", async (request, reply) => {
        try{
            await request.jwtVerify();

            if(request.user.role !== "MASTER"){
                return reply.status(403).send({error: "Acesso negado."});
            }

            const {id} = request.params;
            const adminToDelete = await admin.findById(id);

            if(!adminToDelete){
                return reply.status(404).send({error: "Administrador não encontrado."});
            }

            if(adminToDelete.role === "MASTER"){
                return reply.status(403).send({error: "Não é possível excluir a conta Mestre."});
            }

            const hadTag = adminToDelete.rfid_tag;

            await admin.findByIdAndDelete(id);

            if(hadTag){
                await syncUsers();
            }

            return reply.send({message: "Administrador removido com sucesso!"});
        } catch(error){
            return reply.status(500).send({error: "Erro ao remover administrador."});
        }
    });
};