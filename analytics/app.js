const express = require('express');
const mysql = require('mysql');

const app = express();

app.use(express.static('public'));
app.use(express.json());

const { MongoClient } = require("mongodb");

const mongodb_database = process.env.MONGODB_DATABASE

var url = "mongodb://localhost:27017/";


MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("weather");
  dbo.collection("day").findOne({}, function(err, result) {
    if (err) throw err;
    console.log(result.name);
    db.close();
  });
});


const mysql_hostname = process.env.MYSQL_HOSTNAME
const mysql_database = process.env.MYSQL_DATABASE
const mysql_password = process.env.MYSQL_PASSWORD
const mysql_port = process.env.MYSQL_PORT


var MySQLEvents = require('mysql-events');

var dsn = {
  host:     mysql_hostname,
  user:     mysql_database,
  password: mysql_password,
  port:     mysql_port
};

var mysqlEventWatcher = MySQLEvents(dsn);
mysqlEventWatcher.add(
  'myDB',
  function (oldRow, newRow, event) {


    if (oldRow === null) {
      insert_data(newRow)
    }
 
});

