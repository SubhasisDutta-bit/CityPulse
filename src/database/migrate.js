import sequelize from '../config/database.js';
import { syncModels } from '../models/index.js';

/**
 * Database migration script
 * Run with: npm run db:migrate
 */
const migrate = async () => {
  try {
    console.log('🔄 Starting database migration...');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Create tables
    await syncModels(false);
    console.log('✅ Database tables created/updated');

    console.log('🎉 Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrate();
