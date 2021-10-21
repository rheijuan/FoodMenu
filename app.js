const express = require('express')
const mongoose = require('mongoose')
const Employee = require('./models/employee')
const Project = require('./models/project')
const path = require('path')
const open = require('open')
const timeout = require('connect-timeout')

// express app
const app = express()
const bodyParser = require('body-parser');

// public/static files
app.use(express.static(path.join(__dirname, 'public')));

// express extend
app.engine('ejs', require('express-ejs-extend'));

// register view engine
app.set('view engine', 'ejs')

// middleware
app.use(express.urlencoded())
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(timeout('60s'))

// connect to mongodb
const dbURI = 'mongodb+srv://root:root@foodmenuapp.7r05l.mongodb.net/Items?retryWrites=true&w=majority'
mongoose.connect(dbURI)
    .then((result) => {
        console.log('Listening...')
        app.listen(process.env.PORT || 3000)
    }).catch((err) => console.log(err))

// ------------ ROUTING ------------

// ---- HOMEPAGE ----

app.get('/', (req, res) => {
    res.render('index');
})

// ---- API DOCS  ----

app.get('/docs', (req,res) => {
    // open in same tab
    // res.sendFile(path.join(__dirname+'/views/docs.html'));
    //__dirname : It will resolve to your project folder.

    // open in a new window
    open(path.join(__dirname+'/views/docs.html'), function (err) {
        console.log(err)
        if (err) throw err;    
    });
});

// ---- EMPLOYEE ----

app.get('/employees', (req, res) => {
    Project.find().then((projects) => {
        Employee.find().then((employees) => {
            res.render('employee/display' , {projects: projects, employees: employees});
        })
    })
})

// Add Page
app.get('/employees/add', (req, res) => {

    var error = {
        message: ''
    }

    res.render('employee/form', {error : error})
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
    var error = {
        message: ''
    }

    Employee.findById(id).then(result => {
        Project.find().then((projects) => {
            res.render('employee/form', {employee: result, projects: projects, error:error})
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

// ------------ FUNCTION ------------
// --- FORM VALIDATION FOR DATES --- //
function valiDate(req, error) {
    // if birthday is past the present
    if(new Date(req.body.birthday).setHours(0, 0, 0, 0) > new Date().setHours(0, 0, 0, 0)) {
        console.log('past today')
        error.message = 'Birthday is past the present date.'
        return false
    }
    else {
        // if birthday is past the hiring date
        if(new Date(req.body.birthday).setHours(0, 0, 0, 0) > new Date(req.body.dateHired).setHours(0, 0, 0, 0)) {
            console.log('birthday > hiring date')
            error.message = 'Birthday is past the hiring date.'
            return false
        }
        // else, valid date inputs
        else {
            return true
        }
    }
}

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
app.post('/employees', (req,res) => {
    console.log('POST/ employees')

    var error = {
        'message': ''
    }

    if(valiDate(req, error)) {
        const employee = new Employee(req.body)
        employee.save().then((result) => {
            res.redirect('/employees')
        }).catch((err) => {
            console.log(err)
        })
    }
    else {
        res.render('employee/form', {error: error})
    }
})

// 2. UPDATE Employee
app.post('/employees/:id', (req, res) => {
    console.log('PUT/ employees/:id')

    const id = req.params.id
    var error = {
        'message': ''
    }

    if (req.body.projects == null) {
        req.body.projects = []
    }

    if(valiDate(req, error)) {
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
                    res.redirect('/employees')
                })
            })
            
        })
    }
    else {
        Employee.findById(id).then(result => {
            Project.find().then((projects) => {
                res.render('employee/form', {employee: result, projects: projects, error:error})
            })
        }).catch(err => {
            console.log(err)
        })
    }
})

// 3. DELETE Employee
app.delete('/employees/:id', (req, res) => {
    console.log('DELETE/ employees/:id')
    const id = req.params.id

    Employee.findById(id).then(employee => {
       Project.updateMany(
            { _id: { $in: employee.projects } }, 
            { $pull: {employees: id} },
        ).then(projects_res => {
            Employee.findByIdAndDelete(id).then(result => {
                res.json({ redirect: '/employees'})
            })
        })
    })

})

// ---- PROJECT ----

// 1. ADD Project
app.post('/projects', (req,res) => {
    console.log('POST/ projects')

    const project = new Project(req.body)
    project.save().then((result) => {
        res.redirect('/projects')
    }).catch((err) => {
        console.log(err)
    })
})

// 2. UPDATE Project
app.post('/projects/:id', (req, res) => {
    console.log('PUT/ projects/:id')

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
app.delete('/projects/:id', (req, res) => {
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