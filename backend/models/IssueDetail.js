const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const IssueDetail = sequelize.define('IssueDetail', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  sub_category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'issue_sub_category',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  }
}, {
  tableName: 'issue_detail',
  timestamps: true,
});

module.exports = IssueDetail;
