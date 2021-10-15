const mongoose = require('mongoose')
const Schema = mongoose.Schema

const foodSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    availability: {
        type: Boolean,
        defaultValue: false,
        required: true
    }
})

const Food = mongoose.model('Food', foodSchema)
module.exports = Food