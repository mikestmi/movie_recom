const express = require('express');
const app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

var mysql = require('mysql');

const config = require('./config');

var connection = mysql.createConnection({
	host: config.dbhost,
	user: config.username,
	password: config.password,
	database: config.database
});

connection.connect(function(error) {
	if(error){
		console.log('Error in connection!');
		console.log(error.message);
	}
	else {
		console.log('Connected');
	}
});

var server = app.listen(8010, function(){
	console.log("Server started on port "+server.address().port+" on "+Date());
});


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post('/movie',function(req,res,next){
	res.setHeader('Content-Type','application/json');
	var movie = req.body;
	var ip = req.connection.remoteAddress;
	connection.query("SELECT * FROM movies WHERE title LIKE '%" + movie.keyword + "%'", function(error, rows, fields){
		if(error) {
			console.log('Error in the query');
			res.status(404).send(error.message);
		}
		else {
			// console.log('SUCCESS!\n');
			// console.log(rows);
			console.log('POST1 request from '+ip);
			res.send(rows);
		}
	});
});

app.get('/movie/:id',function(req,res,next){

	res.setHeader('Content-Type','application/json');
	var ip = req.connection.remoteAddress;
	connection.query("SELECT * FROM movies WHERE movieId = " +req.params.id, function(error, rows, fields){
		if(error) {
			console.log('Error in the query');
			console.log(error.message);
			res.status(404).send(error.message);
		}
		else {
			// console.log('SUCCESS!\n');
			// console.log(rows);
			console.log('GET1 request from '+ip);
			res.send(rows);
		}
	});
});

app.get('/ratings/:id',function(req,res,next){

	res.setHeader('Content-Type','application/json');
	var ip = req.connection.remoteAddress;
	connection.query("SELECT * FROM ratings WHERE userId = " +req.params.id, function(error, rows, fields){
		if(error) {
			console.log('Error in the query');
			res.status(404).send(error.message);
		}
		else {
			// console.log('SUCCESS!\n');
			// console.log(rows);
			console.log('GET2 request from '+ip);
			res.send(rows);
		}
	});
});
	

app.post('/ratings',function(req,res,next){
	res.setHeader('Content-Type','application/json');
	
	var movies = req.body;
	var ip = req.connection.remoteAddress;
	connection.query("SELECT * FROM ratings WHERE movieId IN (" + movies.movieList + ')', function(error, rows, fields){
		if(error) {
			console.log('Error in the query');
			res.status(404).send(error.message);
		}
		else {
			// console.log('SUCCESS!\n');
			// console.log(rows);
			console.log('POST2 request from '+ip);
			res.send(rows);
		}
	});
});