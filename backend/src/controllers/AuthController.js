const User = require('../models/User');
const { hashPassword, verifyPassword } = require('../utils/auth');

class AuthController {
  // Signup a new user
  static async signup(request, reply) {
    const { email, password, nickname } = request.body;
    try {
      const userId = await User.create({ email, password, nickname });
      reply.send({ userId });
    } catch (err) {
      reply.code(400).send({ message: 'Error creating user', error: err.message });
    }
  }

  // Login a user
  static async login(request, reply) {
    const { email, password } = request.body;
    try {
      const user = await User.findByEmail(email);
      if (!user || !(await verifyPassword(password, user.password_hash))) {
        reply.code(401).send({ message: 'Invalid credentials' });
        return;
      }
      reply.send({ userId: user.id });
    } catch (err) {
      reply.code(500).send({ message: 'Error during login', error: err.message });
    }
  }
}

module.exports = AuthController;