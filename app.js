const express = require('express')
const mongoose = require('mongoose')
const Employee = require('./models/employee')
const Project = require('./models/project')

// express app
const app = express()

// register view engine
app.set('view engine', 'ejs')

// middleware
app.use(express.urlencoded())

// connect to mongodb
const dbURI = 'mongodb+srv://root:root@foodmenuapp.7r05l.mongodb.net/Items?retryWrites=true&w=majority'
mongoose.connect(dbURI)
    .then((result) => app.listen(3000))
    .catch((err) => console.log(err))

// ---- EMPLOYEE APIs ----

// 1. Add Employee (manual)
app.post('/add-employee', (req, res) => {
    const employee = new Employee({
        name: 'John Doe',
        birthday: '01-01-2000',
        sex: 'M',
        projects: [],
        address: 'Manila',
        dateHired: '01-01-2020'
    })

    employee.save().then((result) => {
        res.send(result)
    }).catch((err) => {
        console.log(err)
    })

    console.log("Added employee manually")
})

// 2. Add Employee (via UI)
app.post('/employees', (req,res) => {

    const employee = new Employee(req.body)
    employee.save().then((result) => {
        console.log('Adding employee through UI')
        res.redirect('/')
    }).catch((err) => {
        console.log(err)
    })
})

// 3. Delete Employee (manual)


// ---- ROUTING ----

// Homepage
app.get('/', (req, res) => {
    res.render('index')


})

// Create Page
app.get('/employee/create', (req, res) => {
    res.render('create')
})



/*

// Adding food
app.get('/add-food', (req, res) => {
    const food = new Food({
        name: 'Pizza',
        price: 300,
        description: 'Peperroni Pizza',
        availability: true
    })

    food.save().then((result) => {
        res.send(result)
    }).catch((err) => {
        console.log(err)
    })

    console.log("Added food")
})

// Find single food by ID
app.get('/single-food', (req,res) => {
    Food.findById('6168f28276e9d30d3542e627')
    .then((result) => {
        res.send(result)
    }).catch((err) => {
        console.log(err)
    })
})

// Add food through UI
app.post('/addFood', (req,res) => {
    console.log('Adding food through submit')

    const food = new Food(req.body)
    food.save().then((result) => {
        console.log('Successful ')
        res.redirect('/')
    }).catch((err) => {
        console.log(err)
    })
})
*/