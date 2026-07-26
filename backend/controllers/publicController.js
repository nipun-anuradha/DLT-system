const { Branch, Department } = require('../models/associations');

// @desc    Get registration lookup data
// @route   GET /api/public/registration-data
// @access  Public
const getRegistrationData = async (req, res, next) => {
	try {
		const [branches, departments] = await Promise.all([
			Branch.findAll({
				attributes: ['id', 'name'],
				order: [['name', 'ASC']]
			}),
			Department.findAll({
				attributes: ['id', 'name'],
				order: [['name', 'ASC']]
			})
		]);

		res.json({
			success: true,
			data: {
				branches,
				departments
			}
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	getRegistrationData
};
