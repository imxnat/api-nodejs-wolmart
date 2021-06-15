require('dotenv').config();

const Mongoose = require('mongoose');   //conexion a DB
const bcrypt = require('bcrypt');      //encriptar password
const jwt = require('jsonwebtoken');  //tokens de auth
//destructuracion de variables de entorno que necesito
const {ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET} = process.env;

const Token = require('./token.model');


// Crear modelo esquema (schema)
const UserSchema = new Mongoose.Schema({
    //parámetros que va a recibir
    username:{ type: String, required: true, unique: true},
    password: { type: String, required: true },
    name: { type: String }
});

// Método para definir que es lo queremos que pase cuando se inserte un nuevo usuario
UserSchema.pre('save', function(next){

    //validamos si lo que insertamos es un nuevo doc o uno ya existente
    if(this.isModified('password') || this.isNew){
        const document = this;

        bcrypt.hash(document.password, 10, function(err, hash) {
            if(err){
                next(err);
            }else{
                document.password = hash;
                next();
            }
        });
    } 
});

// Definir metodo personalizado
// 1. Para saber si ya existe un nombre de usuario

UserSchema.methods.usernameExists = async function(username){
    try{
        let result = await Mongoose.model('User').find({username: username});

        return result.length > 0;

    }catch(ex){

        return false;
    }
};

// 2. Validar que la password sea correcta

UserSchema.methods.isCorrectPassword = async function(password, hash){
    
    try{
        const same = await bcrypt.compare(password, hash);

        return same;

    }catch(ex){
        return false;
    }
}

// Metodo para crear el access token
UserSchema.methods.createAccessToken = function(){
    const {id, username} = this;

    const accessToken = jwt.sign(
        { user: {id, username} },
        ACCESS_TOKEN_SECRET,
        {expiresIn: '1d'}
    );

    return accessToken;
}

//Metodo para crear refresh token
UserSchema.methods.createRefreshToken = async function(){
    const {id, username} = this;

    const refreshToken = jwt.sign(
        { user: {id, username} },
        REFRESH_TOKEN_SECRET,
        {expiresIn: '20d'}
    );

    try{
        
        await new Token({token: refreshToken}).save();

        return refreshToken;

    }catch(ex){
        next(new Error('Error creating refresh token'));
    }
}

