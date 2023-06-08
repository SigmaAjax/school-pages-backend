const mysql = require('mysql');
require('dotenv').config();

// console.log({
// 	Clear_db: process.env.CLEARDB_CYAN_URL,
// 	space: '---------------',
// 	hostname: new URL(process.env.CLEARDB_CYAN_URL).hostname,
// 	username: new URL(process.env.CLEARDB_CYAN_URL).username,
// 	password: new URL(process.env.CLEARDB_CYAN_URL).password,
// 	database: process.env.CLEARDB_CYAN_NAME,
// });

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
	database:
		process.env.NODE_ENV === 'production'
			? process.env.CLEARDB_CYAN_NAME
			: process.env.DB_DATABASE_POST,
	port: process.env.DB_PORT,
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
	database:
		process.env.NODE_ENV === 'production'
			? process.env.CLEARDB_CYAN_NAME
			: process.env.DB_DATABASE_ALBUMS,
	port: process.env.DB_PORT,
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
	database:
		process.env.NODE_ENV === 'production'
			? process.env.CLEARDB_CYAN_NAME
			: process.env.DB_DATABASE_EMPLOYEES,
	port: process.env.DB_PORT,
	waitForConnections: true,
	queueLimit: 0,
});

if (process.env.NODE_ENV === 'production') {
	console.log(`postDbPool config: `, postDbPool.config);
	console.log(`albumDbPool config: `, albumDbPool.config);
	console.log(`employeesDbPool config: `, employeesDbPool.config);
}

module.exports = {postDbPool, albumDbPool, employeesDbPool};
