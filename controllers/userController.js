const { User, Role } = require('../models');

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

  
    const validRoles = ['USER', 'SUPPORT'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either USER or SUPPORT'
      });
    }

   
    const roleRecord = await Role.findOne({ name: role });
    if (!roleRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role_id: roleRecord._id
    });

    const userWithRole = await User.findById(user._id)
      .populate('role_id', 'name')
      .select('-password');

    res.status(201).json({
      success: true,
      data: userWithRole
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .populate('role_id', 'name')
      .select('-password')
      .sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  getAllUsers
};
