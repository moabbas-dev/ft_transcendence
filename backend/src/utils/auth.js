const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { db } = require('../../index');

// Hash a password
const hashPassword = async (password) => {
	return await bcrypt.hash(password, 10);
};

// Verify a password
const verifyPassword = async (password, hash) => {
	return await bcrypt.compare(password, hash);
};

// authenticate a user
const authenticateUser = async (email, password) => {
    const query = `SELECT * FROM Users WHERE email = ?`;

    return new Promise((resolve, reject) => {
        db.get(query, [email], async (err, user) => {
            if (err) {
                reject("Database error");
                return;
            }
            if (!user) {
                reject("User not found");
                return;
            }

            const isValid = await verifyPassword(password, user.password);
            if (!isValid) {
                reject("Invalid password");
                return;
            }

            resolve(user);
        });
    });
};

// generate access and refresh tokens
const generateTokens = async (user) => {
	const accessToken = jwt.sign(
		{userId: user.id, email: user.email, full_name: user.full_name, nickname: user.nickname}
	);

	const refreshToken = jwt.sign(
		{userId: user.id}
	);

	return { accessToken, refreshToken };
}

module.exports = { hashPassword, verifyPassword, generateTokens, authenticateUser };