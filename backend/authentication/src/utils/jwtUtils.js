const generateTokens = async (user, fastify) => {

	const accessTokenExpiry = Math.floor(Date.now() / 1000) + (60 * 60); // the access token expires after one hour
	const accessToken = fastify.jwt.sign(
		{
			userId: user.id,
			email: user.email,
			fullName: user.full_name,
			nickname: user.nickname,
			avatarUrl: user.avatar_url,
			elo: user.elo,
			exp: accessTokenExpiry
		}
	);

	const refreshTokenExpiry = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // the refresh token expires after one hour
	const refreshToken = fastify.jwt.sign(
		{
			userId: user.id,
			exp: refreshTokenExpiry
		}
	);

	return { accessToken, refreshToken };
}

const generateNewAccessToken = async (user, fastify) => {
	const accessTokenExpiry = Math.floor(Date.now() / 1000) + (60 * 60); // the access token expires after one hour
	const newAccessToken = fastify.jwt.sign(
		{
			userId: user.id,
			email: user.email,
			full_name: user.full_name,
			nickname: user.nickname,
			avatarUrl: user.avatar_url,
			elo: user.elo,
			exp: accessTokenExpiry
		}
	);
	return newAccessToken;
}

module.exports = { generateTokens, generateNewAccessToken };