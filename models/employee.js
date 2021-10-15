const mongoose = require('mongoose')
const Schema = mongoose.Schema

const employeeSchema = new Schema({
    name: String,
    birthday: String,
    sex: String,
    projects: [],
    address: String,
    dateHired: String
})

const Employee = mongoose.model('Employee', employeeSchema)
module.exports = Employee