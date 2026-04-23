import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firebaseUid: {
    type: DataTypes.STRING(128),
    allowNull: false,
    unique: true,
    field: 'firebase_uid',
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  displayName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'display_name',
  },
  photoUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'photo_url',
  },
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['firebase_uid'],
    },
    {
      fields: ['email'],
    },
  ],
});

export default User;
