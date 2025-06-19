import { blockUser, getBlockedUsers, unblockUser } from "../services/blockService.js";
import { getUser, createOrUpdateUser, getUserByUsername, getUsersFromAuth } from "../services/userService.js";
import { createFriendRequest, cancelFriendRequest, addFriend, getPendingFriendRequests, removeFriend, getFriendshipStatus } from "../services/friendService.js"
import { saveMessage, getMessages, getUnreadMessageCount, markMessagesAsRead, getMessageRequests, createChatRoom } from "../services/chatService.js";
import { expireOldGameInvites, updateGameInviteStatus, getGameInviteById } from "../services/gameInvitationService.js";
import { getDatabase } from "../db/initDB.js";
import axios from 'axios';

/**
 * 📡 WebSocket Event List - Available Events Handled by This Controller
 * 
 * ─── USER EVENTS ─────────────────────────────
 * - "user:connect"            → Connects a user and registers them as online
 * - "user:disconnect"         → Handles user disconnection
 * 
 * ─── FRIEND REQUEST EVENTS ───────────────────
 * - "friend:request"          → Sends a friend request
 * - "friend:decline"          → Declines a friend request
 * - "friend:cancel_request"   → Cancels a sent friend request
 * - "friend:accept"           → Accepts a friend request
 * - "friend:remove"           → Removes a friend from the friend list
 * - "friends:get"             → Retrieves the friend list with online status
 * - "friends:get_pending"     → Retrieves pending friend requests
 * - "friendship:check"        → Checks friendship status between users
 * 
 * ─── MESSAGING EVENTS ────────────────────────
 * - "message:private"         → Sends a private message
 * - "messages:unread:get"     → Gets count of unread messages
 * - "messages:mark_read"      → Marks all messages in a room as read
 * - "messages:history"        → Fetches message history of a room
 * - "message:requests:get"    → Fetches message requests from non-friends
 * 
 * ─── GAME INVITATION EVENTS ──────────────────
 * - "game:invite"             → Sends a game invite to a friend
 * - "game:invite_response"    → Responds to a game invite (accept/decline)
 * 
 * ─── BLOCKING EVENTS ─────────────────────────
 * - "user:block"              → Blocks a user and cancels any friend requests
 * - "user:unblock"            → Unblocks a previously blocked user
 * - "users:blocked_list"      → Retrieves the list of blocked users
 * - "user:check_blocked"      → Checks if a user is blocked
 */

/**
 * Sends a notification to the external notification service.
 * @param {string} type - The type of notification (e.g., "friend-request").
 * @param {object} data - The payload to be sent with the notification.
 * @returns {Promise<object|undefined>} - The response from the notification service or undefined on failure.
 */
