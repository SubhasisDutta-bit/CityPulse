const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SavedCity = sequelize.define('SavedCity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // 'Users' is the table name Sequelize generates for User model
      key: 'id'
    }
  },
  cityName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  timestamps: true,
});

module.exports = SavedCity;
