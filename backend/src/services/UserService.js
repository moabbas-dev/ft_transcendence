const User = require('../models/User');

class UserService {

    static async createUser({email, passwordHash, nickname, googleId}) {
        return await User.create({email, passwordHash, nickname, googleId});
    }

    static async getAllUsers() {
        return await User.getAll();
    }

    static async getUserByEmail(email) {
        return await User.findByEmail(email);
    }

    static async getUserById(id) {
        return await User.findById(id);
    }

    static async updateUser(id, { nickname, avatarUrl }) {
        return await User.update(id, { nickname, avatarUrl });
    }

    static async deleteUser(id) {
        return await User.delete(id);
    }
}

module.exports = UserService;