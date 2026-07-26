const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const InventoryItem = sequelize.define('InventoryItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  item_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'other',
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  model: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  serial_number: {
    type: DataTypes.STRING(150),
    allowNull: true,
    unique: true,
  },
  asset_tag: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  specs: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('available', 'assigned', 'repair', 'retired'),
    allowNull: false,
    defaultValue: 'available',
  },
  assigned_user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'user',
      key: 'id'
    }
  },
  assigned_department: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  assigned_branch: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  assigned_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'inventory_item',
  timestamps: true,
});

module.exports = InventoryItem;