const mysql = require('mysql');
require('dotenv').config();

const postDbPool = mysql.createPool({
	connectionLimit: 10,
	host: process.env.DB_HOST,
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE_POST,
	port: process.env.DB_PORT,
	waitForConnections: true,
	queueLimit: 0,
});

const albumDbPool = mysql.createPool({
	connectionLimit: 10,
	host: process.env.DB_HOST,
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE_ALBUMS,
	port: process.env.DB_PORT,
	waitForConnections: true,
	queueLimit: 0,
});

const employeesDbPool = mysql.createPool({
	connectionLimit: 10,
	host: process.env.DB_HOST,
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE_EMPLOYEES,
	port: process.env.DB_PORT,
	waitForConnections: true,
	queueLimit: 0,
});

module.exports = {postDbPool, albumDbPool, employeesDbPool};
