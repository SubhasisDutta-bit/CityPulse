import sequelize from '../config/database.js';
import { User, SavedCity, Preference, ActivityLog } from '../models/index.js';

/**
 * Seed database with sample data for testing
 * Run with: npm run db:seed
 */
const seed = async () => {
  try {
    console.log('🌱 Seeding database...');

    // Create sample users
    const users = await User.bulkCreate([
      {
        firebaseUid: 'sample-user-1',
        email: 'demo@citypulse.com',
        displayName: 'Demo User',
        photoUrl: 'https://ui-avatars.com/api/?name=Demo+User',
      },
      {
        firebaseUid: 'sample-user-2',
        email: 'test@citypulse.com',
        displayName: 'Test User',
        photoUrl: 'https://ui-avatars.com/api/?name=Test+User',
      },
    ], { ignoreDuplicates: true });

    console.log('✅ Created sample users');

    // Create saved cities
    await SavedCity.bulkCreate([
      {
        userId: users[0].id,
        cityName: 'London',
        countryCode: 'GB',
        latitude: 51.5074,
        longitude: -0.1278,
      },
      {
        userId: users[0].id,
        cityName: 'New York',
        countryCode: 'US',
        latitude: 40.7128,
        longitude: -74.0060,
      },
      {
        userId: users[0].id,
        cityName: 'Tokyo',
        countryCode: 'JP',
        latitude: 35.6762,
        longitude: 139.6503,
      },
      {
        userId: users[1].id,
        cityName: 'Paris',
        countryCode: 'FR',
        latitude: 48.8566,
        longitude: 2.3522,
      },
    ], { ignoreDuplicates: true });

    console.log('✅ Created saved cities');

    // Create preferences
    await Preference.bulkCreate([
      {
        userId: users[0].id,
        settingsJson: {
          theme: 'dark',
          autoRefresh: true,
          refreshInterval: 60,
          notifications: {
            aqi: true,
            earthquake: true,
          },
        },
      },
      {
        userId: users[1].id,
        settingsJson: {
          theme: 'light',
          autoRefresh: true,
          refreshInterval: 120,
          notifications: {
            aqi: false,
            earthquake: true,
          },
        },
      },
    ], { ignoreDuplicates: true });

    console.log('✅ Created user preferences');

    // Create activity logs
    await ActivityLog.bulkCreate([
      {
        userId: users[0].id,
        action: 'search',
        cityName: 'London',
        metadata: { source: 'search_bar' },
      },
      {
        userId: users[0].id,
        action: 'view',
        cityName: 'London',
        metadata: { duration: 120 },
      },
      {
        userId: users[0].id,
        action: 'save',
        cityName: 'London',
      },
      {
        userId: users[1].id,
        action: 'search',
        cityName: 'Paris',
        metadata: { source: 'search_bar' },
      },
    ], { ignoreDuplicates: true });

    console.log('✅ Created activity logs');

    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
