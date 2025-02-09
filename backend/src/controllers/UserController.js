const UserService = require('../services/UserService');

class UserController {

    static async createUser(request, reply) {
        const { email, passwordHash, nickname, googleId } = request.body;
        try {
            const userId = await UserService.createUser({ email, passwordHash, nickname, googleId });
            reply.code(201).send({ userId });
        } catch(err) {
            reply.code(500).send({ message: 'Error creating user', error: err.message });
        }
    }

    static async getAllUsers(request, reply) {
        try {
            const users = await UserService.getAllUsers();
            reply.code(200).send(users);
        } catch(err) {
            reply.code(500).send({ message: 'Error getting users', error: err.message });
        }
    }

    static async getUserByEmail(request, reply) {
        const { email } = request.params;
        try {
            const user = await UserService.getUserByEmail(email);
            if (!user) reply.code(404).send({ message: 'User not found!' });
            else reply.code(200).send(user);
        } catch (err) {
            reply.code(500).send({ message: 'Error getting user by email', error: err.message });
        }
    }

    static async getUserById(request, reply) {
        const { id } = request.params;
        try {
            const user = await UserService.getUserById(id);
            if (!user) reply.code(404).send({ message: 'User not found!' });
            else reply.code(200).send(user);
        } catch (err) {
            reply.code(500).send({ message: 'Error getting user by id', error: err.message });
        }
    }

    static async updateUser(request, reply) {
        const { id } = request.params;
        const { nickname, avatarUrl } = request.body;
        try {
            const changes = await UserService.updateUser(id, { nickname, avatarUrl });
            if (changes == 0) reply.code(404).send({ message: 'User not found!' });
            else reply.code(200).send({ message: 'User updated successfully!' });
        } catch (err) {
            reply.code(500).send({ message: 'Error updating the user', error: err.message });
        }
    }

    static async deleteUser(request, reply) {
        const  { id } = request.params;
        try {
            const changes = await UserService.deleteUser(id);
            if (changes == 0) reply.code(404).send({ message: 'User not found!' });
            else reply.code(200).send({ message: 'User deleted successfully!' });
        } catch (err) {
            reply.code(500).send({ message: 'Error deleting the user', error: err.message });
        }
    }
}

module.exports = UserController;