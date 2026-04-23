import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  action: {
    type: DataTypes.ENUM('search', 'save', 'delete', 'view'),
    allowNull: false,
  },
  cityName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'city_name',
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'activity_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      fields: ['user_id', 'action'],
    },
    {
      fields: ['created_at'],
    },
  ],
});

// Define associations
User.hasMany(ActivityLog, { foreignKey: 'userId', as: 'activityLogs' });
ActivityLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default ActivityLog;
