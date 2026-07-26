const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const InventoryTransfer = sequelize.define('InventoryTransfer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  inventory_item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'inventory_item',
      key: 'id'
    }
  },
  from_user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'user',
      key: 'id'
    }
  },
  to_user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'user',
      key: 'id'
    }
  },
  from_department: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  to_department: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  from_branch: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  to_branch: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  transferred_by_admin_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'admin',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  transferred_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'inventory_transfer',
  timestamps: true,
});

module.exports = InventoryTransfer;