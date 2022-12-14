// const mysql = require('mysql');
import express from 'express';
import session from 'express-session';
import path from 'path';
import io from "socket.io-client";
import fetch from "node-fetch";
import error from "node-error"
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const APP_PORT = 8080;
const END_POINT_PORT = [8110,8100];
const END_POINT_IP = "http://localhost"

const app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

// http://localhost:3000/
app.get('/', function(request, response) {
	// Render login template
	response.sendFile(path.join(__dirname + '/login.html'));
});

// http://localhost:3000/auth
app.post('/auth', async function(request, response) {
	// Capture the input fields
	let username = request.body.username;
	let password = request.body.password;
    let admin = request.body.admin;
	// Ensure the input fields exists and are not empty
    console.log('admin',admin)
    let port_index = 1
    if (admin) {
        port_index = 0
    }
	if (username && password) {

        login(`${END_POINT_IP}:${END_POINT_PORT[port_index]}`, username, password).then((results) => {
            if (results == 'error') throw error;
            // If the account exists
            if (results.length > 0) {
                console.log(results)
                
                // Redirect to home page
                console.log('yo im in')
                response.redirect(`${END_POINT_IP}:${END_POINT_PORT[port_index]}/login?${results[0]}&u=${results[1]}`);     
            } else {
                response.send('Incorrect Username and/or Password!');
            }			
            response.end();
        })

	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

// http://localhost:3000/home
app.get('/home', function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		// Output username
		// response.send('Welcome back, ' + request.session.username + '!');
        response.sendFile(path.join(__dirname + '/index.html'));
	} else {
		// Not logged in
		response.send('Please login to view this page!');   
	}
	response.end();
});

// app.get('/hom', (req, res) => {
//     res.render( 'index.html');
// })

app.post('/submit-data', (req, res) => {
    let data = req.body
    console.log('inputs:', data.temp, data.date, data.time)
    let results = insert_data(data)
    console.log('results', results)
    res.redirect('/');
})

app.post('/create-db', (req, res) => {
    create_db()
    res.redirect('/');
})

app.post('/list-db', (req, res) => {
    list_db()
    res.redirect('/');
})

const login = async (END_POINT_ROOT, username, password) => {
  

    let res_data = {};

    // e.preventDefault()

    const user = { username: username, password: password };
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    };
    
    console.log('hello')
    await fetch(`${END_POINT_ROOT}/verify`, requestOptions)
        .then(response => response.json())
        .then(data => res_data = data);

    console.log('res_data', res_data.status);
    if (res_data.status === 200) {
        console.log('full token', res_data.token)
        const token = String(res_data.token).split(',')[2].replaceAll('+','-')
        const username = String(res_data.username)
        return [token, username]
    } else {
        return 'error'
    }
    
}



app.listen(APP_PORT, () => {
  console.log(`login app listening on port ${APP_PORT}`)
})