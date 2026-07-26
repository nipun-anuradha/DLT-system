const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  category: {
    type: DataTypes.ENUM('hardware', 'software', 'network', 'item', 'other', 'system', 'internet', 'request'),
    allowNull: true,
  },
  issue_category: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  issue_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  issue_detail: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('open', 'taken', 'inprogress', 'close'),
    allowNull: true,
    defaultValue: 'open',
  },
  assigned_admin_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'admin',
      key: 'id'
    }
  },
  resolved_by_admin_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'admin',
      key: 'id'
    }
  },
  assigned_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'user',
      key: 'id'
    }
  }
}, {
  tableName: 'ticket',
  timestamps: true,
});

module.exports = Ticket;
