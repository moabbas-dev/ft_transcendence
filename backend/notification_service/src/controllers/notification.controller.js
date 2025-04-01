class NotificationController {
	constructor(notificationModel) {
		this.notificationModel = notificationModel;
	}

	async sendUserMessage(senderId, recipientId, content) {
		return this.notificationModel.create({
		  type: 'USER_MESSAGE',
		  senderId,
		  recipientId,
		  content
		});
	}

	async sendTournamentAlert(recipientId) {
		return this.notificationModel.create({
		  type: 'TOURNAMENT_ALERT',
		  recipientId,
		  content: "Your game is about to start! Get ready!"
		});
	}

	async sendFriendRequest(senderId, recipientId, username) {
		return this.notificationModel.create({
		  type: 'FRIEND_REQUEST',
		  senderId,
		  recipientId,
		  content: `${username} sent you a friend request`,
		  additionalData: JSON.stringify({
			actions: ['accept', 'decline']
		  })
		});
	}

	async sendFriendAcceptedNotification(senderId, recipientId, username) {
		return this.notificationModel.create({
		  type: 'FRIEND_ACCEPTED',
		  senderId,
		  recipientId,
		  content: `${username} accepted your friend invitation`
		});
	}

	async sendGameChallenge(senderId, recipientId) {
		return this.notificationModel.create({
		  type: 'GAME_CHALLENGE',
		  senderId,
		  recipientId,
		  content: '',
		  additionalData: JSON.stringify({
			actions: ['join']
		  })
		});
	}

	async getUserNotifications(userId, limit = 20) {
		return this.notificationModel.getNotificationsForUser(userId, limit);
	}

	async markNotificationAsRead(userId) {
		return this.notificationModel.markAllAsRead(userId);
	}

	async getAllNotifications() {
		return await this.notificationModel.getAllNotifications();
	}
}

export default NotificationController