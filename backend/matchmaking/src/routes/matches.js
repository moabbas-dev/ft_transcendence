import Fastify from 'fastify';
import websocket from '@fastify/websocket';

const app = Fastify({ logger: true });
app.register(websocket);

// create a /match route that handles websocket connections
app.get('/match', { websocket: true }, (connection, req) => {
	const { socket } = connection;

	socket.send(JSON.stringify({ type: 'welcome', msg: 'Matchmaking ready!' }));

	socket.on('message', msg => {
		console.log('Client said:', msg);
		// ... handle incoming data
	});

	// Clean up on client disconnect
	socket.on('close', () => {
		console.log('Client disconnected');
	});

	socket.on('message', raw => {
		const { action, roomId, payload } = JSON.parse(raw);

		if (action === 'join') {
			if (!rooms.has(roomId)) rooms.set(roomId, new Set());
			rooms.get(roomId).add(socket);
			broadcast(roomId, { type: 'user-joined' }, socket);
		}

		if (action === 'leave') {
			rooms.get(roomId)?.delete(socket);
			broadcast(roomId, { type: 'user-left' }, socket);
		}
	});
});

await app.listen({ port: 3001 });
