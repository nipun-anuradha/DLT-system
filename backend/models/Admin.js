const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  }
}, {
  tableName: 'admin',
  timestamps: false
});

// Instance method to verify password
Admin.prototype.verifyPassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

// Class method to find by username
Admin.findByUsername = async function(username) {
  return this.findOne({ where: { username } });
};

module.exports = Admin;
