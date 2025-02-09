const UserController = require('../controllers/UserController');

module.exports = async (fastify) => {
    fastify.post('/users', UserController.createUser);
    fastify.get('/users', UserController.getAllUsers);
    fastify.get('/users/id/:id', UserController.getUserById);
    fastify.get('/users/email/:email', UserController.getUserByEmail)
    fastify.put('/users/:id', UserController.updateUser);
    fastify.delete('/users/:id', UserController.deleteUser);
};