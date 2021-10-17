const express = require('express')
const mongoose = require('mongoose')
const Employee = require('./models/employee')
const Project = require('./models/project')

// express app
const app = express()

// express extend
app.engine('ejs', require('express-ejs-extend'));

// register view engine
app.set('view engine', 'ejs')

// middleware
app.use(express.urlencoded())

// connect to mongodb
const dbURI = 'mongodb+srv://root:root@foodmenuapp.7r05l.mongodb.net/Items?retryWrites=true&w=majority'
mongoose.connect(dbURI)
    .then((result) => app.listen(3000))
    .catch((err) => console.log(err))

// ------------ ROUTING ------------

// ---- HOMEPAGE ----

app.get(['/', '/employees'], (req, res) => {
    Employee.find().then((result) => {
        res.render('index' , {employees: result})
    })
})

// ---- EMPLOYEE ----

// Add Page
app.get('/employees/add', (req, res) => {
    res.render('employee/add')
})

// Details Page
app.get('/employees/:id', (req, res) => {
    const id = req.params.id
    Employee.findById(id).then(result => {
        res.render('employee/details', {employee: result})
    }).catch(err => {
        console.log(err)
    })
})

// Update Page
app.get('/employees/update/:id', (req, res) => {
    const id = req.params.id
    Employee.findById(id).then(result => {
        res.render('employee/update', {employee: result})
    }).catch(err => {
        console.log(err)
    })
})

// Add employee to a project Page
app.get('/employees/addToProject/:id', (req, res) => {
    const id = req.params.id
    Employee.findById(id).then(result => {
        res.render('employee/addToProject', {employee: result})
    }).catch(err => {
        console.log(err)
    })
})

// ---- PROJECTS ----

// Display Page (index for projects)
app.get('/projects', (req, res) => {
    Project.find().then((result) => {
        res.render('project/display' , {projects: result})
    })
})

// Add Page
app.get('/projects/add', (req, res) => {
    res.render('project/project-form')
})

// Details Page
app.get('/projects/:id', (req, res) => {
    const id = req.params.id
    Project.findById(id).then(result => {
        res.render('project/details', {project: result})
    }).catch(err => {
        console.log(err)
    })
})

// Update Page
app.get('/projects/update/:id', (req, res) => {
    const id = req.params.id
    Project.findById(id).then(result => {
        res.render('project/project-form', {project: result})
    }).catch(err => {
        console.log(err)
    })
})

// ------------ APIS------------

// ---- EMPLOYEE ----

// Add Employee (manual)
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

// 1. ADD Employee
app.post('/employees/add', (req,res) => {
    const employee = new Employee(req.body)
    employee.save().then((result) => {
        console.log('Adding employee through UI')
        res.redirect('/')
    }).catch((err) => {
        console.log(err)
    })
})

// 2. UPDATE Employee
app.post('/employees/:id', (req, res) => {
    const id = req.params.id
    Employee.findByIdAndUpdate(id, req.body)
    .then(result => {
        Employee.find().then((result) => {
            res.render('index' , {employees: result})
        })
    }).catch(err => {
        console.log(err)
    })
})

// 3. DELETE Employee
app.delete('/employees/:id', (req, res) => {
    const id = req.params.id
    Employee.findByIdAndDelete(id).then(result => {
        res.json({ redirect: '/'})
    }).catch(err => {
        console.log(err)
    })
})

// 4. Add Project to Employee
app.post('/employee/addProj/:id', (req, res) => {
    const id = req.params.id
    Employee.findById(id).then(result => {
        result.projects.push(req.body.project)
        result.save()
        res.redirect('/')
    }).catch(err => {
        console.log(err)
    })
})

// ---- PROJECT ----

// 1. ADD Project
app.post('/projects/add', (req,res) => {
    const project = new Project(req.body)
    project.save().then((result) => {
        console.log('Adding project through UI')
        res.redirect('/projects')
    }).catch((err) => {
        console.log(err)
    })
})

// 2. UPDATE Project
app.post('/projects/:id', (req, res) => {
    const id = req.params.id
    Project.findByIdAndUpdate(id, req.body)
    .then(result => {
        Project.find().then((result) => {
            res.render('project/display' , {projects: result})
        })
    }).catch(err => {
        console.log(err)
    })
})

// 3. DELETE Project
app.delete('/projects/:id', (req, res) => {
    const id = req.params.id
    Project.findByIdAndDelete(id).then(result => {
        res.json({ redirect: '/projects'})
    }).catch(err => {
        console.log(err)
    })
})