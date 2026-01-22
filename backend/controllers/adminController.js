const { Op } = require('sequelize');
const { Ticket, Message, User, Admin, Notice } = require('../models/associations');

// ==================== DASHBOARD ====================

// @desc    Get admin dashboard counts
// @route   GET /api/admin/dashboard/counts
// @access  Private (Admin)
const getDashboardCounts = async (req, res, next) => {
  try {
    const [totalTickets, openTickets, inprogressTickets, closedTickets, totalUsers] = await Promise.all([
      Ticket.count(),
      Ticket.count({ where: { status: 'open' } }),
      Ticket.count({ where: { status: 'inprogress' } }),
      Ticket.count({ where: { status: 'close' } }),
      User.count()
    ]);

    res.json({
      success: true,
      data: {
        totalTickets,
        openTickets,
        inprogressTickets,
        closedTickets,
        totalUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent tickets for dashboard
// @route   GET /api/admin/dashboard/recent-tickets
// @access  Private (Admin)
const getRecentTickets = async (req, res, next) => {
  try {
    const { status = 'all', limit = 5 } = req.query;

    const whereClause = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const tickets = await Ticket.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'username']
        }
      ],
      order: [['date', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    next(error);
  }
};

// ==================== TICKETS ====================

// @desc    Get all tickets with pagination, search and filters
// @route   GET /api/admin/tickets
// @access  Private (Admin)
const getAllTickets = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      priority = '',
      category = ''
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const whereClause = {};

    // Filter by status
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    // Filter by priority
    if (priority && priority !== 'all') {
      whereClause.priority = priority;
    }

    // Filter by category
    if (category && category !== 'all') {
      whereClause.category = category;
    }

    // Search by id, subject
    if (search) {
      whereClause[Op.or] = [
        { id: { [Op.like]: `%${search.replace('#', '')}%` } },
        { subject: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: tickets } = await Ticket.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'username', 'department', 'branch']
        }
      ],
      order: [['date', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: tickets,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single ticket by ID
// @route   GET /api/admin/tickets/:id
// @access  Private (Admin)
const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByPk(id, {
      include: [
        {
          model: Message,
          as: 'messages',
          include: [
            { model: User, as: 'userSender', attributes: ['id', 'name'] },
            { model: Admin, as: 'adminSender', attributes: ['id', 'username'] }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'username', 'mobile', 'department', 'branch']
        }
      ],
      order: [[{ model: Message, as: 'messages' }, 'createdAt', 'ASC']]
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ticket status/priority
// @route   PUT /api/admin/tickets/:id
// @access  Private (Admin)
const updateTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, priority, category } = req.body;

    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Update fields if provided
    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;
    if (category) ticket.category = category;

    await ticket.save();

    res.json({
      success: true,
      message: 'Ticket updated successfully',
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add admin reply to ticket
// @route   POST /api/admin/tickets/:id/messages
// @access  Private (Admin)
const addAdminMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const admin_id = req.admin.id;
    const hasFiles = req.files && req.files.length > 0;

    if (!message && !hasFiles) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message or attachment'
      });
    }

    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if ticket is closed - prevent new messages
    if (ticket.status === 'close') {
      return res.status(400).json({
        success: false,
        message: 'Cannot add messages to a closed ticket'
      });
    }

    // Check if this is the first admin message - change status to inprogress
    if (ticket.status === 'open') {
      const existingAdminMessages = await Message.count({
        where: {
          ticket_id: ticket.id,
          sender_type: 'admin'
        }
      });

      if (existingAdminMessages === 0) {
        ticket.status = 'inprogress';
        await ticket.save();
      }
    }

    const createdMessages = [];

    // Create text message if provided
    if (message) {
      const textMessage = await Message.create({
        ticket_id: ticket.id,
        sender_type: 'admin',
        sender_id: admin_id,
        message: message
      });
      createdMessages.push(textMessage);
    }

    // Create attachment message if files provided
    if (hasFiles) {
      const attachmentPaths = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: `/uploads/attachments/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype
      }));

      const attachmentMessage = await Message.create({
        ticket_id: ticket.id,
        sender_type: 'admin',
        sender_id: admin_id,
        message: JSON.stringify({
          type: 'attachment',
          files: attachmentPaths
        })
      });
      createdMessages.push(attachmentMessage);
    }

    // Fetch the created messages with sender info
    const messageIds = createdMessages.map(m => m.id);
    const fetchedMessages = await Message.findAll({
      where: { id: messageIds },
      include: [
        { model: User, as: 'userSender', attributes: ['id', 'name'] },
        { model: Admin, as: 'adminSender', attributes: ['id', 'username'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      data: fetchedMessages,
      ticketStatus: ticket.status
    });
  } catch (error) {
    next(error);
  }
};

// ==================== USERS ====================

// @desc    Get all users with pagination, search and filters
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      branch = '',
      department = ''
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const whereClause = {};

    // Filter by branch
    if (branch && branch !== 'all') {
      whereClause.branch = { [Op.like]: `%${branch}%` };
    }

    // Filter by department
    if (department && department !== 'all') {
      whereClause.department = { [Op.like]: `%${department}%` };
    }

    // Search by name, username, mobile, department, branch
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { username: { [Op.like]: `%${search}%` } },
        { mobile: { [Op.like]: `%${search}%` } },
        { department: { [Op.like]: `%${search}%` } },
        { branch: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['id', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Ticket,
          as: 'tickets',
          limit: 10,
          order: [['date', 'DESC']]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user
// @route   POST /api/admin/users
// @access  Private (Admin)
const createUser = async (req, res, next) => {
  try {
    const { name, username, password, mobile, department, branch } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email (username) and password are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
      return res.status(400).json({
        success: false,
        message: 'Username must be a valid email address'
      });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ where: { username: username.toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Create user
    const user = await User.create({
      name: name || null,
      username: username.toLowerCase(),
      password,
      mobile: mobile || null,
      department: department || null,
      branch: branch || null,
      auth_provider: 'local'
    });

    // Return user without password
    const userData = user.toJSON();
    delete userData.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, username, password, mobile, department, branch } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if username is being changed and already exists
    if (username && username.toLowerCase() !== user.username) {
      const existingUser = await User.findOne({ where: { username: username.toLowerCase() } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Update fields
    if (name !== undefined) user.name = name;
    if (username) user.username = username.toLowerCase();
    if (password) user.password = password; // Will be hashed by hook
    if (mobile !== undefined) user.mobile = mobile;
    if (department !== undefined) user.department = department;
    if (branch !== undefined) user.branch = branch;

    await user.save();

    // Return user without password
    const userData = user.toJSON();
    delete userData.password;

    res.json({
      success: true,
      message: 'User updated successfully',
      data: userData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ==================== NOTICES ====================

// @desc    Get all notices with pagination
// @route   GET /api/admin/notices
// @access  Private (Admin)
const getAllNotices = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = ''
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const { count, rows: notices } = await Notice.findAndCountAll({
      where: whereClause,
      include: [
        { model: Admin, as: 'author', attributes: ['id', 'username'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: notices,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single notice by ID
// @route   GET /api/admin/notices/:id
// @access  Private (Admin)
const getNoticeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findByPk(id, {
      include: [
        { model: Admin, as: 'author', attributes: ['id', 'username'] }
      ]
    });

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    res.json({
      success: true,
      data: notice
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new notice (draft or publish)
// @route   POST /api/admin/notices
// @access  Private (Admin)
const createNotice = async (req, res, next) => {
  try {
    const { topic, message, status = 'draft' } = req.body;
    const admin_id = req.admin.id;

    if (!topic || !message) {
      return res.status(400).json({
        success: false,
        message: 'Topic and message are required'
      });
    }

    const notice = await Notice.create({
      topic,
      message,
      status,
      admin_id
    });

    const createdNotice = await Notice.findByPk(notice.id, {
      include: [
        { model: Admin, as: 'author', attributes: ['id', 'username'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: status === 'sent' ? 'Notice published successfully' : 'Notice saved as draft',
      data: createdNotice
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update notice
// @route   PUT /api/admin/notices/:id
// @access  Private (Admin)
const updateNotice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { topic, message, status } = req.body;

    const notice = await Notice.findByPk(id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    // Update fields
    if (topic) notice.topic = topic;
    if (message) notice.message = message;
    if (status) notice.status = status;

    await notice.save();

    const updatedNotice = await Notice.findByPk(notice.id, {
      include: [
        { model: Admin, as: 'author', attributes: ['id', 'username'] }
      ]
    });

    res.json({
      success: true,
      message: 'Notice updated successfully',
      data: updatedNotice
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish notice (change status to sent)
// @route   PUT /api/admin/notices/:id/publish
// @access  Private (Admin)
const publishNotice = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findByPk(id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    notice.status = 'sent';
    await notice.save();

    res.json({
      success: true,
      message: 'Notice published successfully',
      data: notice
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notice
// @route   DELETE /api/admin/notices/:id
// @access  Private (Admin)
const deleteNotice = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findByPk(id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    await notice.destroy();

    res.json({
      success: true,
      message: 'Notice deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  // Dashboard
  getDashboardCounts,
  getRecentTickets,
  // Tickets
  getAllTickets,
  getTicketById,
  updateTicket,
  addAdminMessage,
  // Users
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  // Notices
  getAllNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  publishNotice,
  deleteNotice
};
