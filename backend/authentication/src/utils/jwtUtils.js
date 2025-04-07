const generateTokens = async (user, fastify) => {

	const tokenId = crypto.randomUUID();
	const accessTokenExpiry = Math.floor(Date.now() / 1000) + (5 * 60); // the access token expires after 5 minutes
	const accessToken = fastify.jwt.sign(
		{
			userId: user.id,
			email: user.email,
			fullName: user.full_name,
			nickname: user.nickname,
			age: user.age,
			country: user.country,
			avatarUrl: user.avatar_url,
			elo: user.elo,
			createdAt: user.created_at,
			jti: tokenId,
			exp: accessTokenExpiry
		}
	);

	const refreshTokenExpiry = Math.floor(Date.now() / 1000) + (30 * 60); // the refresh token expires after 30 minutes
	const refreshToken = fastify.jwt.sign(
		{
			userId: user.id,
			jti: tokenId,
			exp: refreshTokenExpiry
		}
	);

	return { accessToken, refreshToken };
}

const generateNewAccessToken = async (user, fastify) => {
	const accessTokenExpiry = Math.floor(Date.now() / 1000) + (5 * 60); // the access token expires after one hour
	const tokenId = crypto.randomUUID();
	const newAccessToken = fastify.jwt.sign(
		{
			userId: user.id,
			email: user.email,
			fullName: user.full_name,
			nickname: user.nickname,
			age: user.age,
			country: user.country,
			avatarUrl: user.avatar_url,
			elo: user.elo,
			createdAt: user.created_at,
			jti: tokenId,
			exp: accessTokenExpiry
		}
	);
	return newAccessToken;
}

module.exports = { generateTokens, generateNewAccessToken };