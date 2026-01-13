const jwt = require('jsonwebtoken');
const { User, Admin, Branch, Department, Log } = require('../models/associations');

const JWT_SECRET = process.env.JWT_SECRET;

// Generate JWT Token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, emp_no, username, password, mobile, branch_id, department_id } = req.body;

    // Validate all required fields
    if (!name || !emp_no || !username || !password || !mobile || !branch_id || !department_id) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: name, emp_no, username, password, mobile, branch_id, department_id'
      });
    }

    // Validate branch_id exists in database
    const branch = await Branch.findByPk(branch_id);
    if (!branch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid branch_id. Branch does not exist'
      });
    }

    // Validate department_id exists in database
    const department = await Department.findByPk(department_id);
    if (!department) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department_id. Department does not exist'
      });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Check if emp_no already exists
    const existingEmpNo = await User.findOne({ where: { emp_no } });
    if (existingEmpNo) {
      return res.status(400).json({
        success: false,
        message: 'Employee number already exists'
      });
    }

    // Create new user (password will be hashed by hook)
    const user = await User.create({
      name,
      emp_no,
      username,
      password,
      mobile,
      branch_id,
      department_id
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user.id,
        name: user.name,
        emp_no: user.emp_no,
        username: user.username,
        mobile: user.mobile,
        branch_id: user.branch_id,
        department_id: user.department_id
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Find user by username with associations
    const user = await User.findOne({
      where: { username },
      include: [
        { model: Branch, as: 'branch', attributes: ['id', 'name'] },
        { model: Department, as: 'department', attributes: ['id', 'name'] }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Verify password
    const isMatch = await user.verifyPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: 'user'
    });

    // Log the login
    const ip = req.ip || req.connection.remoteAddress;
    await Log.create({ ip, user_id: user.id });

    // Prepare response data (exclude password)
    const userData = user.toJSON();
    delete userData.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: userData,
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin Login
// @route   POST /api/auth/admin/login
// @access  Public
const loginAdmin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Find admin by username
    const admin = await Admin.findOne({ where: { username } });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Verify password (simple string comparison for now)
    if (admin.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Generate token with admin role
    const token = generateToken({
      id: admin.id,
      username: admin.username,
      role: 'admin'
    });

    // Log the admin login
    const ip = req.ip || req.connection.remoteAddress;
    await Log.create({ ip, Admin_id: admin.id });

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        id: admin.id,
        username: admin.username
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

// Get public branches for registration
const getPublicBranches = async (req, res, next) => {
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

// Get public departments for registration
const getPublicDepartments = async (req, res, next) => {
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
  registerUser,
  loginUser,
  loginAdmin,
  getPublicBranches,
  getPublicDepartments,
};
