const { Op } = require('sequelize');
const { Ticket, Message, User, Branch, Department, Notice } = require('../models/associations');
const path = require('path');

// @desc    Create a new ticket
// @route   POST /api/user/tickets
// @access  Private (User)
const createTicket = async (req, res, next) => {
  try {
    const { subject, category, priority, description } = req.body;
    const user_id = req.user.id;

    // Validate required fields
    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Subject and description are required'
      });
    }

    // Create the ticket
    const ticket = await Ticket.create({
      subject,
      category: category || 'other',
      priority: priority || 'low',
      status: 'open',
      user_id,
      date: new Date()
    });

    // Create the first message (description)
    await Message.create({
      messagae: description,
      ticket_id: ticket.id,
      user_id
    });

    // If there are attachments, create a second message for them
    if (req.files && req.files.length > 0) {
      const attachmentPaths = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: `/uploads/attachments/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype
      }));

      await Message.create({
        messagae: JSON.stringify({
          type: 'attachment',
          files: attachmentPaths
        }),
        ticket_id: ticket.id,
        user_id
      });
    }

    // Fetch the created ticket with associations
    const createdTicket = await Ticket.findByPk(ticket.id, {
      include: [
        {
          model: Message,
          as: 'messages',
          include: [{ model: User, as: 'sender', attributes: ['id', 'name'] }]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'emp_no'],
          include: [
            { model: Branch, as: 'branch', attributes: ['id', 'name'] },
            { model: Department, as: 'department', attributes: ['id', 'name'] }
          ]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: createdTicket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tickets for logged in user with pagination and search
// @route   GET /api/user/tickets
// @access  Private (User)
const getTickets = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      myTickets = 'true'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const whereClause = {};

    // Filter by user's own tickets or all (if admin allows seeing all)
    if (myTickets === 'true') {
      whereClause.user_id = user_id;
    }

    // Filter by status
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    // Search by id, subject or keyword
    if (search) {
      whereClause[Op.or] = [
        { id: { [Op.like]: `%${search.replace('#', '').replace('REQ-', '').replace(/-/g, '')}%` } },
        { subject: { [Op.like]: `%${search}%` } }
      ];
    }

    // Get tickets with pagination
    const { count, rows: tickets } = await Ticket.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'emp_no'],
          include: [
            { model: Branch, as: 'branch', attributes: ['id', 'name'] },
            { model: Department, as: 'department', attributes: ['id', 'name'] }
          ]
        }
      ],
      order: [['date', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    // Calculate pagination info
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
// @route   GET /api/user/tickets/:id
// @access  Private (User)
const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const ticket = await Ticket.findOne({
      where: {
        id,
        user_id // User can only view their own tickets
      },
      include: [
        {
          model: Message,
          as: 'messages',
          include: [{ model: User, as: 'sender', attributes: ['id', 'name'] }]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'emp_no'],
          include: [
            { model: Branch, as: 'branch', attributes: ['id', 'name'] },
            { model: Department, as: 'department', attributes: ['id', 'name'] }
          ]
        }
      ]
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

// @desc    Get dashboard counts for user
// @route   GET /api/user/tickets/dashboard/counts
// @access  Private (User)
const getDashboardCounts = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    // Get counts for user's tickets
    const [total, open, inprogress, closed] = await Promise.all([
      Ticket.count({ where: { user_id } }),
      Ticket.count({ where: { user_id, status: 'open' } }),
      Ticket.count({ where: { user_id, status: 'inprogress' } }),
      Ticket.count({ where: { user_id, status: 'close' } })
    ]);

    res.json({
      success: true,
      data: {
        total,
        open,
        inprogress,
        closed
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add message/reply to ticket
// @route   POST /api/user/tickets/:id/messages
// @access  Private (User)
const addMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const user_id = req.user.id;
    const hasFiles = req.files && req.files.length > 0;

    // Validate - must have either message or files
    if (!message && !hasFiles) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message or attachment'
      });
    }

    // Check if ticket exists and belongs to user
    const ticket = await Ticket.findOne({
      where: { id, user_id }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    const createdMessages = [];

    // Create text message if provided
    if (message) {
      const textMessage = await Message.create({
        messagae: message,
        ticket_id: ticket.id,
        user_id
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
        messagae: JSON.stringify({
          type: 'attachment',
          files: attachmentPaths
        }),
        ticket_id: ticket.id,
        user_id
      });
      createdMessages.push(attachmentMessage);
    }

    // Fetch the created messages with sender info
    const messageIds = createdMessages.map(m => m.id);
    const fetchedMessages = await Message.findAll({
      where: { id: messageIds },
      include: [{ model: User, as: 'sender', attributes: ['id', 'name'] }]
    });

    res.status(201).json({
      success: true,
      message: 'Message added successfully',
      data: fetchedMessages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all notices with pagination
// @route   GET /api/user/notices
// @access  Private (User)
const getNotices = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: notices } = await Notice.findAndCountAll({
      attributes: ['id', 'topic', 'message', 'createdAt'],
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

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  getDashboardCounts,
  addMessage,
  getNotices
};
