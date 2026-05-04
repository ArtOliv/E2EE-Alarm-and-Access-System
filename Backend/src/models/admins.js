const mongoose = require("mongoose");
bcrypt = require("bcrypt");

const AdminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: ["MASTER", "ADMIN"],
        default: "ADMIN"
    },
    rfid_tag: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Trigger que roda antes de salvar o documento no banco de dados
AdminSchema.pre("save", async function(next){
    // Se senha não modificada pula o hash
    if(!this.isModified("password")){
        return next();
    }

    try{
        // Gera fator de aleatoriedade (salt) e cria hash
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch(err){
        return next(err);
    }
});

// Compara a senha digitada com a hash do banco para validação
AdminSchema.methods.comparePassword = async function(candidatePassword){
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Admin", AdminSchema);