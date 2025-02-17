const UserController = require('../controllers/UserController');

module.exports = async (fastify) => {
	fastify.post('/users', UserController.createUser);
	fastify.get('/users', UserController.getAllUsers);
	fastify.get('/users/id/:id', UserController.getUserById);
	fastify.get('/users/email/:email', UserController.getUserByEmail)
	fastify.get('/users/nickname/:nickname', UserController.getUserByNickname);
	fastify.put('/users/2fa/:id', UserController.enable2faUser);
	fastify.put('/users/:id', UserController.updateUser);
	fastify.delete('/users/:id', UserController.deleteUser);
};