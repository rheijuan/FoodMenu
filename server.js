const express = require('express')
const mongoose = require('mongoose')
const Employee = require('./models/employee')
const Project = require('./models/project')
const path = require('path')

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
        if (err) throw err;    
    });
});

// ---- EMPLOYEE ----

app.get('/employees', (req, res) => {
    Project.find().then((projects) => {
        Employee.find().then((employees) => {
            res.status(200).send(employees)
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
        if(result == null) {
            res.status(404).send('Employee not found')
        }
        Project.find().then((projects) => {
            res.status(200).send(result)
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
        if(projects == null) {
            res.status(404).send('Project not found')
        }
        Employee.find().then((employees) => {
            res.status(200).send(projects)
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
        if(project == null) {
            res.status(404).send('Project not found')
        }
        Employee.find().then((employees) => {
            res.status(200).send(project)
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

// ------------ VALIDATION FUNCTIONS ------------
// check if date is in yyyy-mm-dd
function isValidDate(date) {
    var regex = /^\d{4}-\d{2}-\d{2}$/;
    if(!date.match(regex)) return false;  // Invalid format
    var d = new Date(date);
    var dNum = d.getTime();
    if(!dNum && dNum !== 0) return false; // NaN value, Invalid date

    return d.toISOString().slice(0,10) === date;
}

function isValidBirthday(birthday) {
    if(new Date(birthday).setHours(0, 0, 0, 0) > new Date().setHours(0, 0, 0, 0)) {
        console.log('past today')
        // error.message = 'Birthday is past the present date.'
        return false
    }

    return true
}

function isValidDateDiff(birthday, dateHired) {
    // if birthday is past the hiring date
    if(new Date(birthday).setHours(0, 0, 0, 0) > new Date(dateHired).setHours(0, 0, 0, 0)) {
        // error.message = 'Birthday is past the hiring date.'
        return false
    }
    
    return true
    
}

function isValidSex(sex) {
    if(sex != "Male" && sex != "Female" && sex != "Prefer not to say") {
        return false
    }
    return true
}


function validateAddEmployee(req, error) {
    if(!req.body.hasOwnProperty('name') || !req.body.hasOwnProperty('birthday') || !req.body.hasOwnProperty('sex') || !req.body.hasOwnProperty('address') ||
        !req.body.hasOwnProperty('dateHired')) { // if not all fields are provided
        console.log('incomplete fields')
        return false
    }
    else {
        // fields should not be blank
        if(req.body.name == "" || req.body.birthdat == "" || req.body.sex == "" || req.body.address == "" || req.body.dateHired == "") {
            console.log('incomplete fields')
            return false
        }
    }
    
    if(!isValidSex(req.body.sex)) { // if not Male, Female, Prefer not to say
        console.log('invalid sex')
        return false
    }


    if(!isValidDate(req.body.birthday) || !isValidDate(req.body.dateHired)) { // if not yyyy-mm-dd format
        console.log('invalid date')
        return false
    }
    else {
        if(!isValidBirthday(req.body.birthday)) { // if birthday is past today
            console.log('invalid birthday')
            error.message = 'Birthday is past the present date.'
            return false
        }

        if(!isValidDateDiff(req.body.birthday, req.body.dateHired)) { // if birthday is past dateHired
            console.log('birthday > dateHired')
            error.message = 'Birthday is past the hiring date.'
            return false
        }
    }

    return true
}

function validateUpdateEmployee(req, error) {
    if(req.body.hasOwnProperty('sex')) {
        if(!isValidSex(req.body.sex)) { // if not Male, Female, Prefer not to say
            console.log('invalid sex')
            return false
        }
    }

    if(req.body.hasOwnProperty('birthday')) {
        if(!isValidDate(String(req.body.birthday))) { // if not yyyy-mm-dd format
            console.log('invalid date')
            return false
        }
        else {
            if(!isValidBirthday(String(req.body.birthday))) { // if birthday is past today
                console.log('invalid birthday')
                return false
            }
        }
    }

    if(req.body.hasOwnProperty('dateHired')) {
        if(!isValidDate(String(req.body.dateHired))) { // if not yyyy-mm-dd
            console.log('invalid date')
            return false
        }
    }

    if(req.body.hasOwnProperty('birthday') && req.body.hasOwnProperty('dateHired')) {
        if(!isValidDate(String(req.body.birthday)) || !isValidDate(String(req.body.dateHired))) { // if not yyyy-mm-dd
            console.log('invalid date')
            return false
        }
        else {
            if(!isValidBirthday(req.body.birthday)) { // if birthday is past today
                console.log('invalid birthday')
                error.message = 'Birthday is past the present date.'
                return false
            }
    
            if(!isValidDateDiff(req.body.birthday, req.body.dateHired)) { // if birthday is past dateHired
                console.log('birthday > dateHired')
                error.message = 'Birthday is past the hiring date.'
                return false
            }
        }    
    }

    return true
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

    if(validateAddEmployee(req, error)) {
        const employee = new Employee(req.body)
        employee.save().then((result) => {
            res.status(201).send(result)
        }).catch((err) => {
            res.status(400).send(error)
        })
    }
    else {
        res.status(400).send('Invalid input, object invalid')
    }
})

// 2. UPDATE Employee
app.put('/employees/:id', (req, res) => {
    console.log('PUT/ employees/:id')

    const id = req.params.id
    var error = {
        'message': ''
    }

    if (req.body.projects == null) {
        req.body.projects = []
        console.log("NULL -" + req.body.projects + "-" + typeof req.body.projects)
    }

    
    
    if(validateUpdateEmployee(req, error)) {
        Employee.findByIdAndUpdate(id, req.body).then(employee => {
            if(employee == null) {
                res.status(404).send('Employee not found')
            }
            else {

                // if req has projects param
                // projects = []
                // if(req.body.hasOwnProperty('projects')) {
                //     projects = req.body.projects
                // }
                // else {
                //     projects = employee.projects
                // }

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
                            // res.status(200).send(employee)
                        }).catch((err) => {
                            res.status(400).send('Invalid input, object invalid')
                        })
                }).catch((err) => {
                    res.status(400).send('Invalid input, object invalid')
                })
        
            }
        })

        Employee.findById(id).then(result => {
            Project.find().then((projects) => {
                // res.status(200).send(req.body)
            })
            res.status(200).send(req.body)
        }).catch(err => {
            // res.status(404).send('Employee not found')
        })
    }
    else {
        res.status(400).send('Invalid input, object invalid')
    }
})

// 3. DELETE Employee
app.delete('/employees/:id', (req, res) => {
    console.log('DELETE/ employees/:id')
    const id = req.params.id

    Employee.findById(id).then(employee => {
        if(employee == null) {
            res.status(404).send('Employee not found')
        }

        Project.updateMany(
            { _id: { $in: employee.projects } }, 
            { $pull: {employees: id} },
        ).then(projects_res => {
            Employee.findByIdAndDelete(id).then(result => {
                res.status(200).send('Successfully deleted')
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
        res.status(201).send(result)
    }).catch((err) => {
        console.log(err)
    })
})

// 2. UPDATE Project
app.put('/projects/:id', (req, res) => {
    console.log('PUT/ projects/:id')

    const id = req.params.id
    if (req.body.employees == null) {
        req.body.employees = []
    }
    
    // if name is not null
    if(req.body.hasOwnProperty('name')){
        if(req.body.name != "") {
            Project.findByIdAndUpdate(id, req.body).then(project => {
                // if project id not found
                
                if(project == null) {
                    res.status(404).send('Project not found')
                }
                else {
                    
                    // if req has employees param
                    // employees = []
                    // if(req.body.hasOwnProperty('employees')) {
                    //     employees = req.body.employees
                    // }
                    // else {
                    //     employees = project.employees
                    // }


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
                            res.status(200).send(req.body)
                        })
                    })

                }
            })
       }
        else {
            res.status(400).send('Invalid input, object invalid')
       }
    }
    else {
        res.status(200).send('')
    }
    
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
                res.status(200).send("Successfully deleted")
            })
        })
    })

})