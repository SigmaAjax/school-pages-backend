const mysql = require('mysql');
require('dotenv').config();

const postDbPool = mysql.createPool({
	connectionLimit: 10,
	host:
		process.env.NODE_ENV === 'production'
			? new URL(process.env.CLEARDB_CYAN_URL).hostname
			: process.env.DB_HOST,
	user:
		process.env.NODE_ENV === 'production'
			? new URL(process.env.CLEARDB_CYAN_URL).username
			: process.env.DB_USERNAME,
	password:
		process.env.NODE_ENV === 'production'
			? new URL(process.env.CLEARDB_CYAN_URL).password
			: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE_POST,
	port:
		process.env.NODE_ENV === 'production'
			? new URL(process.env.CLEARDB_CYAN_URL).port
			: process.env.DB_PORT,
	waitForConnections: true,
	queueLimit: 0,
});

const albumDbPool = mysql.createPool({
	connectionLimit: 10,
	host:
		process.env.NODE_ENV === 'production'
			? new URL(process.env.CLEARDB_CYAN_URL).hostname
			: process.env.DB_HOST,
	user:
		process.env.NODE_ENV === 'production'
			? new URL(process.env.CLEARDB_CYAN_URL).username
			: process.env.DB_USERNAME,
	password:
		process.env.NODE_ENV === 'production'
			? new URL(process.env.CLEARDB_CYAN_URL).password
			: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE_ALBUMS,
	port:
		process.env.NODE_ENV === 'production'
			? new URL(process.env.CLEARDB_CYAN_URL).port
			: process.env.DB_PORT,
	waitForConnections: true,
	queueLimit: 0,
});

const employeesDbPool = mysql.createPool({
	connectionLimit: 10,
	host:
		process.env.NODE_ENV === 'production'
			? new URL(process.env.CLEARDB_CYAN_URL).hostname
			: process.env.DB_HOST,
	user:
		process.env.NODE_ENV === 'production'
			? new URL(process.env.CLEARDB_CYAN_URL).username
			: process.env.DB_USERNAME,
	password:
		process.env.NODE_ENV === 'production'
			? new URL(process.env.CLEARDB_CYAN_URL).password
			: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE_EMPLOYEES,
	port:
		process.env.NODE_ENV === 'production'
			? new URL(process.env.CLEARDB_CYAN_URL).port
			: process.env.DB_PORT,
	waitForConnections: true,
	queueLimit: 0,
});

module.exports = {postDbPool, albumDbPool, employeesDbPool};
