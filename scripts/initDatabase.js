const connectDB = require('../config/database');
const { Role, User } = require('../models');
require('dotenv').config();

const initDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Create roles if they don't exist
    const roles = ['MANAGER', 'SUPPORT', 'USER'];
    for (const roleName of roles) {
      const existingRole = await Role.findOne({ name: roleName });
      if (!existingRole) {
        await Role.create({ name: roleName });
        console.log(`Created role: ${roleName}`);
      }
    }

    // Create default manager if it doesn't exist
    const managerRole = await Role.findOne({ name: 'MANAGER' });
    const existingManager = await User.findOne({
      email: 'manager@example.com'
    });

    if (!existingManager && managerRole) {
      const manager = await User.create({
        name: 'Default Manager',
        email: 'manager@example.com',
        password: 'Manager123!',
        role_id: managerRole._id
      });
      console.log('Default manager created:');
      console.log('Email: manager@example.com');
      console.log('Password: Manager123!');
    }

    console.log('\nDatabase initialization completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initDatabase();
