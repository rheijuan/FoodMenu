const express = require('express')
const mongoose = require('mongoose')
const Employee = require('./models/employee')
const Project = require('./models/project')
const path = require('path')

// express app
const app = express()

// public/static files
app.use(express.static(path.join(__dirname, 'public')));

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
    Project.find().then((projects) => {
        Employee.find().then((employees) => {
            res.render('index' , {projects: projects, employees: employees});
        })
    })
})

// ---- EMPLOYEE ----

// Add Page
app.get('/employee/add', (req, res) => {
    res.render('employee/form')
})

// Details Page
app.get('/employees/:id', (req, res) => {
    const id = req.params.id
    Employee.findById(id).then(result => {
        Project.find().then((projects) => {
            res.render('employee/details', {employee: result, projects: projects})
        })
    }).catch(err => {
        console.log(err)
    })
})

// Update Page
app.get('/employees/update/:id', (req, res) => {
    const id = req.params.id
    Employee.findById(id).then(result => {
        Project.find().then((projects) => {
            res.render('employee/form', {employee: result, projects: projects})
        })
    }).catch(err => {
        console.log(err)
    })
})

// ---- PROJECTS ----

// Display Page (index for projects)
app.get('/projects', (req, res) => {
    Project.find().then((projects) => {
        Employee.find().then((employees) => {
            res.render('project/display' , {projects: projects, employees: employees});
        })
    })
})

// Add Page
app.get('/projects/add', (req, res) => {
    res.render('project/form')
})

// Details Page
app.get('/projects/:id', (req, res) => {
    const id = req.params.id

    Project.findById(id).then(project => {
        Employee.find().then((employees) => {
            res.render('project/details' , {project: project, employees: employees});
        })
    }).catch(err => {
        console.log(err)
    })
})

// Update Page
app.get('/projects/update/:id', (req, res) => {
    const id = req.params.id
    Project.findById(id).then(project => {
        Employee.find().then(employees => {
            res.render('project/form', {project: project, employees: employees})
        })
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
app.post('/employee', (req,res) => {
    console.log('POST/ employee')

    const employee = new Employee(req.body)
    employee.save().then((result) => {
        res.redirect('/')
    }).catch((err) => {
        console.log(err)
    })
})

// 2. UPDATE Employee
app.post('/employee/:id', (req, res) => {
    console.log('PUT/ employee/:id')

    const id = req.params.id
    if (req.body.projects == null) {
        req.body.projects = []
    }

    Employee.findByIdAndUpdate(id, req.body).then(employee => {
        var arrA = employee.projects
        var arrB = req.body.projects

        var old_projects = arrA.filter(x => !arrB.includes(x));
        var new_projects = arrB.filter(x => !arrA.includes(x));

        Project.updateMany({
            _id: { $in: old_projects } }, 
            { $pull: {employees: id} })
        .then(old_projects_res => {
            Project.updateMany(
                {_id: { $in: new_projects } }, 
                { $push: {employees: id} })
            .then(new_projects_res => {
                res.redirect('/')
            })
        })
        
    })

})

// 3. DELETE Employee
app.delete('/employee/:id', (req, res) => {
    console.log('DELETE/ employee/:id')
    const id = req.params.id

    Employee.findById(id).then(employee => {
       Project.updateMany(
            { _id: { $in: employee.projects } }, 
            { $pull: {employees: id} },
        ).then(projects_res => {
            Employee.findByIdAndDelete(id).then(result => {
                res.json({ redirect: '/'})
            })
        })
    })

})

// ---- PROJECT ----

// 1. ADD Project
app.post('/project', (req,res) => {
    console.log('POST/ project')

    const project = new Project(req.body)
    project.save().then((result) => {
        res.redirect('/projects')
    }).catch((err) => {
        console.log(err)
    })
})

// 2. UPDATE Project
app.post('/project/:id', (req, res) => {
    console.log('PUT/ project/:id')

    const id = req.params.id
    if (req.body.employees == null) {
        req.body.employees = []
    }

    Project.findByIdAndUpdate(id, req.body).then(project => {
        var arrA = project.employees
        var arrB = req.body.employees

        var old_employees = arrA.filter(x => !arrB.includes(x));
        var new_employees = arrB.filter(x => !arrA.includes(x));

        Employee.updateMany({
            _id: { $in: old_employees } }, 
            { $pull: {projects: id} })
        .then(old_employees_res => {
            Employee.updateMany(
                {_id: { $in: new_employees } }, 
                { $push: {projects: id} })
            .then(new_employees_res => {
                res.redirect('/projects')
            })
        })
        
    })
    
})

// 3. DELETE Project
app.delete('/project/:id', (req, res) => {
    console.log('DELETE/ project:id')
    const id = req.params.id

    Project.findById(id).then(project => {
        Employee.updateMany(
            { _id: { $in: project.employees } }, 
            { $pull: {projects: id} },
        ).then(employees_res => {
            Project.findByIdAndDelete(id).then(result => {
                res.json({ redirect: '/projects'})
            })
        })
    })

})