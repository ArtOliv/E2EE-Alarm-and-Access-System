const admin = require("../models/admins")

module.exports = async function(fastify, options){
    // Rota de login
    fastify.post("/login", async(request, reply) => {
        const {email, password} = request.body;

        if(!email || !password){
            return reply.status(400).send({error: "E-mail e senha são obrigatórios."});
        }

        try{
            const adminAuth = await admin.findOne({email}).select("+password");

            if(!adminAuth){
                return reply.status(401).send({error: "E-mail ou senha incorretos."})
            }

            const isMatch = await adminAuth.comparePassword(password);
            if(!isMatch){
                return reply.status(401).send({error: "E-mail ou senha incorretos."})
            }

            // Gera JWT
            const token = fastify.jwt.sign({
                id: adminAuth._id,
                role: adminAuth.role,
                name: adminAuth.name
            }, {expiresIn: "12h"});

            // Envia o JWT em um Cookie
            reply.setCookie("token", token, {
                path: "/",
                httpOnly: true, // Proteção XSS, JS do navegador não lê o cookie
                secure: false,
                sameSite: "lax", // Proteção contra ataques CSRF
                maxAge: 12 * 60 * 60, // 12 horas em segundos
                signed: true // Aplica assinatura dupla no cookie
            });

            return reply.send({
                message: "Login realizado com sucesso",
                user: {
                    id: adminAuth._id,
                    name:adminAuth.name,
                    email: adminAuth.email,
                    role: adminAuth.role
                }
            });
        } catch(error){
            fastify.log.error(error);
            return reply.status(500).send({error: "Erro interno do servidor."});
        }
    });

    // Rota de verificação da sessão
    fastify.get("/verify", async (request, reply) => {
        try{
            // Verifica assinatura do coookie e JWT e se expirou
            await request.jwtVerify();

            return reply.send({
                message: "Sessão válida",
                user: request.user
            });
        } catch(error){
            return reply.status(401).send({error: "Sessão inválida ou expirada."});
        }
    });

    // Rota de logout
    fastify.post("/logout", async (request, reply) => {
        reply.clearCookie("token", {
            path: "/",
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            signed: true
        });

        return reply.send({message: "Logout realizado com sucesso"});
    });
}