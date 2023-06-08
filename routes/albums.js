const express = require('express');
const cloudinary = require('../config/cloudinary.js');
const {albumDbPool} = require('../config/db.js');
const router = express.Router();

const query = (sql, args) => {
	return new Promise((resolve, reject) => {
		albumDbPool.query(sql, args, (err, result) => {
			if (err) {
				return reject(err);
			}
			resolve(result);
		});
	});
};
/// Album backend ////////////////////////////////

router.post('/upload/album', async (req, res) => {
	/// this cloudinary end-point
	try {
		const {title, images} = req.body;
		console.log(title);
		let promises = [];

		images.map(async (image) => {
			promises.push(
				cloudinary.uploader.upload(image.url, {
					public_id: image.name,
					use_filename: true,
					folder: title,
				})
			);
		});
		const response = await Promise.all(promises);
		res.send(response);
	} catch (err) {
		console.log(err.message);
	}
});

router.post('/upload/album/database', async (req, res) => {
	const {album, photos} = req.body;
	const {title, description, date_created, date_updated, slug} = album;

	albumDbPool.getConnection(async (error, connection) => {
		if (error) {
			console.log(error.message);
			res.status(500).send({message: 'Error obtaining a database connection'});
			return;
		}

		try {
			await connection.beginTransaction();

			const albumDescription = await query(
				'INSERT INTO albums (album_title, description, date_created, date_updated, slug) VALUES (?,?,?,?,?)',
				[title, description, date_created, date_updated, slug]
			);

			const albumId = albumDescription.insertId;
			console.log('Id for every photo as foreign key is...', albumId);

			for (const image of photos) {
				const {
					name,
					lastModified,
					lastModifiedDate,
					introductionary,
					public_id,
					secure_url,
					url,
				} = image;

				const lastModifiedDateISO = lastModifiedDate.substring(0, 19);

				await query(
					'INSERT INTO album_photos (intro, name, last_modified, last_modified_date, public_id, secure_url, url, album_id_photos) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
					[
						introductionary,
						name,
						lastModified,
						lastModifiedDateISO,
						public_id,
						secure_url,
						url,
						albumId,
					]
				);

				console.log('Photo inserted with with album_id as:', albumId);
			}

			await connection.commit();
			res.status(201).send({message: 'Data were inserted into both tables'});
		} catch (error) {
			console.log(error.message);
			await connection.rollback();
			res.status(500).send({message: 'Error in inserting data'});
		} finally {
			connection.release();
			console.log('finished uploading files..');
		}
	});
});

////////////////////////////////////////////////////////////////
/// Getting albums data
////////////////////////////////////////////////////////////////

router.get('/get/albums', async (req, res) => {
	albumDbPool.getConnection(async (error, connection) => {
		if (error) {
			console.log(error.message);
			res
				.status(500)
				.send({
					message: 'Error obtaining a database connection',
					error_message: error.message,
					error: error,
				});
			return;
		}

		try {
			const albums = await query('SELECT * FROM albums');

			const photos = await Promise.all(
				albums.map(async (album) => {
					const results = await query(
						'SELECT * FROM album_photos WHERE album_id_photos=?',
						album.album_id
					);
					return {
						album_title: album.album_title,
						album_id: album.album_id,
						description: album.description,
						date_created: album.date_created,
						date_updated: album.date_updated,
						slug: album.slug,
						arrayOfPictures: results,
					};
				})
			);
			res.send(photos);
		} catch (error) {
			console.log(error.message);
			res.status(500).json({message: 'Error fetching data from the database'});
		} finally {
			connection.release();
			console.log('Albums done...');
		}
	});
});

/// get one particular Album from the database

router.get('/get/album/:id/:titleSlug', async (req, res) => {
	const id = req.params.id;
	const slug = req.params.titleSlug;

	albumDbPool.getConnection(async (error, connection) => {
		if (error) {
			console.log(error.message);
			res.status(500).send({message: 'Error obtaining a database connection'});
			return;
		}

		try {
			const album = await query(
				'SELECT * FROM albums WHERE album_id=? AND slug=?',
				[id, slug]
			);

			const photosForDetailAlbum = await Promise.all(
				album.map(async (album) => {
					const results = await query(
						'SELECT * FROM album_photos WHERE album_id_photos=?',
						album.album_id
					);
					return {
						album_title: album.album_title,
						album_id: album.album_id,
						description: album.description,
						date_created: album.date_created,
						date_updated: album.date_updated,
						slug: album.slug,
						arrayOfPictures: results,
					};
				})
			);
			res.send(photosForDetailAlbum);
		} catch (error) {
			console.log(error.message);
			res.status(500).json({message: 'Error fetching data from the database'});
		} finally {
			connection.release();
			console.log('Albums done...');
		}
	});
});

