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

// Define Associations

// Branch - User
Branch.hasMany(User, { foreignKey: 'branch_id', as: 'users' });
User.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });

// Department - User
Department.hasMany(User, { foreignKey: 'department_id', as: 'users' });
User.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

// User - Ticket
User.hasMany(Ticket, { foreignKey: 'user_id', as: 'tickets' });
Ticket.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Ticket - Message
Ticket.hasMany(Message, { foreignKey: 'ticket_id', as: 'messages' });
Message.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });

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
  Log
};
