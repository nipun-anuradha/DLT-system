const { sequelize } = require('../config/db');

// Import models
const User = require('./User');
const Admin = require('./Admin');
const Branch = require('./Branch');
const Department = require('./Department');
const Ticket = require('./Ticket');
const Message = require('./Message');
const Notice = require('./Notice');
const Log = require('./Log');
const InventoryItem = require('./InventoryItem');
const InventoryTransfer = require('./InventoryTransfer');
const AssetType = require('./AssetType');
const IssueCategory = require('./IssueCategory');
const IssueSubCategory = require('./IssueSubCategory');
const IssueDetail = require('./IssueDetail');

// Define Associations

// Note: Branch and Department are no longer linked to User
// User now has department and branch as string fields

// User - Ticket
User.hasMany(Ticket, { foreignKey: 'user_id', as: 'tickets' });
Ticket.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Ticket.belongsTo(Admin, { foreignKey: 'assigned_admin_id', as: 'assignedAdmin' });
Ticket.belongsTo(Admin, { foreignKey: 'resolved_by_admin_id', as: 'resolvedByAdmin' });

// User - Inventory
User.hasMany(InventoryItem, { foreignKey: 'assigned_user_id', as: 'assignedItems' });
InventoryItem.belongsTo(User, { foreignKey: 'assigned_user_id', as: 'assignedUser' });

// Inventory - Transfers
InventoryItem.hasMany(InventoryTransfer, { foreignKey: 'inventory_item_id', as: 'transfers' });
InventoryTransfer.belongsTo(InventoryItem, { foreignKey: 'inventory_item_id', as: 'item' });
InventoryTransfer.belongsTo(User, { foreignKey: 'from_user_id', as: 'fromUser' });
InventoryTransfer.belongsTo(User, { foreignKey: 'to_user_id', as: 'toUser' });
InventoryTransfer.belongsTo(Admin, { foreignKey: 'transferred_by_admin_id', as: 'transferredByAdmin' });

// Ticket - Message
Ticket.hasMany(Message, { foreignKey: 'ticket_id', as: 'messages' });
Message.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });

// Issue hierarchy
IssueCategory.hasMany(IssueSubCategory, { foreignKey: 'category_id', as: 'subCategories' });
IssueSubCategory.belongsTo(IssueCategory, { foreignKey: 'category_id', as: 'category' });
IssueSubCategory.hasMany(IssueDetail, { foreignKey: 'sub_category_id', as: 'details' });
IssueDetail.belongsTo(IssueSubCategory, { foreignKey: 'sub_category_id', as: 'subCategory' });

// User - Message (for message sender when sender_type is 'user')
User.hasMany(Message, { foreignKey: 'sender_id', constraints: false, as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', constraints: false, as: 'userSender' });

// Admin - Message (for message sender when sender_type is 'admin')
Admin.hasMany(Message, { foreignKey: 'sender_id', constraints: false, as: 'sentMessages' });
Message.belongsTo(Admin, { foreignKey: 'sender_id', constraints: false, as: 'adminSender' });

// User - Log
User.hasMany(Log, { foreignKey: 'user_id', as: 'logs' });
Log.belongsTo(Log, { foreignKey: 'user_id', as: 'user' });

// Admin - Log
Admin.hasMany(Log, { foreignKey: 'Admin_id', as: 'logs' });
Log.belongsTo(Admin, { foreignKey: 'Admin_id', as: 'admin' });

// Admin - Notice
Admin.hasMany(Notice, { foreignKey: 'admin_id', as: 'notices' });
Notice.belongsTo(Admin, { foreignKey: 'admin_id', as: 'author' });

module.exports = {
  sequelize,
  User,
  Admin,
  Branch,
  Department,
  Ticket,
  Message,
  Notice,
  Log,
  InventoryItem,
  InventoryTransfer,
  AssetType,
  IssueCategory,
  IssueSubCategory,
  IssueDetail
};
