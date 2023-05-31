const express = require('express');
const {postDbPool} = require('../config/db.js');
const router = express.Router();

const query = (sql, args) => {
	return new Promise((resolve, reject) => {
		postDbPool.query(sql, args, (err, result) => {
			if (err) {
				return reject(err);
			}
			resolve(result);
		});
	});
};

router.get('/get', (req, res) => {
	postDbPool.getConnection((err, connection) => {
		if (err) throw err;
		connection.query('SELECT * FROM posts', (err, result) => {
			connection.release();
			if (err) {
				console.log(err);
			}
			res.send(result);
		});
	});
});

router.get('/get/:id/:titleSlug', (req, res) => {
	const id = req.params.id;
	const slug = req.params.titleSlug;

	postDbPool.getConnection((err, connection) => {
		if (err) throw err;
		connection.query(
			'SELECT * FROM posts WHERE id=? AND slug=?',
			[id, slug],
			(err, result) => {
				connection.release();
				if (err) {
					console.log(err);
				}
				res.send(result);
			}
		);
	});
});

router.post('/create', async (req, res) => {
	const {text, title, userPass, date, slug} = req.body;
	const date_updated = date;

	try {
		// Assuming 'postDbPool.query()' already returns a promise
		const result = await query(
			'INSERT INTO posts (title, post_text, user_name, date_posted, date_updated, slug) VALUES (?, ?, ?, ?, ?, ?)',
			[title, text, userPass, date, date_updated, slug]
		);
		console.log(result);
		res
			.status(200)
			.json({message: 'Post created successfully', result: result});
	} catch (err) {
		console.log(err);
		res
			.status(500)
			.json({message: 'An error occurred while creating the post'});
	}
});

router.put('/updatePost', async (req, res) => {
	const {id, text, title, userPass, slug, post_updated} = req.body;

	try {
		const result = await query(
			'UPDATE posts SET title=?, post_text=?, user_name=?, date_updated=?, slug=? WHERE id=?',
			[title, text, userPass, post_updated, slug, id]
		);

		if (result.affectedRows > 0) {
			res
				.status(200)
				.json({message: 'Post updated successfully', result: result});
		} else {
			res.status(404).json({message: `Post with id ${id} not found.`});
		}
	} catch (err) {
		console.log(err);
		res
			.status(500)
			.json({message: 'An error occurred while updating the post.'});
	}
});

router.delete('/deletePost/:id', async (req, res) => {
	const id = req.params.id;

	try {
		// Assuming 'postDbPool.query()' already returns a promise
		const result = await query('DELETE FROM posts WHERE id = ?', id);

		if (result.affectedRows > 0) {
			res.status(200).json({message: `Post with id ${id} has been deleted.`});
		} else {
			res.status(404).json({message: `Post with id ${id} not found.`});
		}
	} catch (err) {
		console.log(err);
		res
			.status(500)
			.json({message: 'An error occurred while deleting the post.'});
	}
});

module.exports = router;
