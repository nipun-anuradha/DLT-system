const { Op } = require('sequelize');
const { Ticket, Message, User, Admin, Notice, IssueCategory, IssueSubCategory, IssueDetail } = require('../models/associations');
const path = require('path');

const ticketListInclude = [
  {
    model: User,
    as: 'user',
    attributes: ['id', 'name', 'department', 'branch', 'mobile', 'device_type', 'device_model', 'device_specs', 'device_notes']
  },
  {
    model: Admin,
    as: 'assignedAdmin',
    attributes: ['id', 'username']
  },
  {
    model: Admin,
    as: 'resolvedByAdmin',
    attributes: ['id', 'username']
  }
];

// @desc    Create a new ticket
// @route   POST /api/user/tickets
// @access  Private (User)
const createTicket = async (req, res, next) => {
  try {
    const { subject, category, priority, description, issue_category, issue_type, issue_detail } = req.body;
    const user_id = req.user.id;

    const preparedSubject = subject || [issue_category, issue_type, issue_detail].filter(Boolean).join(' / ');
    const preparedDescription = description || [
      issue_category ? `Category: ${issue_category}` : null,
      issue_type ? `Item: ${issue_type}` : null,
      issue_detail ? `Detail: ${issue_detail}` : null
    ].filter(Boolean).join('\n');

    // Validate required fields
    if (!preparedSubject || !preparedDescription) {
      return res.status(400).json({
        success: false,
        message: 'Subject and description are required'
      });
    }

    // Create the ticket
    const ticket = await Ticket.create({
      subject: preparedSubject,
      category: category || issue_category || 'other',
      issue_category: issue_category || null,
      issue_type: issue_type || null,
      issue_detail: issue_detail || null,
      priority: priority || 'low',
      status: 'open',
      user_id,
      date: new Date()
    });

    // Create the first message (description)
    await Message.create({
      ticket_id: ticket.id,
      sender_type: 'user',
      sender_id: user_id,
      message: preparedDescription
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
        ticket_id: ticket.id,
        sender_type: 'user',
        sender_id: user_id,
        message: JSON.stringify({
          type: 'attachment',
          files: attachmentPaths
        })
      });
    }

    // Fetch the created ticket with associations
    const createdTicket = await Ticket.findByPk(ticket.id, {
      include: [
        {
          model: Message,
          as: 'messages',
          include: [
            { model: User, as: 'userSender', attributes: ['id', 'name'] },
            { model: Admin, as: 'adminSender', attributes: ['id', 'username'] }
          ],
          order: [['createdAt', 'ASC']]
        },
        ...ticketListInclude
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

// @desc    Get issue selection hierarchy for guided ticket creation
// @route   GET /api/user/issue-hierarchy
// @access  Private (User)
const getIssueHierarchy = async (req, res, next) => {
  try {
    const categories = await IssueCategory.findAll({
      where: { is_active: true },
      include: [{
        model: IssueSubCategory,
        as: 'subCategories',
        where: { is_active: true },
        include: [{
          model: IssueDetail,
          as: 'details',
          where: { is_active: true },
          required: false
        }]
      }],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: categories
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
      if (status === 'inprogress') {
        whereClause.status = { [Op.in]: ['inprogress', 'taken'] };
      } else {
        whereClause.status = status;
      }
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
      include: ticketListInclude,
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
          include: [
            { model: User, as: 'userSender', attributes: ['id', 'name'] },
            { model: Admin, as: 'adminSender', attributes: ['id', 'username'] }
          ]
        },
        ...ticketListInclude
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
      Ticket.count({ where: { user_id, status: { [Op.in]: ['inprogress', 'taken'] } } }),
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
        ticket_id: ticket.id,
        sender_type: 'user',
        sender_id: user_id,
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
        sender_type: 'user',
        sender_id: user_id,
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

// @desc    Close a ticket
// @route   PUT /api/user/tickets/:id/close
// @access  Private (User)
const closeTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const { resolvedByAdminId } = req.body;

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

    // Check if ticket is already closed
    if (ticket.status === 'close') {
      return res.status(400).json({
        success: false,
        message: 'Ticket is already closed'
      });
    }

    if (!resolvedByAdminId) {
      return res.status(400).json({
        success: false,
        message: 'Please select the admin who fixed the issue'
      });
    }

    const resolvedAdmin = await Admin.findByPk(resolvedByAdminId);
    if (!resolvedAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Selected admin was not found'
      });
    }

    // Update ticket status to close
    await ticket.update({
      status: 'close',
      resolved_by_admin_id: resolvedAdmin.id,
      resolved_at: new Date(),
      assigned_admin_id: ticket.assigned_admin_id || resolvedAdmin.id,
      assigned_at: ticket.assigned_at || new Date()
    });

    const closedTicket = await Ticket.findByPk(ticket.id, {
      include: ticketListInclude
    });

    res.json({
      success: true,
      message: 'Ticket closed successfully',
      data: closedTicket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admins for ticket resolution selection
// @route   GET /api/user/admins
// @access  Private (User)
const getAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.findAll({
      attributes: ['id', 'username'],
      order: [['username', 'ASC']]
    });

    res.json({
      success: true,
      data: admins
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket,
  getIssueHierarchy,
  getTickets,
  getTicketById,
  getDashboardCounts,
  addMessage,
  getNotices,
  getAdmins,
  closeTicket
};
