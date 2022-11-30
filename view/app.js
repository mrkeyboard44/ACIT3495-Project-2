
const argon2 = require('argon2')
const socket = require("socket.io");
const EventEmitter = require('events');

const express = require('express');
const session = require('express-session');
const ejs = require('ejs');
const app = express();
const router = express.Router();
const path = require('path');


const router_PORT = 8100;
const SOCKET_PORT = 8101;


const { MongoClient } = require("mongodb");
const { resolve } = require('path');

const mongodb_database = process.env.MONGODB_DATABASE

var url = `mongodb://root:mongroot@localhost:27017/`;
const client = new MongoClient(url);




// const dbo = client.db("weather");
// // var dbo = db.db("mydb");
// dbo.createCollection("customers", function(err, res) {
//   if (err) throw err;
//   console.log("Collection created!");
//   // db.close();
// });
//   var myobj = { username: "test", password: "test" };
//   dbo.collection("accounts").insertOne(myobj, function(err, res) {
//     if (err) throw err;
//     console.log("1 document inserted");
//     // db.close();
//   });


app.use(session({
  secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
// app.use('/upload-csv', router);
app.use(express.json());
app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')
app.use(express.urlencoded({ extended: true }));

router.get('/', function(request, response) {
	// Render login template
	response.send('You are not authorized >:(');  
});

router.get('/login', async function(request, response) {
	// Capture the input fields
	let token = request.query.p;
    let username = request.query.u
    console.log('username', username)
    let hash = String('$argon2id$v=19$m=65536,t=3,p=' + token.replaceAll('-','+'))
    // await client.connect();
    const dbo = client.db("mydb");
    const query = { 'username': username };
    dbo.collection("accounts").find(query).toArray(async function(err, result) {
      if (err) throw err;
      console.log('result',result);
      if (result.length > 0) {
        // Authenticate the user
        const password = result[0].password
        console.log('password', password)
        console.log('hash', hash)
        const verified = await argon2.verify(hash, password)
        console.log(verified)
        if (verified) {
            request.session.loggedin = true;
            request.session.username = username;
            // Redirect to home page
            response.redirect('/home');    
        } else {
            response.send('Incorrect Username and/or Password!');    
        }
      } else {
        response.send('Incorrect Username and/or Password!');
      }			
      response.end();
      // db.close();
    });

});


router.get('/home', async function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		results = await view().then((response, error) => {
      console.log(response)
    })
    // data = {}
    // for (i in results) {
    //   data[]
    // }


    response.render('index');
	} else {
		// Not logged in
		response.send('Please login to view this page!');   
	}
	response.end();
});
// def view():
//     mdb = client["weather"]
//     collection = mdb["day"]
//     data = list()
//     for day in collection.find():
//         view = dict()
//         view['datetime'] = day['datetime']
//         view['temp_avg'] = day['temp_avg']
//         view['temp_max'] = day['temp_max']
//         view['temp_min'] = day['temp_min']
//         data.append(view)
    
//     return render_template('view.html', data=data)

const view = async () => {
  // const query = { 'username': username, 'password': password}
  const dbo = client.db("weather");
  return new Promise(function (resolve, reject) {
    dbo.collection("day").find().toArray(
      async (error, results) => {
        if (error) {
          reject(error)
        }
        resolve(results);
      })
    });
  };
  
  

// router.post('/submit-data',  upload.single('file'), (request, response) => {

//     let sql_values = []
//     const org_filename = request.file.originalname.split('.')[0]
//     fs.createReadStream(request.file.path)
//     .pipe(parse({ delimiter: ",", from_line: 2 }))
//     .on("data", function (row) {
//       console.log(row);
//       console.log(typeof row)
//       sql_values.push(row)
//     })
//     .on("end", function () {
//       console.log("finished");
//       insert_data(sql_values, org_filename).then(() => {
//         response.redirect('/home')
//       })
//     })
//     .on("error", function (error) {
//       console.log(error.message);
//     });
// })




// const insert_data = (data) => {
//   MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   let avg_time = (data.temp_range, data.temp_range.length) * data.temp_range.length
//   let min_time = data.temp_range.min()
//   let max_time = data.temp_range.max()
  
//   stats = [avg_time, min_time, max_time]

//   data_to_db(data, stats, db)

// });

// };

router.post('/verify', (req, res) => {
  
    console.log('req.body', req.body)
    login(req.body.username, req.body.password)
      .then(async (response, error) => {
        const body = req.body;
        const password = body.password;
        console.log('reponse', response)
        const verified = await argon2.hash(password, { type: argon2.argon2id });
        if (!error) {
          let user = {
            status: 200,
            username: req.body.username,
            token: verified
          }
          res.status(200).send(user);
        } else {
          res.status(401).send({ status: "401" });
          console.log("fail")
        }
      })
      .catch(error => {
        console.log(error);
        res.status(500).send({ status: "500" });
      })
  });



app.use('/', router);
app.listen(router_PORT || 3000)
console.log(`admin-input router listening on port ${router_PORT}`)


const server = app.listen(
    SOCKET_PORT,
    console.log(
      `SOCKET is running on the port no: ${(SOCKET_PORT)}`
    )
  );





  const login = async (username, password) => {
    const query = { 'username': username, 'password': password}
    const dbo = client.db("mydb");
    return new Promise(function (resolve, reject) {
      dbo.collection("accounts").find(query).toArray(
        async (error, results) => {
          if (error) {
            reject(error)
          }
          resolve(results);
        })
    });
  };

  