router.put(`/updateAlbum`, async (req, res) => {
	const album = await req.body;
	const {
		arrayOfPictures,
		originalSlug,
		album_id,
		date_updated,
		album_title,
		description,
		...rest
	} = album;
	const slug = album.slug;

	albumDbPool.getConnection(async (error, connection) => {
		if (error) {
			console.log(error.message);
			res.status(500).send({message: 'Error obtaining a database connection'});
			return;
		}

		try {
			await connection.beginTransaction();

			// Destroy the Cloudinary folder with the old slug
			const response = await cloudinary.api.delete_resources_by_prefix(
				originalSlug
			);
			const folderResponse = await cloudinary.api.delete_folder(originalSlug);

			// Upload the new array of pictures with data_url and with folder named according to the slug
			const promises = arrayOfPictures.map(async (image) => {
				const {data_url, ...rest} = image;
				return await cloudinary.uploader.upload(data_url, {
					public_id: image.name,
					use_filename: true,
					folder: slug,
				});
			});
			const cloudinaryResponse = await Promise.all(promises);

			const arrayOfIDs = await cloudinaryResponse.map((id) => {
				/// get URLs and public id of every image
				return {
					public_id: id.public_id,
					secure_url: id.secure_url,
					url: id.url,
				};
			});

			async function mergeImagesArray() {
				const mutatedImages = await arrayOfPictures.map((image) => {
					// after uploading to the cloudinary server I dont need data encoded as DataURL
					const {data_url, ...rest} = image;
					return rest;
				}); /// copy array of images

				const mergedImages = await mutatedImages.reduce((acc, obj) => {
					let prefix = album.slug + '/'; ///// folder prefix in order to be able to merge the old array of images with the URLs and public_id array from cloudinary
					const match = arrayOfIDs.find(
						(element) => element.public_id.substring(prefix.length) === obj.name
					);
					if (match) acc.push({...obj, ...match});
					return acc;
				}, []);
				return mergedImages;
			}

			const mergedImages = await mergeImagesArray();

			const albumDescription = await query(
				connection,
				'UPDATE albums SET album_title = ?, slug = ?, description = ?, date_updated = ? WHERE album_id = ?',
				[album_title, slug, description, date_updated, album_id]
			);

			// Delete all photos for the album from album_photos table
			const deletedPhotos = await query(
				connection,
				'DELETE FROM album_photos WHERE album_id_photos = ?',
				[album_id]
			);

			console.log('Deleted photos from database', deletedPhotos);

			// Update all photos in the MySQL database that have album_id as a foreign key
			const updatePhotoPromises = mergedImages.map(async (image) => {
				const {
					introductionary,
					name,
					last_modified,
					last_modified_date,
					public_id,
					secure_url,
					url,
				} = image;

				const lastModifiedDateISO = last_modified_date.substring(0, 19);

				return query(
					connection,
					'INSERT INTO album_photos (intro, name, last_modified, last_modified_date, public_id, secure_url, url, album_id_photos) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
					[
						introductionary,
						name,
						last_modified,
						lastModifiedDateISO,
						public_id,
						secure_url,
						url,
						album_id,
					]
				);
			});
			const insertPhotosResult = await Promise.all(updatePhotoPromises);

			// Commit the transaction
			await connection.commit();

			// Send back to the client response about success
			res.send({success: true, insertPhotosResult});
		} catch (error) {
			console.error(error);

			await connection.rollback();
			res.status(500).send({error: 'Failed to update the album'});
		} finally {
			connection.release();
			console.log('This is the end...');
		}
	});
});

router.delete('/deleteAlbum/:albumIdParam/:albumSlug', async (req, res) => {
	const albumId = req.params.albumIdParam;
	const slugParam = req.params.albumSlug;

	albumDbPool.getConnection(async (error, connection) => {
		if (error) {
			console.log(error.message);
			res.status(500).send({message: 'Error obtaining a database connection'});
			return;
		}

		try {
			await connection.beginTransaction();

			// Destroy the Cloudinary folder with the old slug
			const resourcesResponse = await cloudinary.api.delete_resources_by_prefix(
				slugParam
			);
			const folderResponse = await cloudinary.api.delete_folder(slugParam);

			// Delete all photos for the album from album_photos table
			const deletedPhotos = await query(
				connection,
				'DELETE FROM album_photos WHERE album_id_photos = ?',
				[albumId]
			);

			// Delete the album from database
			const deletedAlbums = await query(
				connection,
				'DELETE FROM albums WHERE album_id = ?',
				[albumId]
			);

			// Commit the transaction
			await connection.commit();

			// Send back to the client response about success
			res.send({
				success: true,
				cloudinary: {resourcesResponse, folderResponse},
				photos_deleted: deletedPhotos,
				album_deleted: deletedAlbums,
			});
		} catch (error) {
			console.error(error);

			await connection.rollback();
			res.status(500).send({error: 'Failed to delete the album'});
		} finally {
			connection.release();
			console.log('This is the end...');
		}
	});
});

module.exports = router;
