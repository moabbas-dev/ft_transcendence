export default async function auth(request, reply) {
    const apiKey = request.headers['x-api-key'];
    const knownKey = process.env.API_KEY;

    if (!apiKey || apiKey !== knownKey)
            return reply.code(401).send({error: "Unothorized"});
}