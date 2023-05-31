const multer = require('multer');
const path = require('path');

// multer configuration file
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'documents/');
	},
	filename: (req, file, cb) => {
		const fileExtension = path.extname(file.originalname);
		const fileNameWithoutExtension = path.basename(
			file.originalname,
			fileExtension
		);
		const encodedFileNameWithoutExtension = fileNameWithoutExtension;

		function formatDate(date) {
			const day = String(date.getDate()).padStart(2, '0');
			const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
			const year = date.getFullYear();

			return `${day}-${month}-${year}`;
		}

		const currentDate = formatDate(new Date());

		const newFileName = `${encodedFileNameWithoutExtension}-${currentDate}${fileExtension}`;

		cb(null, newFileName);
	},
});

const upload = multer({storage});

module.exports = upload;
