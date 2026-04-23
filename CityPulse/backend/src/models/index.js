const sequelize = require('../config/database');
const User = require('./User');
const SavedCity = require('./SavedCity');

// Define relationships
User.hasMany(SavedCity, { foreignKey: 'userId', as: 'savedCities', onDelete: 'CASCADE' });
SavedCity.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  SavedCity
};
