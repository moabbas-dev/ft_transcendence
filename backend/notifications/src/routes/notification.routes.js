async function NotificationRoutes(fastify, options) {
	const notificationController = fastify.NotificationController
	console.log('NotificationController in route:', notificationController);

	fastify.post('/user-message', async (request, reply) => {
		const {senderId, recipientId, content} = request.body;
		try {
			const notification = await notificationController.sendUserMessage(
				senderId, recipientId, content
			)
			return reply.code(201).send(notification)
		} catch(err) {
			return reply.code(400).send({ error: err.message });
		}
	})

	fastify.post('/tournament-alert', async (request, reply) => {
		const { recipientId, tournamentDetails } = request.body;
		try {
			const notification = await notificationController.sendTournamentAlert(
				recipientId, tournamentDetails
			)
		} catch(err) {
			return reply.code(400).send({ error: err.message });
		}
	})

	fastify.post('/friend-request', async (request, reply) => {
		const { senderId, recipientId, nickname } = request.body;
		try {
		  const notification = await notificationController.sendFriendRequest(
			senderId, recipientId, nickname
		  );
		  return reply.code(201).send(notification);
		} catch (error) {
		  return reply.code(400).send({ error: error.message });
		}
	});

	fastify.post('/friend-accepted', async (request, reply) => {
		const { senderId, recipientId, nickname } = request.body;
		try {
		  const notification = await notificationController.sendFriendAcceptedNotification(
			senderId, recipientId, nickname
		  );
		  return reply.code(201).send(notification);
		} catch (error) {
		  return reply.code(400).send({ error: error.message });
		}
	});

	fastify.post('/game-challenge', async (request, reply) => {
		const { senderId, recipientId } = request.body;
		try {
		  const notification = await notificationController.sendGameChallenge(
			senderId, recipientId
		  );
		  return reply.code(201).send(notification);
		} catch (error) {
		  return reply.code(400).send({ error: error.message });
		}
	});

	fastify.get('/user/:userId', async (request, reply) => {
		const { userId } = request.params;
		const { limit } = request.query;
		try {
		  const notifications = await notificationController.getUserNotifications(
			parseInt(userId), 
			limit ? parseInt(limit) : undefined
		  );
		  return reply.send(notifications);
		} catch (error) {
		  return reply.code(400).send({ error: error.message });
		}
	});

	fastify.patch('/read/all/:userId', async (request, reply) => {
		const { userId } = request.params;
		try {
		  await notificationController.markNotificationAsRead(userId);
		  return reply.code(200).send({ message: 'All Notification marked as read' });
		} catch (error) {
		  return reply.code(400).send({ error: error.message });
		}
	});

	fastify.get('/all', async (request, reply) => {
		try {
		  const notifications = await notificationController.getAllNotifications();
		  return reply.send(notifications);
		} catch (error) {
		  return reply.code(400).send({ error: error.message });
		}
	});
	fastify.post('/email', async (req, reply) => {
		try {
			await notificationController.sendEmailNotification(req, reply)
		} catch (error) {
			return reply.code(400).send({ error: error.message });
		}
	});
}


export default NotificationRoutes;