//Schema para Validar que el token existe para poder hacer refresh

const Mongoose = require('mongoose');

const TokenSchema = new Mongoose.Schema({
    token: {type: String}
});

module.exports = Mongoose.model('Token', TokenSchema);
