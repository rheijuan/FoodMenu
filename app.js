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

// ---- ROUTING ----

// Homepage
app.get('/', (req, res) => {

    Employee.find().then((result) => {
        res.render('index' , {employees: result})
    })
})

// Create Page
app.get('/employee/create', (req, res) => {
    res.render('create')
})

// Update User
app.get('/employee/update', (req, res) => {
    res.render('update')
})

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

// 3. Delete Employee (from UI)
app.delete('/employee/:id', (req, res) => {
    const id = req.params.id
    
    Employee.findByIdAndDelete(id).then(result => {
        res.json({ redirect: '/'})
    }).catch(err => {
        console.log(err)
    })
})

// 4. Update information about user
app.post('/updateEmployee', (req, res) => {
    const id = req.params.id
    Employee.findOneAndUpdate(id, req.body)
    .then(result => {
        Employee.find().then((result) => {
            res.render('index' , {employees: result})
        })
    }).catch(err => {
        console.log(err)
    })
})

// 5. Search for employee based on ID ()
app.get('/employee/:id', (req, res) => {
    const id = req.params.id
    Employee.findById(id).then(result => {
        res.render('details', {employee: result})
    }).catch(err => {
        console.log(err)
    })
})