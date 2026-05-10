const admins = require("../models/admins")
const members = require("../models/members")
const { syncUsers } = require("../services/mqttService")

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

            const existingAdmin = await admins.findOne({email});
            if(existingAdmin){
                return reply.status(409).send({error: "Este e-mail já está em uso."});
            }

            if(rfid_tag){
                const existingTag = await admins.findOne({rfid_tag});
                if(existingTag){
                    return reply.status(409).send({error: "Este Tag ID já está em uso."});
                }
            }

            const newAdmin = new admins({
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

            const adminsList = await admins.find({_id: {$ne: request.user.id}}).select("-password").sort({createdAt: -1});

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
            const adminToDelete = await admins.findById(id);

            if(!adminToDelete){
                return reply.status(404).send({error: "Administrador não encontrado."});
            }

            if(adminToDelete.role === "MASTER"){
                return reply.status(403).send({error: "Não é possível excluir a conta Mestre."});
            }

            const hadTag = adminToDelete.rfid_tag;

            await admins.findByIdAndDelete(id);

            if(hadTag){
                await syncUsers();
            }

            return reply.send({message: "Administrador removido com sucesso!"});
        } catch(error){
            return reply.status(500).send({error: "Erro ao remover administrador."});
        }
    });

    // Rota para criar membros
    fastify.post("/create-member", async (request, reply) => {
        try{
            await request.jwtVerify();

            const {name, rfid_tag} = request.body;

            if(!name || !rfid_tag){
                return reply.status(400).send({error: "Nome e Tag ID são obrigatórios."});
            }

            const tagToSave = rfid_tag.toUpperCase().trim();

            const existingMemberTag = await members.findOne({rfid_tag: tagToSave});
            if(existingMemberTag){
                return reply.status(409).send({error: "Este Tag ID já está em uso."});
            }

            const existingAdminTag = await admins.findOne({rfid_tag: tagToSave});
            if(existingAdminTag){
                return reply.status(409).send({error: "Este Tag ID já está em uso."});
            }

            const newMember = new members({
                name,
                rfid_tag: tagToSave
            });

            await newMember.save();
            await syncUsers();

            return reply.status(201).send({message: "Usuário cadastrado com sucesso!"});
        } catch(error){
            return reply.status(500).send({error: "Erro interno do servidor ao cadastrar."});
        }
    });

    // Rota para listar membros
    fastify.get("/members", async (request, reply) => {
        try{
            await request.jwtVerify();

            const memberList = await members.find({}).sort({createAt: -1});
            return reply.send(memberList);
        } catch(error){
            return reply.status(500).send({error: "Erro ao buscar membros."});
        }
    });

    // Rota para excluir membros
    fastify.delete("/member/:id", async (request, reply) => {
        try{
            await request.jwtVerify();

            const {id} = request.params;
            const memberToDelete = await members.findById(id);

            if(!memberToDelete){
                return reply.status(404).send({error: "Usuário não encontrado."});
            }

            await members.findByIdAndDelete(id);
            await syncUsers();

            return reply.send({message: "Usuário removido com sucesso!"});
        } catch(error){
            return reply.status(500).send({error: "Erro ao remover usuário."});
        }
    });
};