const express = require("express")
const app = express()
const pg = require("pg")
const client = new pg.Client('postgres://artma:postgres@localhost/employees')
const morgan = require('morgan')
app.use(morgan('dev'))
app.use(express.json())

app.get('/api/employees', async (req,res,next)=> {
    try {
        const SQL =`
            SELECT * 
            FROM employees
        `
        const response = await client.query(SQL)
        res.send(response.rows)
    } catch (error) {
        next(error)
    }
})

app.get('/api/departments', async (req,res,next)=> {
    try {
        const SQL =`
            SELECT * 
            FROM departments
        `
        const response = await client.query(SQL)
        res.send(response.rows)
    } catch (error) {
        next(error)
    }
})

app.post ('/api/employees/:id', async (req,res,next )=>{
    try {
        const SQL =`
         INSERT INTO employees(employee_name, department_id)
         VALUES ($1, $2)
         RETURNING *
         ` 
         const response = await client.query(SQL, [req.body.employee_name, req.body.department_id])
         res.send(response.rows[0])
    } catch (error) {
        next(error)
    }
})

app.put('/api/employees/:id', async (req, res, next) =>{
    try {
        const SQL = `
        UPDATE employees
        SET employee_name = $1 , department_id = $2, updated_at = now()
        WHERE id = $3
        RETURNING *
        `
        const response = await client.query(SQL,[req.body.employee_name,req.body.department_id, req.params.id])
        res.send(response.rows[0])
    } catch (error) {
        next(error )
    }
})

app.delete('/api/employees/:id', async(req, res, next ) => {
 try {
    const SQL = `
    DELETE 
    FROM employees 
    WHERE id = $1
    `
    await client.query(SQL,[req.params.id])
    res.sendStatus(204)
 } catch (error) {
    next(error)
 }
})

const init = async ()=> {
    await client.connect()
    const PORT = 3000;
    const SQL =`
        DROP TABLE IF EXISTS employees;
        DROP TABLE IF EXISTS departments;
        CREATE TABLE departments(
        id SERIAL PRIMARY KEY,
        department_name VARCHAR(50) UNIQUE
        );

        CREATE TABLE employees(
        id SERIAL PRIMARY KEY,
        employee_name VARCHAR(50),
        department_id INTEGER REFERENCES departments(id), 
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
        );
        INSERT INTO departments(department_name) VALUES ('History');
        INSERT INTO departments(department_name) VALUES ('Computer Science');
        INSERT INTO departments(department_name) VALUES ('Art');
        INSERT INTO departments(department_name) VALUES ('Engineering');

        INSERT INTO employees(employee_name, department_id) VALUES('Justin', (SELECT id FROM departments WHERE department_name = 'History'));
        INSERT INTO employees(employee_name, department_id) VALUES('Scott', (SELECT id FROM departments WHERE department_name = 'Art'));
        INSERT INTO employees(employee_name, department_id) VALUES('Hilda', (SELECT id FROM departments WHERE department_name = 'Engineering'));
        INSERT INTO employees(employee_name, department_id) VALUES('Artemis', (SELECT id FROM departments WHERE department_name = 'Computer Science'));
    `
    await client.query(SQL)
    console.log("table seeded")
    app.listen (PORT,()=> {
        console.log(`listening on port ${PORT}`)
    })
}
init ()