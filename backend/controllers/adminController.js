const { Op } = require('sequelize');
const { Ticket, Message, User, Admin, Notice, InventoryItem, InventoryTransfer, AssetType } = require('../models/associations');

const ticketListInclude = [
  {
    model: User,
    as: 'user',
    attributes: ['id', 'name', 'username', 'department', 'branch', 'mobile', 'device_type', 'device_model', 'device_specs', 'device_notes']
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

// ==================== DASHBOARD ====================

// @desc    Get admin dashboard counts
// @route   GET /api/admin/dashboard/counts
// @access  Private (Admin)
const getDashboardCounts = async (req, res, next) => {
  try {
    const [totalTickets, openTickets, inprogressTickets, closedTickets, totalUsers] = await Promise.all([
      Ticket.count(),
      Ticket.count({ where: { status: 'open' } }),
      Ticket.count({ where: { status: { [Op.in]: ['inprogress', 'taken'] } } }),
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

// ==================== INVENTORY ====================

const inventoryItemInclude = [
  {
    model: User,
    as: 'assignedUser',
    attributes: ['id', 'name', 'username', 'department', 'branch', 'mobile', 'device_type', 'device_model', 'device_specs', 'device_notes']
  }
];

const inventoryTransferInclude = [
  { model: User, as: 'fromUser', attributes: ['id', 'name', 'username'] },
  { model: User, as: 'toUser', attributes: ['id', 'name', 'username'] },
  { model: Admin, as: 'transferredByAdmin', attributes: ['id', 'username'] }
];

const getInventorySummary = async (req, res, next) => {
  try {
    const [totalItems, availableItems, assignedItems, repairItems, retiredItems] = await Promise.all([
      InventoryItem.count(),
      InventoryItem.count({ where: { status: 'available' } }),
      InventoryItem.count({ where: { status: 'assigned' } }),
      InventoryItem.count({ where: { status: 'repair' } }),
      InventoryItem.count({ where: { status: 'retired' } })
    ]);

    const groupedByType = await InventoryItem.findAll({
      attributes: [
        'item_type',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['item_type']
    });

    res.json({
      success: true,
      data: {
        totalItems,
        availableItems,
        assignedItems,
        repairItems,
        retiredItems,
        groupedByType: groupedByType.map((row) => ({
          item_type: row.item_type,
          count: Number(row.getDataValue('count'))
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAssetTypes = async (req, res, next) => {
  try {
    const assetTypes = await AssetType.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC'], ['name', 'ASC']],
      attributes: ['id', 'name']
    });

    res.json({
      success: true,
      data: assetTypes
    });
  } catch (error) {
    next(error);
  }
};

const getInventoryItems = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      type = 'all',
      status = 'all',
      branch = 'all',
      department = 'all',
      userId = ''
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const whereClause = {};

    if (type && type !== 'all') {
      whereClause.item_type = type;
    }
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    if (branch && branch !== 'all') {
      whereClause.assigned_branch = { [Op.like]: `%${branch}%` };
    }
    if (department && department !== 'all') {
      whereClause.assigned_department = { [Op.like]: `%${department}%` };
    }
    if (userId) {
      whereClause.assigned_user_id = userId;
    }
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { model: { [Op.like]: `%${search}%` } },
        { serial_number: { [Op.like]: `%${search}%` } },
        { asset_tag: { [Op.like]: `%${search}%` } },
        { assigned_branch: { [Op.like]: `%${search}%` } },
        { assigned_department: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } },
        { '$assignedUser.name$': { [Op.like]: `%${search}%` } },
        { '$assignedUser.username$': { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await InventoryItem.findAndCountAll({
      where: whereClause,
      include: inventoryItemInclude,
      order: [['updatedAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
        totalItems: count,
        itemsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) * parseInt(limit) < count,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

const getInventoryUserHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'username', 'department', 'branch', 'mobile', 'device_type', 'device_model', 'device_specs', 'device_notes']
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [currentItems, transferHistory] = await Promise.all([
      InventoryItem.findAll({
        where: { assigned_user_id: id },
        include: inventoryItemInclude,
        order: [['updatedAt', 'DESC']]
      }),
      InventoryTransfer.findAll({
        where: {
          [Op.or]: [
            { to_user_id: id },
            { from_user_id: id }
          ]
        },
        include: [
          { model: InventoryItem, as: 'item' },
          { model: User, as: 'fromUser', attributes: ['id', 'name', 'username', 'department', 'branch'] },
          { model: User, as: 'toUser', attributes: ['id', 'name', 'username', 'department', 'branch'] },
          { model: Admin, as: 'transferredByAdmin', attributes: ['id', 'username'] }
        ],
        order: [['transferred_at', 'DESC'], ['createdAt', 'DESC']]
      })
    ]);

    res.json({
      success: true,
      data: {
        user,
        currentItems,
        transferHistory
      }
    });
  } catch (error) {
    next(error);
  }
};

const getInventoryItemHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await InventoryItem.findByPk(id, {
      include: inventoryItemInclude
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    const transfers = await InventoryTransfer.findAll({
      where: { inventory_item_id: id },
      include: [
        { model: User, as: 'fromUser', attributes: ['id', 'name', 'username', 'department', 'branch'] },
        { model: User, as: 'toUser', attributes: ['id', 'name', 'username', 'department', 'branch'] },
        { model: Admin, as: 'transferredByAdmin', attributes: ['id', 'username'] }
      ],
      order: [['transferred_at', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        item,
        transfers
      }
    });
  } catch (error) {
    next(error);
  }
};

const getInventoryItemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await InventoryItem.findByPk(id, {
      include: [
        ...inventoryItemInclude,
        {
          model: InventoryTransfer,
          as: 'transfers',
          include: inventoryTransferInclude,
          order: [['transferred_at', 'DESC'], ['createdAt', 'DESC']]
        }
      ]
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

const createInventoryItem = async (req, res, next) => {
  try {
    const {
      item_type,
      name,
      model,
      serial_number,
      asset_tag,
      specs,
      status = 'available',
      assigned_user_id,
      assigned_department,
      assigned_branch,
      location,
      notes
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Item name is required' });
    }

    const item = await InventoryItem.create({
      item_type: item_type || 'other',
      name,
      model: model || null,
      serial_number: serial_number || null,
      asset_tag: asset_tag || null,
      specs: specs || null,
      status,
      assigned_user_id: assigned_user_id || null,
      assigned_department: assigned_department || null,
      assigned_branch: assigned_branch || null,
      location: location || null,
      notes: notes || null,
      assigned_at: assigned_user_id ? new Date() : null
    });

    if (assigned_user_id || assigned_department || assigned_branch) {
      await InventoryTransfer.create({
        inventory_item_id: item.id,
        to_user_id: assigned_user_id || null,
        to_department: assigned_department || null,
        to_branch: assigned_branch || null,
        transferred_by_admin_id: req.admin.id,
        notes: notes || 'Initial assignment',
        transferred_at: new Date()
      });
    }

    const createdItem = await InventoryItem.findByPk(item.id, { include: inventoryItemInclude });

    res.status(201).json({ success: true, message: 'Inventory item created successfully', data: createdItem });
  } catch (error) {
    next(error);
  }
};

const updateInventoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await InventoryItem.findByPk(id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    const previousAssignment = {
      assigned_user_id: item.assigned_user_id,
      assigned_department: item.assigned_department,
      assigned_branch: item.assigned_branch
    };

    const updatableFields = ['item_type', 'name', 'model', 'serial_number', 'asset_tag', 'specs', 'status', 'assigned_user_id', 'assigned_department', 'assigned_branch', 'location', 'notes'];
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field] || null;
      }
    });

    const currentAssignment = {
      assigned_user_id: item.assigned_user_id,
      assigned_department: item.assigned_department,
      assigned_branch: item.assigned_branch
    };

    const assignmentChanged = Object.keys(previousAssignment).some((key) => `${previousAssignment[key] || ''}` !== `${currentAssignment[key] || ''}`);

    if (assignmentChanged && (currentAssignment.assigned_user_id || currentAssignment.assigned_department || currentAssignment.assigned_branch)) {
      await InventoryTransfer.create({
        inventory_item_id: item.id,
        from_user_id: previousAssignment.assigned_user_id || null,
        to_user_id: currentAssignment.assigned_user_id || null,
        from_department: previousAssignment.assigned_department || null,
        to_department: currentAssignment.assigned_department || null,
        from_branch: previousAssignment.assigned_branch || null,
        to_branch: currentAssignment.assigned_branch || null,
        transferred_by_admin_id: req.admin.id,
        notes: req.body.transfer_notes || 'Assignment updated via edit',
        transferred_at: new Date()
      });
      item.assigned_at = new Date();
    }

    if (!item.assigned_user_id && !item.assigned_department && !item.assigned_branch) {
      item.status = req.body.status || item.status;
    }

    await item.save();

    const updatedItem = await InventoryItem.findByPk(item.id, { include: inventoryItemInclude });

    res.json({ success: true, message: 'Inventory item updated successfully', data: updatedItem });
  } catch (error) {
    next(error);
  }
};

const transferInventoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { to_user_id, to_department, to_branch, notes } = req.body;

    const item = await InventoryItem.findByPk(id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    await InventoryTransfer.create({
      inventory_item_id: item.id,
      from_user_id: item.assigned_user_id || null,
      to_user_id: to_user_id || null,
      from_department: item.assigned_department || null,
      to_department: to_department || null,
      from_branch: item.assigned_branch || null,
      to_branch: to_branch || null,
      transferred_by_admin_id: req.admin.id,
      notes: notes || 'Transferred by admin',
      transferred_at: new Date()
    });

    item.assigned_user_id = to_user_id || null;
    item.assigned_department = to_department || null;
    item.assigned_branch = to_branch || null;
    item.status = to_user_id || to_department || to_branch ? 'assigned' : 'available';
    item.assigned_at = new Date();
    await item.save();

    const updatedItem = await InventoryItem.findByPk(item.id, {
      include: [
        ...inventoryItemInclude,
        { model: InventoryTransfer, as: 'transfers', include: inventoryTransferInclude, order: [['transferred_at', 'DESC']] }
      ]
    });

    res.json({ success: true, message: 'Inventory transfer saved successfully', data: updatedItem });
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
      if (status === 'inprogress') {
        whereClause.status = { [Op.in]: ['inprogress', 'taken'] };
      } else {
        whereClause.status = status;
      }
    }

    const tickets = await Ticket.findAll({
      where: whereClause,
      include: ticketListInclude,
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
      if (status === 'inprogress') {
        whereClause.status = { [Op.in]: ['inprogress', 'taken'] };
      } else {
        whereClause.status = status;
      }
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
      include: ticketListInclude,
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
        ...ticketListInclude.map((include) => (
          include.as === 'user'
            ? {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'username', 'mobile', 'department', 'branch']
              }
            : include
        ))
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
    const { status, priority, category, resolvedByAdminId } = req.body;

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

    if (status === 'taken' || status === 'inprogress') {
      ticket.assigned_admin_id = req.admin.id;
      if (!ticket.assigned_at) {
        ticket.assigned_at = new Date();
      }
      ticket.status = 'inprogress';
    }

    if (status === 'close') {
      const resolvedAdminId = resolvedByAdminId || req.admin.id;
      ticket.resolved_by_admin_id = resolvedAdminId;
      ticket.resolved_at = new Date();
      if (!ticket.assigned_admin_id) {
        ticket.assigned_admin_id = resolvedAdminId;
      }
      if (!ticket.assigned_at) {
        ticket.assigned_at = new Date();
      }
    }

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

// @desc    Claim a ticket for an admin
// @route   PUT /api/admin/tickets/:id/take
// @access  Private (Admin)
const takeTicket = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (ticket.status === 'close') {
      return res.status(400).json({
        success: false,
        message: 'Closed tickets cannot be taken'
      });
    }

    if (ticket.assigned_admin_id && ticket.assigned_admin_id !== req.admin.id) {
      return res.status(409).json({
        success: false,
        message: 'This ticket has already been taken by another admin'
      });
    }

    ticket.assigned_admin_id = req.admin.id;
    ticket.assigned_at = ticket.assigned_at || new Date();
    ticket.status = 'inprogress';

    await ticket.save();

    const updatedTicket = await Ticket.findByPk(ticket.id, {
      include: ticketListInclude
    });

    res.json({
      success: true,
      message: 'Ticket taken successfully',
      data: updatedTicket
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

    const existingAdminMessages = await Message.count({
      where: {
        ticket_id: ticket.id,
        sender_type: 'admin'
      }
    });

    // First involved admin is locked in by first take/reply.
    if (!ticket.assigned_admin_id) {
      ticket.assigned_admin_id = admin_id;
      ticket.assigned_at = ticket.assigned_at || new Date();
    }

    // Any admin reply should move open/taken tickets to in-progress.
    if ((ticket.status === 'open' || ticket.status === 'taken') && existingAdminMessages === 0) {
      ticket.status = 'inprogress';
    }

    if (ticket.changed('assigned_admin_id') || ticket.changed('assigned_at') || ticket.changed('status')) {
      await ticket.save();
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
    const { name, username, password, mobile, department, branch, device_type, device_model, device_specs, device_notes } = req.body;

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
      device_type: device_type || null,
      device_model: device_model || null,
      device_specs: device_specs || null,
      device_notes: device_notes || null,
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
    const { name, username, password, mobile, department, branch, device_type, device_model, device_specs, device_notes } = req.body;

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
    if (device_type !== undefined) user.device_type = device_type;
    if (device_model !== undefined) user.device_model = device_model;
    if (device_specs !== undefined) user.device_specs = device_specs;
    if (device_notes !== undefined) user.device_notes = device_notes;
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
  // Inventory
  getInventorySummary,
  getAssetTypes,
  getInventoryItems,
  getInventoryItemById,
  getInventoryUserHistory,
  getInventoryItemHistory,
  createInventoryItem,
  updateInventoryItem,
  transferInventoryItem,
  // Tickets
  getAllTickets,
  getTicketById,
  updateTicket,
  takeTicket,
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
