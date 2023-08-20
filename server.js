const express = require('express');
require('dotenv').config();
const cors = require('cors');
const {postDbPool, albumDbPool, employeesDbPool} = require('./config/db.js');
const port = process.env.PORT || process.env.NODE_ENV_PORT;

const app = express();

// Enable cors for all routes

const corsOptions = {
	origin: [
		'http://localhost:3000',
		'https://64aefdd8372b3b15b2d5836f--effortless-snickerdoodle-282c8b.netlify.app',
		'*',
	],
	methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH'],
	allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, PATCH');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	next();
});
app.use(express.json({limit: '10mb', extended: true}));
app.use(
	express.urlencoded({limit: '10mb', extended: true, parameterLimit: 50000})
);

// Import routers
const postsRouter = require('./routes/posts');
const albumsRouter = require('./routes/albums');
const uploadFilesRouter = require('./routes/uploadFiles');
const employeesRouter = require('./routes/employees');

// Use routers
app.use('/api', postsRouter);
app.use('/api', albumsRouter);
app.use('/api', uploadFilesRouter);
app.use('/api', employeesRouter);

// Serve files from the documents directory
const path = require('path');
const documentsDir = path.join(__dirname, 'documents');

// Middleware function to set the Content-Disposition header
const setDownloadHeader = (req, res, next) => {
	console.log({
		filename_setDownloadHeader: decodeURIComponent(req.path.slice(1)),
	});
	const filename = decodeURIComponent(req.path.slice(1));
	res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
	next();
};

// Serve files with the Content-Disposition header set to attachment
app.use('/files', setDownloadHeader, express.static(documentsDir));

// app.get('/dbinfo', (req, res) => {
// 	res.send({
// 		postDbPool_config: postDbPool.config,
// 		albumDbPool_config: albumDbPool.config,
// 		employeesDbPool_config: employeesDbPool.config,
// 	});
// });

app.listen(port, (res, req) => {
	console.log('your port is ', port);
	console.log(`postDbPool config: `, postDbPool.config);
	console.log(`albumDbPool config: `, albumDbPool.config);
	console.log(`employeesDbPool config: `, employeesDbPool.config);
});
