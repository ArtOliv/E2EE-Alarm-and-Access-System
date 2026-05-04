const dbConfig = require("./src/config/Database")
const mongoose = require("mongoose")
const admin = require("./src/models/Admins")

async function seedMasterAdmin(){
    try{
        await mongoose.connect(dbConfig.url, dbConfig.options);

        // Verifica se MASTER já existe no banco
        const adminExists = await admin.findOne({email: "master@sistema.com"});
        if(adminExists){
            process.exit(0);
        }

        // Cria Admin MESTRE
        const masterAdmin = new admin({
            name: "Admin Mestre",
            email: "mestre@sistema.com",
            password: "admin",
            role: "MASTER"
        });

        await masterAdmin.save();
    } catch(error){
        console.error("Erro ao criar Admin MESTRE:", error);
    } finally {
        mongoose.disconnect();
    }
}

seedMasterAdmin();