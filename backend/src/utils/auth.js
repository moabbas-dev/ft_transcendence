const bcrypt = require('bcrypt');
const saltRounds = 10;

// Hash a password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

// Verify a password
const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = { hashPassword, verifyPassword };