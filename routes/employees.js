const express = require('express');
const {employeesDbPool} = require('../config/db.js');
const router = express.Router();

const query = (sql, args) => {
	return new Promise((resolve, reject) => {
		employeesDbPool.query(sql, args, (err, result) => {
			if (err) {
				return reject(err);
			}
			resolve(result);
		});
	});
};

router.post('/add/employee', async (req, res) => {
	const {name, surname, academicTitle, email, phone, pozice1, ...rest} =
		req.body;

	const pozice2 = rest.pozice2 || 'N/A';
	const pozice3 = rest.pozice3 || 'N/A';
	const pozice4 = rest.pozice4 || 'N/A';

	try {
		// Check for duplicates
		const existingEmployee = await query(
			'SELECT * FROM employees WHERE name = ? AND surname = ? AND email = ? AND phone = ?',
			[name, surname, email, phone]
		);

		if (existingEmployee.length > 0) {
			res.status(400).json({
				status: 'error',
				message:
					'Employee with the same name, surname, email, and phone already exists',
			});
			return;
		}

		const result = await query(
			'INSERT INTO employees (name, surname, academic_title, email, phone, funkce1, funkce2, funkce3, funkce4) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
			[
				name,
				surname,
				academicTitle,
				email,
				phone,
				pozice1,
				pozice2,
				pozice3,
				pozice4,
			]
		);
		res.json({
			status: 'success',
			message: 'Employee added successfully',
			data: result,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			status: 'error',
			message: 'Error adding employee',
			error: error.message,
		});
	}
});

// Add this new route to fetch all employees
router.get('/all/employees', async (req, res) => {
	try {
		const result = await query('SELECT * FROM employees');
		res.json({
			status: 'success',
			message: 'Employees fetched successfully',
			data: result,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			status: 'error',
			message: 'Error fetching employees',
			error_message: error.message,
			error: error,
		});
	}
});

router.get('/employee/get/:id', async (req, res) => {
	const id = req.params.id;
	try {
		const result = await query(
			'SELECT * FROM employees WHERE employee_id=?',
			id
		);
		res.json({
			status: 'success',
			message: "Employee's detail fetched successfully",
			employee: result,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			status: 'error',
			message: "Error fetching employee' detail",
			error_message: error.message,
			error: error,
		});
	}
});

router.delete('/delete/employee/:idDelete', async (req, res) => {
	const id = req.params.idDelete;
	try {
		// Assuming 'employeesDbPool.query()' already returns a promise
		const result = await query(
			'DELETE FROM employees WHERE employee_id = ?',
			id
		);

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

router.patch('/update/employee/:idUpdate', async (req, res) => {
	const idUpdate = req.params.idUpdate;
	const employee = req.body;
	const {employee_id, ...rest} = employee;
	const funkce2 = rest.funkce2 || 'N/A';
	const funkce3 = rest.funkce3 || 'N/A';
	const funkce4 = rest.funkce4 || 'N/A';

	try {
		// Update employee record in the database
		if (parseInt(idUpdate) === parseInt(employee_id)) {
			const result = await query(
				`UPDATE employees
			 SET name = ?, surname = ?, academic_title = ?, email = ?, phone = ?, funkce1 = ?, funkce2 = ?, funkce3 = ?, funkce4 = ?
			 WHERE employee_id = ?`,
				[
					employee.name,
					employee.surname,
					employee.academic_title,
					employee.email,
					employee.phone,
					employee.funkce1,
					funkce2,
					funkce3,
					funkce4,
					idUpdate,
				]
			);

			if (result.affectedRows > 0) {
				res.status(200).send({
					status: 'success',
					message: 'Employee updated successfully',
				});
			} else {
				res.status(404).send({
					status: 'error',
					message: `Employee with id ${idUpdate} not found.`,
				});
			}
		}
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server error');
	}
});

module.exports = router;
