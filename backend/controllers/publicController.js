const { Branch, Department } = require('../models/associations');

// @desc    Get all branches
// @route   GET /api/public/branches
// @access  Public
const getBranches = async (req, res, next) => {
  try {
    const branches = await Branch.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: branches
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all departments
// @route   GET /api/public/departments
// @access  Public
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBranches,
  getDepartments
};
