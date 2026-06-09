const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const loginUser = async (req, res) => {
  const { email, password, institution_id } = req.body;

  try {
    let user = null;
    let isSuperAdmin = false;

    // 1. Check users table
    const [userResult] = await sequelize.query(
      "SELECT * FROM users WHERE email = :email AND LOWER(status) = 'active'",
      {
        replacements: { email },
      }
    );

    user = userResult[0];

    // 2. If user not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // 3. Determine if Super Admin
    isSuperAdmin = user.role_id === 1;

    // 4. Password check
    // The database uses plaintext password in 'user_password' or hashed in 'password_hash'
    const storedPassword = user.password_hash || user.user_password;
    let isMatch = false;
    
    // Check if it's bcrypt hash or plaintext
    if (storedPassword && storedPassword.startsWith('$2a$')) {
      isMatch = await bcrypt.compare(password, storedPassword);
    } else {
      isMatch = (password === storedPassword);
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // 5. Institution check
    if (
      !isSuperAdmin &&
      institution_id &&
      user.institution_id !== institution_id
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this branch.',
      });
    }

    // 6. JWT token
    const userId = user.id || user.user_id;
    const token = jwt.sign(
      {
        id: userId,
        email: user.email,
        role_id: user.role_id || null,
        institution_id: user.institution_id || institution_id || null,
        isSuperAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // 7. Response
    res.json({
      success: true,
      token,
      user: {
        id: userId,
        name: user.name || user.user_name || user.username,
        email: user.email,
        institution_id: user.institution_id,
        role_id: user.role_id,
        isSuperAdmin,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { loginUser };