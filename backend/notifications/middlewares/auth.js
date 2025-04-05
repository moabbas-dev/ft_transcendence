// auth.js (CommonJS)
module.exports = async function auth(request, reply) {
    const apiKey = request.headers['x-api-key'];
    const knownKey = process.env.API_KEY;

    console.log("apiKey: ", apiKey);
    console.log("knownKey: ", knownKey);

    if (!apiKey || apiKey !== knownKey) {
        return reply.code(401).send({ error: "Unauthorized" });
    }
}