async function sendNotification(type, data) {
  const NOTIFICATION_SERVICE_URL = 'http://notifications:3003/api/notifications';

  try {
    const response = await axios.post(`${NOTIFICATION_SERVICE_URL}/${type}`, data, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Failed to send ${type} notification:`, error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    } else {
      console.error(`Unexpected error sending ${type} notification:`, error);
    }
  }
}

/**
 * Sends matchmaking event data to the internal matchmaking service.
 * @param {string} event - The type of matchmaking event.
 * @param {object} data - The event payload.
 * @returns {Promise<object>} - Response from the matchmaking service.
 */
async function sendToMatchmakingService(event, data) {
  try {
    const response = await axios.post('http://matchmaking:3001/internal/friend-match', {
      event,
      data
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Service': 'chat'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error communicating with matchmaking service:', error);
    throw error;
  }
}

/**
 * Sets up WebSocket event listeners for user actions like connecting,
 * messaging, friend requests, game invitations, and more.
 * @param {object} wsAdapter - WebSocket adapter with event handling and messaging capabilities.
 * @param {object} fastify - Fastify server instance for logging and context.
 */
export function setupWebSocketHandlers(wsAdapter, fastify) {
  const onlineUsers = new Map();

  const gameInviteTimers = new Map();

  setInterval(async () => {
    try {
      await expireOldGameInvites();
    } catch (error) {
      console.error("Error in periodic invite cleanup:", error);
    }
  }, 60000);

  /**
   * Handles a new user connection by storing their online status and syncing user data.
  */
  wsAdapter.on("user:connect", async ({ clientId, payload }) => {
    const { username, userId } = payload;
    if (!username || !userId) {
      wsAdapter.sendTo(clientId, "error", { message: "Username and User ID are required" });
      return;
    }
    console.log("new user has connected: ", username, " | with ID:", userId);
    wsAdapter.sendTo(clientId, "msg", { message: "User connected" });

    try {
      await createOrUpdateUser({ id: userId, username });
      const user = await getUser(userId);
      if (!user) {
        wsAdapter.sendTo(clientId, "error", { message: "User not found" });
        return;
      }
      onlineUsers.set(userId.toString(), clientId);
    } catch (error) {
      fastify.log.error("Error in user:connect handler", error);
      wsAdapter.sendTo(clientId, "error", {
        message: "An error occurred while connecting",
      });
    }
  });

  /**
   * Handles user disconnection by cleaning up online status and invite timers.
  */
  wsAdapter.on("user:disconnect", async ({ clientId }) => {
    fastify.log.info(`Disconnected: ${clientId}`);

    let disconnectedUserId = null;
    for (const [userId, cId] of onlineUsers.entries()) {
      if (cId === clientId) {
        disconnectedUserId = userId;
        break;
      }
    }

    if (disconnectedUserId) {
      console.log(`User ${disconnectedUserId} disconnected`);
      onlineUsers.delete(disconnectedUserId);
      gameInviteTimers.delete(disconnectedUserId);
    }
  });

  /**
   * Handles sending a friend request between users.
  */
  wsAdapter.on("friend:request", async ({ clientId, payload }) => {
    const { from, to } = payload;
    console.log("friend request from:", from, "to:", to);

    try {
      await createFriendRequest(from, to);
      const senderUser = await getUser(from);
      const recipientUser = await getUser(to);

      if (senderUser && recipientUser) {
        await sendNotification('friend-request', {
          senderId: parseInt(from),
          recipientId: parseInt(recipientUser.id),
          nickname: senderUser.nickname,
        });

        const recipientClientId = onlineUsers.get(recipientUser.id.toString());
        if (recipientClientId) {
          wsAdapter.sendTo(recipientClientId, "notification:new", {
            type: 'FRIEND_REQUEST',
            senderId: from,
            recipientId: to,
            senderName: senderUser.nickname,
            content: `${senderUser.nickname} sent you a friend request`,
          });
        }
      }
    } catch (error) {
      fastify.log.error("Error in friend:request handler", error);
      wsAdapter.sendTo(clientId, "error", {
        message: `Failed to send friend request, ${error.message}`,
      });
    }
  });

  /**
   * Handles the decline of a friend request.
  */
  wsAdapter.on("friend:decline", async ({ clientId, payload }) => {
    try {
      const { from, to } = payload;
      console.log("friend request declined from:", from, "to:", to);

      await cancelFriendRequest(from, to);
      wsAdapter.sendTo(clientId, "friend:declined", { success: true, userId: from });

      const fromUser = await getUser(from);
      const toUser = await getUser(to);

      await sendNotification('friend-declined', {
        senderId: parseInt(toUser.id),
        recipientId: parseInt(fromUser.id),
        nickname: toUser.nickname
      });

      const recipientClientId = onlineUsers.get(fromUser.id.toString());
      if (recipientClientId) {
        wsAdapter.sendTo(recipientClientId, "notification:new", {
          type: 'FRIEND_DECLINED',
          senderId: toUser.id,
          recipientId: fromUser.id,
          senderName: toUser.nickname,
          content: `${toUser.nickname} declined your friend request`
        });
      }
    } catch (error) {
      console.error("Error in friend:decline handler:", error);
      wsAdapter.sendTo(clientId, "error", {
        message: `Failed to decline friend request, ${error.message}`,
      });
    }
  });

  /**
   * Cancels a previously sent friend request.
  */
  wsAdapter.on("friend:cancel_request", async ({ clientId, payload }) => {
    try {
      const { from, to } = payload;
      await cancelFriendRequest(from, to);
      wsAdapter.sendTo(clientId, "friend:request_cancelled", { success: true, targetId: to });

      const recipientClientId = onlineUsers.get(to.toString());
      if (recipientClientId) {
        wsAdapter.sendTo(recipientClientId, "friend:request_cancelled", { fromId: from });
      }
    } catch (error) {
      console.error("Error in friend:cancel_request handler:", error);
      wsAdapter.sendTo(clientId, "error", {
        message: "Failed to cancel friend request",
        details: error.message
      });
    }
  });

  /**
   * Accepts a friend request and establishes friendship.
  */
  wsAdapter.on("friend:accept", async ({ clientId, payload }) => {
    const { from, to } = payload;
    console.log("friend request acceptance from:", from, "to:", to);

    try {
      await addFriend(from, to);
      const fromUser = await getUser(from);
      const toUser = await getUser(to);

      if (!fromUser || !toUser) {
        wsAdapter.sendTo(clientId, "error", { message: "Failed to retrieve user data" });
        return;
      }

      await sendNotification('friend-accepted', {
        senderId: parseInt(fromUser.id),
        recipientId: parseInt(toUser.id),
        nickname: toUser.nickname
      });

      const recipientClientId = onlineUsers.get(toUser.id.toString());
      if (recipientClientId) {
        wsAdapter.sendTo(recipientClientId, "notification:new", {
          type: 'FRIEND_ACCEPTED',
          senderId: fromUser.id,
          recipientId: toUser.id,
          senderName: fromUser.nickname,
          content: `${fromUser.nickname} accepted your friend request`
        });
      }
    } catch (error) {
      fastify.log.error("Error in friend:accept handler", error);
      wsAdapter.sendTo(clientId, "error", {
        message: `Failed to accept friend request, ${error.message}`,
      });
    }
  });

  /**
   * Removes a friend from the user's friend list.
  */
  wsAdapter.on("friend:remove", async ({ clientId, payload }) => {
    try {
      const { userId, friendId } = payload;
      console.log(`Removing friend: User ${userId} removing friend ${friendId}`);

      await removeFriend(userId, friendId);
      wsAdapter.sendTo(clientId, "friend:removed", { success: true, friendId });
    } catch (error) {
      console.error("Error in friend:remove handler:", error);
      wsAdapter.sendTo(clientId, "error", {
        message: "Failed to remove friend",
        details: error.message
      });
    }
  });

  /**
   * Sends a private message between users, with checks for blocking and room creation.
  */
  wsAdapter.on("message:private", async ({ clientId, payload }) => {
    try {
      const { from, to, content, timestamp } = payload;
      console.log("private message:", payload);

      const fromUser = await getUser(from);
      const toUser = await getUser(to);

      if (!fromUser || !toUser) {
        wsAdapter.sendTo(clientId, "error", { message: `Error retrieving user's data` });
        return;
      }

      const blockedUsers = await getBlockedUsers(from);
      const isBlocked = blockedUsers.some(user => user.id === parseInt(to));
      const recipientBlockedUsers = await getBlockedUsers(to);
      const isBlockedByRecipient = recipientBlockedUsers.some(user => user.id === parseInt(from));

      if (isBlocked || isBlockedByRecipient) {
        console.log(`Message blocked: User ${from} and ${to} have a block relationship`);
        wsAdapter.sendTo(clientId, "message:blocked", {
          to,
          timestamp,
          reason: isBlocked ? "You have blocked this user" : "You have been blocked by this user"
        });
        return;
      }

      const roomId = [from, to].sort().join("-");
      await createChatRoom(roomId, [from, to]);

      const newMessage = {
        id: Date.now().toString(),
        senderId: from,
        receiverId: to,
        content,
        timestamp,
        read_status: 0
      };

      await saveMessage(newMessage, roomId);

      let recipientClientId = onlineUsers.get(to.toString());
      if (recipientClientId) {
        wsAdapter.sendTo(recipientClientId, "message:received", { roomId, message: newMessage });
        wsAdapter.sendTo(recipientClientId, "notification:new", {
          type: "USER_MESSAGE",
          senderId: from,
          recipientId: to,
          senderName: fromUser.nickname,
          content: `${fromUser.nickname}: ${newMessage.content}`
        })
      }

      wsAdapter.sendTo(clientId, "message:sent", { roomId, message: newMessage });
    } catch (error) {
      fastify.log.error("Error in message:private handler", error);
      wsAdapter.sendTo(clientId, "error", { message: "Failed to send message" });
    }
  });

  /**
   * Fetches unread message counts for a given user.
  */
  wsAdapter.on("messages:unread:get", async ({ clientId, payload }) => {
    try {
      const { userId } = payload;
      const unreadCounts = await getUnreadMessageCount(userId);
      wsAdapter.sendTo(clientId, "messages:unread", { unreadCounts });
    } catch (error) {
      console.error("Error getting unread message counts:", error);
      wsAdapter.sendTo(clientId, "error", {
        message: "Failed to get unread message counts",
        details: error.message
      });
    }
  });

  /**
   * Marks all messages in a chat room as read by a user.
  */
  wsAdapter.on("messages:mark_read", async ({ clientId, payload }) => {
    try {
      const { roomId, userId } = payload;
      if (!roomId || !userId) {
        throw new Error('Missing roomId or userId');
      }

      await markMessagesAsRead(roomId, userId);
      wsAdapter.sendTo(clientId, "messages:marked_read", { roomId, success: true });

      const unreadCounts = await getUnreadMessageCount(userId);
      wsAdapter.sendTo(clientId, "messages:unread", { unreadCounts });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      wsAdapter.sendTo(clientId, "error", {
        message: "Failed to mark messages as read",
        details: error.message
      });
    }
  });

  /**
   * Retrieves chat history for a given room.
  */
  wsAdapter.on("messages:history", async ({ clientId, payload }) => {
    try {
      const { roomId } = payload;
      if (!roomId || typeof roomId !== 'string') {
        throw new Error('Invalid room ID');
      }

      const messages = await getMessages(roomId, 1000);
      wsAdapter.sendTo(clientId, "messages:history", { roomId, messages });
    } catch (error) {
      fastify.log.error("Message history error:", error);
      wsAdapter.sendTo(clientId, "error", {
        message: "Failed to retrieve message history",
        details: error.message
      });
    }
  });

  /**
   * Retrieves message requests (messages from non-friends).
  */
  wsAdapter.on("message:requests:get", async ({ clientId, payload }) => {
    try {
      const { userId } = payload;
      if (!userId) {
        throw new Error('Missing userId');
      }

      const messageRequests = await getMessageRequests(userId);
      wsAdapter.sendTo(clientId, "message:requests", { requests: messageRequests });
    } catch (error) {
      console.error("Error fetching message requests:", error);
      wsAdapter.sendTo(clientId, "error", {
        message: "Failed to fetch message requests",
        details: error.message
      });
    }
  });

  /**
   * Sends a game invitation to a friend, with optional expiration timer.
  */
  wsAdapter.on("game:invite", async ({ clientId, payload }) => {
    try {
      const { from, to, gameType = "friendly" } = payload;

      const friendship = await getFriendshipStatus(from, to);
      if (friendship.status !== 'friends') {
        wsAdapter.sendTo(clientId, "error", {
          message: "You can only invite friends to games"
        });
        return;
      }

      const blockedUsers = await getBlockedUsers(to);
      const isBlocked = blockedUsers.some(user => user.id === parseInt(from));

      if (isBlocked) {
        wsAdapter.sendTo(clientId, "error", {
          message: "Cannot send game invite to this user"
        });
        return;
      }

      const inviteId = Date.now().toString();
      const currentTime = Date.now();
      const expirationTime = currentTime + (5 * 60 * 1000); // 5 minutes

      const gameInviteMessage = {
        id: inviteId,
        senderId: from,
        receiverId: to,
        content: `🎮 Game Invite: ${gameType} Match`,
        timestamp: currentTime,
        messageType: 'game_invite',
        gameInviteData: {
          inviteId,
          gameType,
          status: 'pending',
          expiresAt: expirationTime
        },
        read_status: 0
      };

      const roomId = [from, to].sort().join("-");
      await createChatRoom(roomId, [from, to]);
      await saveMessage(gameInviteMessage, roomId);

      const timer = setTimeout(async () => {
        try {
          await updateGameInviteStatus(inviteId, 'expired');
          console.log(`Game invite ${inviteId} expired`);
          gameInviteTimers.delete(inviteId);
        } catch (error) {
          console.error(`Error expiring game invite ${inviteId}:`, error);
        }
      }, 5 * 60 * 1000);

      gameInviteTimers.set(inviteId, timer);

      const fromUser = await getUser(from);
      await sendNotification('user-message', {
        senderId: from,
        recipientId: to,
        content: `${fromUser.nickname} invited you to a 1v1 friendly match`
      });

      const recipientClientId = onlineUsers.get(to.toString());
      if (recipientClientId) {
        wsAdapter.sendTo(recipientClientId, "message:private", {
          ...gameInviteMessage,
          roomId
        });

        wsAdapter.sendTo(recipientClientId, "notification:new", {
          type: "USER_MESSAGE",
          senderId: from,
          recipientId: to,
          senderName: fromUser.nickname,
          content: `${fromUser.nickname} invited you to a 1v1 friendly match`
        });
      }

      wsAdapter.sendTo(clientId, "game:invite_sent", { inviteId, to, gameType });
    } catch (error) {
      console.error("Error sending game invite:", error);
      wsAdapter.sendTo(clientId, "error", { message: "Failed to send game invite" });
    }
  });

  /**
   * Handles a game invitation response (accept/decline) and triggers game navigation if accepted.
  */
  wsAdapter.on("game:invite_response", async ({ clientId, payload }) => {
    try {
      const { inviteId, response, from, to } = payload;

      const existingInvite = await getGameInviteById(inviteId);
      if (!existingInvite) {
        wsAdapter.sendTo(clientId, "error", { message: "Game invite not found" });
        return;
      }

      const inviteData = existingInvite.gameInviteData;
      if (inviteData.status !== 'pending') {
        wsAdapter.sendTo(clientId, "error", {
          message: `Game invite has already been ${inviteData.status}`
        });
        return;
      }

      if (Date.now() > inviteData.expiresAt) {
        await updateGameInviteStatus(inviteId, 'expired');
        wsAdapter.sendTo(clientId, "error", { message: "Game invite has expired" });
        return;
      }

      // Clear expiration timer
      if (gameInviteTimers.has(inviteId)) {
        clearTimeout(gameInviteTimers.get(inviteId));
        gameInviteTimers.delete(inviteId);
      }

      const newStatus = response === 'accept' ? 'accepted' : 'declined';
      await updateGameInviteStatus(inviteId, newStatus);

      const roomId = [from, to].sort().join("-");
      const responseMessage = {
        id: Date.now().toString(),
        senderId: to,
        receiverId: from,
        content: response === 'accept' ?
          '✅ Game invite accepted! Starting match...' :
          '❌ Game invite declined',
        timestamp: Date.now(),
        messageType: 'game_invite_response',
        gameInviteData: {
          originalInviteId: inviteId,
          response,
          status: 'completed'
        },
        read_status: 0
      };

      await saveMessage(responseMessage, roomId);

      const senderClientId = onlineUsers.get(from.toString());
      if (senderClientId) {
        wsAdapter.sendTo(senderClientId, "message:private", { ...responseMessage, roomId });
        wsAdapter.sendTo(senderClientId, "game:invite_response", { inviteId, response, from: to });
      }

      wsAdapter.sendTo(clientId, "game:response_sent", { inviteId, response, status: newStatus });

      if (response === 'accept') {
        const senderClient = onlineUsers.get(from.toString());
        const accepterClient = onlineUsers.get(to.toString());

        if (senderClient) {
          wsAdapter.sendTo(senderClient, "game:navigate_to_match", {
            matchData: {
              player1: from,
              player2: to,
              initiator: from,
              type: 'friend_match'
            }
          });
        }

        if (accepterClient) {
          wsAdapter.sendTo(accepterClient, "game:navigate_to_match", {
            matchData: {
              player1: from,
              player2: to,
              initiator: from,
              type: 'friend_match'
            }
          });
        }
      }
    } catch (error) {
      console.error("Error handling game invite response:", error);
      wsAdapter.sendTo(clientId, "error", {
        message: "Failed to process game invite response"
      });
    }
  });

  /**
   * Blocks another user, cancelling any existing friend requests.
  */
  wsAdapter.on("user:block", async ({ clientId, payload }) => {
    try {
      const { from: blockerId, blocked: blockedId } = payload;
      if (!blockerId || !blockedId) {
        throw new Error("Missing user IDs");
      }

      const blockerIdNum = parseInt(blockerId);
      const blockedIdNum = parseInt(blockedId);

      if (isNaN(blockerIdNum) || isNaN(blockedIdNum)) {
        throw new Error("Invalid user IDs");
      }

      await blockUser(blockerIdNum, blockedIdNum);
      await cancelFriendRequest(blockerIdNum, blockedIdNum);
      await cancelFriendRequest(blockedIdNum, blockerIdNum);

      wsAdapter.sendTo(clientId, "user:blocked", { userId: blockedId });
    } catch (error) {
      console.error("Block error:", error);
      wsAdapter.sendTo(clientId, "error", {
        message: "Failed to block user",
        details: error.message
      });
    }
  });

  /**
   * Unblocks a previously blocked user.
  */
  wsAdapter.on("user:unblock", async ({ clientId, payload }) => {
    try {
      const { from, unblocked } = payload;
      if (!from || !unblocked) {
        throw new Error("Missing user IDs");
      }

      const blockerIdNum = parseInt(from);
      const blockedIdNum = parseInt(unblocked);

      if (isNaN(blockerIdNum) || isNaN(blockedIdNum)) {
        throw new Error("Invalid user IDs");
      }

      await unblockUser(blockerIdNum, blockedIdNum);
      wsAdapter.sendTo(clientId, "user:unblocked", { userId: blockedIdNum });
    } catch (error) {
      console.error("Unblock error:", error);
      wsAdapter.sendTo(clientId, "error", {
        message: "Failed to unblock user",
        details: error.message
      });
    }
  });

  /**
   * Checks if a user is blocked by another.
  */
  wsAdapter.on("user:check_blocked", async ({ clientId, payload }) => {
    try {
      const { userId, targetId } = payload;
      if (!userId || !targetId) {
        wsAdapter.sendTo(clientId, "error", {
          message: "Both user ID and target ID are required"
        });
        return;
      }

      const blockedUsers = await getBlockedUsers(userId);
      const isBlocked = blockedUsers.some(user => user.id === parseInt(targetId));

      wsAdapter.sendTo(clientId, "user:blocked_status", { userId, targetId, isBlocked });
    } catch (error) {
      console.error("Error checking blocked status:", error);
      wsAdapter.sendTo(clientId, "error", {
        message: "Failed to check blocked status",
        details: error.message
      });
    }
  });

  /**
   * Retrieves the list of users blocked by a given user.
  */
  wsAdapter.on("users:blocked_list", async ({ clientId, payload }) => {
    try {
      const { userId } = payload;
      if (!userId) {
        wsAdapter.sendTo(clientId, "error", { message: "User ID is required" });
        return;
      }

      const blockedUsers = await getBlockedUsers(userId);
      wsAdapter.sendTo(clientId, "users:blocked_list", { blockedUsers });
    } catch (error) {
      fastify.log.error("Error fetching blocked users:", error);
      wsAdapter.sendTo(clientId, "error", {
        message: "Failed to fetch blocked users",
        details: error.message
      });
    }
  });

  /**
   * Retrieves a user's friends list, including their online/offline status.
  */
  wsAdapter.on("friends:get", async ({ clientId, payload }) => {
    try {
      const { userId } = payload;
      const user = await getUser(userId);
      if (!user) {
        wsAdapter.sendTo(clientId, "error", { message: "User not found" });
        return;
      }

      const friendsWithStatus = user.friends.map(friend => ({
        ...friend,
        status: onlineUsers.has(friend.id.toString()) ? 'online' : 'offline'
      }));

      wsAdapter.sendTo(clientId, "friends:list", { friends: friendsWithStatus });
    } catch (error) {
      fastify.log.error("Error fetching friends:", error);
      wsAdapter.sendTo(clientId, "error", { message: "Failed to fetch friends" });
    }
  });

  /**
   * Retrieves pending friend requests for a user.
  */
  wsAdapter.on("friends:get_pending", async ({ clientId, payload }) => {
    try {
      const { userId } = payload;
      const pendingRequests = await getPendingFriendRequests(userId);
      wsAdapter.sendTo(clientId, "friends:pending", { pending: pendingRequests });
    } catch (error) {
      fastify.log.error("Error fetching pending requests:", error);
      wsAdapter.sendTo(clientId, "error", { message: "Failed to fetch pending requests" });
    }
  });

  /**
   * Checks the friendship status between two users.
  */  
  wsAdapter.on("friendship:check", async ({ clientId, payload }) => {
    const { currentUserId, targetUserId } = payload;
    const status = await getFriendshipStatus(currentUserId, targetUserId);
    wsAdapter.sendTo(clientId, "friendship:status", { status });
  });
};