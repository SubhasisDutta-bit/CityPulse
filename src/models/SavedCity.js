import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const SavedCity = sequelize.define('SavedCity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  cityName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'city_name',
  },
  countryCode: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: 'country_code',
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
}, {
  tableName: 'saved_cities',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      fields: ['user_id'],
    },
    {
      unique: true,
      fields: ['user_id', 'city_name'],
      name: 'unique_user_city',
    },
  ],
});

// Define associations
User.hasMany(SavedCity, { foreignKey: 'userId', as: 'savedCities' });
SavedCity.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default SavedCity;
