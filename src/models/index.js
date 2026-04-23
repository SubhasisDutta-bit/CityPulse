import User from './User.js';
import SavedCity from './SavedCity.js';
import Preference from './Preference.js';
import ActivityLog from './ActivityLog.js';

// Export all models
export {
  User,
  SavedCity,
  Preference,
  ActivityLog,
};

// Export a function to sync all models
export const syncModels = async (force = false) => {
  try {
    await User.sync({ force });
    await SavedCity.sync({ force });
    await Preference.sync({ force });
    await ActivityLog.sync({ force });
    console.log('✅ Database models synchronized');
  } catch (error) {
    console.error('❌ Error synchronizing models:', error);
    throw error;
  }
};
