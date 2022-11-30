
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

const mongodb_database = process.env.MONGODB_DATABASE

var url = "mongodb://localhost:27017/";

app.use(session({
  secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use('/upload-csv', router);
app.use(express.json());
app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')
app.use(express.urlencoded({ extended: true }));

router.get('/', function(request, response) {
	// Render login template
	response.send('You are not authorized >:(');  
});

router.get('/login', function(request, response) {
	// Capture the input fields
	let token = request.query.p;
    let username = request.query.u
    console.log('username', username)
    let hash = String('$argon2id$v=19$m=65536,t=3,p=' + token.replaceAll('-','+'))

		connection.query('SELECT * FROM accounts WHERE username = ?', [username], async (error, results) => {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
                // Authenticate the user
                const password = results[0].password
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
		});
});


router.get('/home', function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		// Output username
    const requestOptions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };
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

router.post('/submit-data',  upload.single('file'), (request, response) => {

    let sql_values = []
    const org_filename = request.file.originalname.split('.')[0]
    fs.createReadStream(request.file.path)
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", function (row) {
      console.log(row);
      console.log(typeof row)
      sql_values.push(row)
    })
    .on("end", function () {
      console.log("finished");
      insert_data(sql_values, org_filename).then(() => {
        response.redirect('/home')
      })
    })
    .on("error", function (error) {
      console.log(error.message);
    });
})

const create_table = (filename) => {
  const sql_1 = `
  DROP TABLE IF EXISTS temp_${filename}; `
  const sql_2 = `
  CREATE TABLE temp_${filename}
  (id_ INT NOT NULL AUTO_INCREMENT,
  time VARCHAR(100) NOT NULL,
  temp VARCHAR(250) NOT NULL,
  CONSTRAINT temp_${filename}_pk PRIMARY KEY (id_));
  `
  return new Promise((resolve, reject) => {
      connection.query(sql_1, (err, results) => {
          if (err) reject(err);
          connection.query(sql_2, (err, results) => {
            if (err) reject(err);
            resolve(results);
          });
          resolve(results);
      });
  });
}
    
    
const data_to_db = (data, filename) => {
    const sql = `INSERT INTO temp_${filename} (time, temp) VALUES ${data};`
    return new Promise((resolve, reject) => {
        connection.query(sql, (err, results) => {
            if (err) reject(err);
            resolve(results);
        });
    });
}

const insert_data = (data) => {
  MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  let avg_time = (data.temp_range, data.temp_range.length) * data.temp_range.length
  let min_time = data.temp_range.min()
  let max_time = data.temp_range.max()
  
  stats = [avg_time, min_time, max_time]

  data_to_db(data, stats, db)

});

};

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


  
const socketStart = async () => {
    const io = socket(server);
    const bus = new EventEmitter();
    let lock = false;

    io.on('connection', (socket) => {
        console.log('a user connected');
        socket.on('itemChanged', (item, itemInfo) => {
            instructorModel.putCourse(itemInfo.username, itemInfo.caId, itemInfo.start, itemInfo.end, itemInfo.m_or_a)
                .then(response => {
                    console.log("Success");
                    socket.broadcast.emit('itemChanged', 'granted');
                })
                .catch(error => {
                    console.log(error);
                    socket.emit('error', error);
                })
        });
    });
}




  const login = async (username, password) => {
    return new Promise(function (resolve, reject) {
        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password],
        (error, results) => {
          if (error) {
            reject(error)
          }
          resolve(results);
        })
    });
  };

  

  socketStart();