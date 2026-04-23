import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Preference = sequelize.define('Preference', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  settingsJson: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'settings_json',
    defaultValue: {
      theme: 'light',
      autoRefresh: true,
      refreshInterval: 60,
      notifications: {
        aqi: true,
        earthquake: true,
      },
    },
  },
}, {
  tableName: 'preferences',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Define associations
User.hasOne(Preference, { foreignKey: 'userId', as: 'preferences' });
Preference.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default Preference;
