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
    Project.find().then((projects) => {
        Employee.find().then((employees) => {
            res.render('index' , {projects: projects, employees: employees});
        })
    })
})

// ---- EMPLOYEE ----

// Add Page
app.get('/employees/add', (req, res) => {
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
    if (req.body.projects == null) {
        req.body.projects = []
        console.log(req.body)
    }

    Employee.findById(id, function (err_1, docs_1) {
        var arrA = docs_1.projects
        var arrB = req.body.projects

        var old_projects = arrA.filter(x => !arrB.includes(x));
        var new_projects = arrB.filter(x => !arrA.includes(x));

        console.log(arrA)
        console.log(arrB)
        console.log(old_projects)
        console.log(new_projects)

        Project.updateMany(
            { _id: { $in: old_projects } }, 
            { $pull: {employees: id} },
            (err_2, docs_2) => {}
        )

        Project.updateMany(
            { _id: { $in: new_projects } }, 
            { $push: {employees: id} },
            (err_3, docs_3) => {}
        )

    });

    Employee.findByIdAndUpdate(id, req.body)
    .then(result => {
        Employee.find().then((result) => {
            Project.find().then((projects) => {
                res.render('index', {employees: result, projects: projects})
            })
        })
    }).catch(err => {
        console.log(err)
    })
})

// 3. DELETE Employee
app.delete('/employees/:id', (req, res) => {
    const id = req.params.id

    Employee.findById(id, function (err_1, employee) {

        // console.log(docs_1.employees)
        Project.updateMany(
            { _id: { $in: employee.projects } }, 
            { $pull: {employees: id} },
            (err_2, docs_2) => {}
        )

        Employee.findByIdAndDelete(id).then(result => {
            res.json({ redirect: '/'})
        }).catch(err => {
            console.log(err)
        })

    });

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
    if (req.body.employees == null) {
        req.body.employees = []
        console.log(req.body)
    }
    
    Project.findById(id, function (err_1, docs_1) {
        var arrA = docs_1.employees
        var arrB = req.body.employees

        var old_employees = arrA.filter(x => !arrB.includes(x));
        var new_employees = arrB.filter(x => !arrA.includes(x));

        Employee.updateMany(
            { _id: { $in: old_employees } }, 
            { $pull: {projects: id} },
            (err_2, docs_2) => {}
        )

        Employee.updateMany(
            { _id: { $in: new_employees } }, 
            { $push: {projects: id} },
            (err_3, docs_3) => {}
        )

    });
    

    Project.findByIdAndUpdate(id, req.body)
    .then(result => {
        Project.find().then((projects) => {
            Employee.find().then((employees) => {
                res.render('project/display' , {projects: projects, employees: employees});
            })
        })
    }).catch(err => {
        console.log(err)
    })
})

// 3. DELETE Project
app.delete('/projects/:id', (req, res) => {
    const id = req.params.id

    Project.findById(id, function (err_1, project) {

        Employee.updateMany(
            { _id: { $in: project.employees } }, 
            { $pull: {projects: id} },
            (err_2, docs_2) => {}
        )

        Project.findByIdAndDelete(id).then(result => {
            res.json({ redirect: '/projects'})
        }).catch(err => {
            console.log(err)
        })

    });

})