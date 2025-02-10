const  { db } = require('../../index');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const authenticateUser = async (email, password) => {
    const query = `SELECT * FROM Users WHERE email = ?`;

    return new Promise((resolve, reject) => {
        db.get(query, [email], async (err, user) => {
            if (err) {
                reject(new Error("Database error"));
                return;
            }
            if (!user) {
                reject(new Error("User not found"));
                return;
            }

            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                reject(new Error("Invalid password"));
                return;
            }

            resolve(user);
        });
    });
};

const generateTokens = async (user, fastify) => {
	const accessToken = fastify.jwt.sign(
		{userId: user.id, email: user.email, full_name: user.full_name, nickname: user.nickname}
	);

	const refreshToken = fastify.jwt.sign(
		{userId: user.id}
	);

	return { accessToken, refreshToken };
}

class AuthController {
	
	// Login a user
	static async login(request, reply) {
        const { email, password } = request.body;
        try {
            const user = await authenticateUser(email, password);
            const { accessToken, refreshToken } = await generateTokens(user, reply.server);
            return reply.code(201).send({ accessToken: accessToken, refreshToken: refreshToken });
        } catch (err) {
            // Handle specific error messages
            if (err.message === "User not found" || err.message === "Invalid password") {
                return reply.code(404).send({ message: err.message });
            }
            // Default to 500 for any other server-side error
            return reply.code(500).send({ message: 'Error with login from the server!', error: err.message });
        }
    }
}

module.exports = AuthController;