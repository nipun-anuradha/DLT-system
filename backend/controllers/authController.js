const jwt = require('jsonwebtoken');
const { User, Admin, Log } = require('../models/associations');

const JWT_SECRET = process.env.JWT_SECRET;

// Generate JWT Token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Register a new user (local registration)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, username, password, mobile, department, branch } = req.body;

    // Validate required fields - only username and password required for local registration
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username (email) and password are required'
      });
    }

    // Validate email format for username
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
      return res.status(400).json({
        success: false,
        message: 'Username must be a valid email address'
      });
    }

    // Check if username (email) already exists
    const existingUser = await User.findOne({ where: { username: username.toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered'
      });
    }

    // Create new user (password will be hashed by hook)
    const user = await User.create({
      name: name || null,
      username: username.toLowerCase(),
      password,
      mobile: mobile || null,
      department: department || null,
      branch: branch || null,
      auth_provider: 'local'
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        mobile: user.mobile,
        department: user.department,
        branch: user.branch
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user (local login with password)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Find user by username (email)
    const user = await User.findOne({
      where: { username: username.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Check if user has password (MS-only users don't have password)
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'This account uses Microsoft Sign-In. Please use the Microsoft button to login.'
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

// @desc    Microsoft Sign-In - Register or Login
// @route   POST /api/auth/microsoft
// @access  Public
const microsoftAuth = async (req, res, next) => {
  try {
    const { 
      microsoftId,
      email, 
      displayName, 
      department, 
      mobilePhone,
      city // Will be used as branch/city
    } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required from Microsoft account'
      });
    }

    const normalizedEmail = email.toLowerCase();

    // Check if user exists by Microsoft ID first
    let user = await User.findByMicrosoftId(microsoftId);
    
    // If not found by MS ID, check by email
    if (!user) {
      user = await User.findByUsername(normalizedEmail);
    }

    let isNewUser = false;

    if (user) {
      // Existing user - update Microsoft ID if not set
      if (!user.microsoft_id && microsoftId) {
        user.microsoft_id = microsoftId;
        user.auth_provider = 'microsoft';
        await user.save();
      }
      
      // Optionally update user info from Microsoft
      // (only update if fields are null to not override manual edits)
      if (!user.name && displayName) user.name = displayName;
      if (!user.department && department) user.department = department;
      if (!user.mobile && mobilePhone) user.mobile = mobilePhone;
      if (!user.branch && city) user.branch = city;
      await user.save();
      
    } else {
      // New user - create account with Microsoft data
      isNewUser = true;
      user = await User.create({
        name: displayName || null,
        username: normalizedEmail,
        password: null, // No password for MS-only users
        mobile: mobilePhone || null,
        department: department || null,
        branch: city || null,
        microsoft_id: microsoftId,
        auth_provider: 'microsoft'
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
      message: isNewUser ? 'Account created and logged in successfully' : 'Login successful',
      isNewUser,
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

    // Generate token with admin role and super status
    const token = generateToken({
      id: admin.id,
      username: admin.username,
      role: 'admin',
      is_super: admin.is_super || false
    });

    // Log the admin login
    const ip = req.ip || req.connection.remoteAddress;
    await Log.create({ ip, Admin_id: admin.id });

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        id: admin.id,
        username: admin.username,
        is_super: admin.is_super || false
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  microsoftAuth,
  loginAdmin,
};
