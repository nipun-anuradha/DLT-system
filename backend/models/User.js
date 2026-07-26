const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true, // Can be null, will use displayName from MS
  },
  username: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    // This will be the email address (from MS login or manual registration)
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: true, // Null for MS-only users
  },
  mobile: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  device_type: {
    type: DataTypes.ENUM('laptop', 'desktop', 'tablet', 'mobile', 'other'),
    allowNull: true,
  },
  device_model: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  device_specs: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  device_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true,
    // String field instead of foreign key
  },
  branch: {
    type: DataTypes.STRING(100),
    allowNull: true,
    // String field instead of foreign key (city from MS)
  },
  microsoft_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    // Microsoft user ID for linking MS accounts
  },
  auth_provider: {
    type: DataTypes.ENUM('local', 'microsoft'),
    allowNull: false,
    defaultValue: 'local',
    // Track how user was created
  }
}, {
  tableName: 'user',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password') && user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

// Instance method to verify password
User.prototype.verifyPassword = async function(password) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

// Class method to find by username (email)
User.findByUsername = async function(username) {
  return this.findOne({ where: { username } });
};

// Class method to find by Microsoft ID
User.findByMicrosoftId = async function(microsoftId) {
  return this.findOne({ where: { microsoft_id: microsoftId } });
};

module.exports = User;
