const mongoose = require('mongoose')
const Schema = mongoose.Schema

const requestSchema = new Schema({
    userID: {
        type: String,
        require: true
    },
    product: {
        type: String,
        lowercase: true
    },
    amount: {
        type: Number,
        default: 0 
    },
    price: {
        type: Number,
        require: true
    }
}, { timestamps: true}) // otomatik olarak verinin eklendigi tarihi kaydeder

const Requests = mongoose.model('Requets', requestSchema)
module.exports = Requests