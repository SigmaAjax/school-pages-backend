const express = require('express');
const router = express.Router();
const upload = require('../config/multer');

const path = require('path');
const fs = require('fs');
const mime = require('mime');
const documentsDir = path.join(__dirname, '..', 'documents');

// POST

router.post('/upload/files', upload.array('files'), (req, res) => {
	try {
		res.status(200).send('Files uploaded successfully');
	} catch (error) {
		console.error('Error uploading files:', error);
		res.status(500).send(`Error uploading files: ${error.message}`);
	}
});
// ...

// GET

router.get('/documents', (req, res) => {
	fs.readdir(documentsDir, (err, filenames) => {
		if (err) {
			res.status(500).json({message: 'Error reading directory'});
		} else {
			const files = filenames.map((filename) => {
				const filePath = path.join(documentsDir, filename);
				const stats = fs.statSync(filePath);
				const mimeType = mime.lookup(filePath);
				const originalName = decodeURIComponent(filename);
				const fileUrl = `${req.protocol}://${req.get(
					'host'
				)}/files/${filename}`;
				return {
					name: originalName,
					encodedFilename: filename,
					size: stats.size,
					type: mimeType,
					path: filePath,
					url: encodeURI(fileUrl),
				};
			});
			res.json(files);
		}
	});
});

// DELETE

router.delete('/file/:filename', (req, res) => {
	// console.log({filename: req.params.filename});
	// console.log({filename: encodeURIComponent(req.params.filename)});
	const filename = encodeURIComponent(req.params.filename);
	const filePath = path.join(documentsDir, filename);

	fs.unlink(filePath, (err) => {
		if (err) {
			console.error('Error deleting file:', err);
			res.status(500).send('Error deleting file');
		} else {
			res.status(200).send('File deleted successfully');
		}
	});
});

module.exports = router;
