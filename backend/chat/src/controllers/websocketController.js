import { blockUser, getBlockedUsers, unblockUser } from "../services/blockService.js";
import { getUser, createOrUpdateUser, getUserByUsername, createChatRoom, getUsersFromAuth, getMessageRequests } from "../services/userService.js";
import { createFriendRequest, cancelFriendRequest, addFriend, getPendingFriendRequests, removeFriend, getFriendshipStatus } from "../services/friendService.js"
import { saveMessage, getMessages, getUnreadMessageCount, markMessagesAsRead } from "../services/chatService.js";

import { getDatabase } from "../db/initDB.js";
import axios from 'axios';

// Add this helper function at the top of your webSocketController.js

async function sendNotification(type, data) {
  const NOTIFICATION_SERVICE_URL = 'http://127.0.0.1:3003/api/notifications';

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
    // Don't throw - notifications shouldn't break main functionality
  }
}

export function setupWebSocketHandlers(wsAdapter, fastify) {
  // Track online users mapping username to clientId
  const onlineUsers = new Map();

  wsAdapter.on("user:connect", async ({ clientId, payload }) => {
    const { username, userId } = payload; // Destructure both fields
    if (!username || !userId) {
      wsAdapter.sendTo(clientId, "error", { message: "Username and User ID are required" });
      return;
    }
    console.log("new user has connected: ", username, " | with ID:", userId);
    console.log("######### ", clientId, "#########");
    wsAdapter.sendTo(clientId, "msg", { message: "User connected" });

    try {
      // Create or update user in database
      // Update user in database
      await createOrUpdateUser({ id: userId, username });

      // Fetch user by ID
      const user = await getUser(userId);
      if (!user) {
        wsAdapter.sendTo(clientId, "error", { message: "User not found" });
        return;
      }

      // Track user as online
      onlineUsers.set(userId.toString(), clientId);

    } catch (error) {
      fastify.log.error("Error in user:connect handler", error);
      wsAdapter.sendTo(clientId, "error", {
        message: "An error occurred while connecting",
      });
    }
  });

  // Handle disconnect
  wsAdapter.on("user:disconnect", async ({ clientId }) => {
    fastify.log.info(`Disconnected: ${clientId}`);

    // Find userId by client id and remove from online users
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
    }
  });

  // Handle friend request
  wsAdapter.on("friend:request", async ({ clientId, payload }) => {
    const { from, to } = payload;

    console.log("a friend request was sent from:", from)
    console.log("to:", to);
    try {
      // Save friend request to database
      await createFriendRequest(from, to);

      const senderUser = await getUser(from);
      const recipientUser = await getUser(to);
      if (senderUser && recipientUser) {
        // Send FRIEND_REQUEST notification to recipient
        await sendNotification('friend-request', {
          senderId: parseInt(from),
          recipientId: parseInt(recipientUser.id),
          nickname: senderUser.nickname,
        });
      }
      // ALSO send real-time WebSocket notification to Client2 if online
      const recipientClientId = onlineUsers.get(recipientUser.id.toString());
      if (recipientClientId) {
        wsAdapter.sendTo(recipientClientId, "notification:new", {
          type: 'FRIEND_REQUEST',
          senderId: from,
          senderName: senderUser.nickname,
          content: `${senderUser.nickname} sent you a friend request`,
        });
      }
    } catch (error) {
      fastify.log.error("Error in friend:request handler", error);
      wsAdapter.sendTo(clientId, "error", {
        message: `Failed to send friend request, ${error.message}`,
      });
    }
  });



  //   // Canceling a friend request
  // Add this to websocketController.js where other friend-related handlers are
  wsAdapter.on("friend:decline", async ({ clientId, payload }) => {
    try {
      const { from, to } = payload;

      console.log("friend request declined:");
      console.log("from user:", from);
      console.log("to user:", to);

      // Decline the friend request in the database
      await cancelFriendRequest(from, to);

      // Send confirmation to the user who declined the request
      wsAdapter.sendTo(clientId, "friend:declined", {
        success: true,
        userId: from
      });

      const fromUser = await getUser(from);
      const toUser = await getUser(to);
      await sendNotification('friend-declined', {
        senderId: parseInt(toUser.id),
        recipientId: parseInt(fromUser.id),
        nickname: toUser.nickname
      });
      // ALSO send real-time WebSocket notification to Client2 if online
      const recipientClientId = onlineUsers.get(fromUser.id.toString());
      if (recipientClientId) {
        wsAdapter.sendTo(recipientClientId, "notification:new", {
          type: 'FRIEND_DECLINED',
          senderId: toUser.id,
          recipientId: fromUser.id,
          senderName: toUser.nickname,
          content: `${toUser.nickname} Declined your friend request`
        });
      }

    } catch (error) {
      console.error("Error in friend:decline handler:", error);
      wsAdapter.sendTo(clientId, "error", {
        message: `Failed to decline friend request, ${error.message}`,
        details: error.message
      });
    }
  });

  // Handle canceling a sent friend request
  wsAdapter.on("friend:cancel_request", async ({ clientId, payload }) => {
    try {
      const { from, to } = payload;

      console.log("friend request canceled:");
      console.log("from user:", from);
      console.log("to user:", to);

      // Cancel the friend request in the database (using the same function as decline)
      await cancelFriendRequest(from, to);

      // Send confirmation to the user who canceled their request
      wsAdapter.sendTo(clientId, "friend:request_cancelled", {
        success: true,
        targetId: to
      });

      // Optionally notify the recipient that the request was canceled
      const recipientClientId = onlineUsers.get(to.toString());
      if (recipientClientId) {
        wsAdapter.sendTo(recipientClientId, "friend:request_cancelled", {
          fromId: from
        });
      }

    } catch (error) {
      console.error("Error in friend:cancel_request handler:", error);
      wsAdapter.sendTo(clientId, "error", {
        message: "Failed to cancel friend request",
        details: error.message
      });
    }
  });


  // Handle friend acceptance
  wsAdapter.on("friend:accept", async ({ clientId, payload }) => {
    const { from, to } = payload;


    console.log("friend request acceptance logs:");
    console.log("user1ID:", from);
    console.log("user2ID:", to);

    try {
      // Add friend relationship to database
      await addFriend(from, to);

      // Get user data for both users
      const fromUser = await getUser(from);
      const toUser = await getUser(to);

      if (!fromUser || !toUser) {
        wsAdapter.sendTo(clientId, "error", {
          message: "Failed to retrieve user data",
        });
        return;
      }
      await sendNotification('friend-accepted', {
        senderId: parseInt(fromUser.id),
        recipientId: parseInt(toUser.id),
        nickname: toUser.nickname
      });
      // ALSO send real-time WebSocket notification to Client2 if online
      const recipientClientId = onlineUsers.get(toUser.id.toString());
      if (recipientClientId) {
        wsAdapter.sendTo(recipientClientId, "notification:new", {
          type: 'FRIEND_ACCEPTED',
          senderId: fromUser.id,
          recipientId: toUser.id,
          senderName: fromUser.nickname,
          content: `${fromUser.nickname} Accepted your friend request`
        });
      }
    } catch (error) {
      fastify.log.error("Error in friend:accept handler", error);
      wsAdapter.sendTo(clientId, "error", {
        message: `Failed to accept friend request, ${error.message}`,
      });
    }
  });


  // Handle friend removal
  wsAdapter.on("friend:remove", async ({ clientId, payload }) => {
    try {
      const { userId, friendId } = payload;

      console.log(`Removing friend: User ${userId} removing friend ${friendId}`);

      // Remove friendship in the database
      await removeFriend(userId, friendId);

      // Notify the user that the friend was removed successfully
      wsAdapter.sendTo(clientId, "friend:removed", {
        success: true,
        friendId
      });

      // // Optionally notify the other user if they're online
      // wsAdapter.sendTo(friendId, "friend:removed", {
      //   success: true,
      //   friendId: userId
      // });

    } catch (error) {
      // fastify.log.error("Error in friend:remove handler:", error);
      console.error("Error in friend:remove handler:", error); // More detailed logging
      wsAdapter.sendTo(clientId, "error", {
        message: "Failed to remove friend",
        details: error.message
      });
    }
  });

  // Handle private messages
  wsAdapter.on("message:private", async ({ clientId, payload }) => {
    try {
      const { from, to, content, timestamp } = payload;

      const fromUser = await getUser(from);
      const toUser = await getUser(to);

      if (!fromUser || !toUser) {
        wsAdapter.sendTo(clientId, "error", {
          message: `Error retrieving user's data`
        });
        return ;
      }
      // Check if either user has blocked the other
      const blockedUsers = await getBlockedUsers(from);
      const isBlocked = blockedUsers.some(user => user.id === parseInt(to));

      // Also check if recipient has blocked the sender
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

      // Create a room ID (combination of both usernames sorted alphabetically)
      const roomId = [from, to].sort().join("-");

      // Ensure chat room exists in database
      await createChatRoom(roomId, [from, to]);

      // Create message
      const newMessage = {
        id: Date.now().toString(),
        from,
        content,
        timestamp,
        read_status: 0
      };

      // Save message to database
      await saveMessage(newMessage, roomId);

      // Send the message to recipient if online
      let recipientClientId = onlineUsers.get(to.toString());
      console.log(`Sending message to user ${to}, client ID: ${recipientClientId}`);

      // Send the message to recipient if online
      if (recipientClientId) {
        wsAdapter.sendTo(recipientClientId, "message:received", {
          roomId,
          message: newMessage,
        });
        wsAdapter.sendTo(recipientClientId, "notification:new", {
          type: "USER_MESSAGE",
          senderId: from,
          recipientId: to,
          senderName: fromUser.nickname,
          content: `${fromUser.nickname}: ${newMessage.content}`
        })
      }

      // Also send confirmation to sender
      wsAdapter.sendTo(clientId, "message:sent", {
        roomId,
        message: newMessage,
      });

    } catch (error) {
      fastify.log.error("Error in message:private handler", error);
      wsAdapter.sendTo(clientId, "error", {
        message: "Failed to send message",
      });
    }
  });


  wsAdapter.on("messages:unread:get", async ({ clientId, payload }) => {
    try {
      const { userId } = payload;

      // Get unread message counts from database
      const unreadCounts = await getUnreadMessageCount(userId);

      // Send to client
      wsAdapter.sendTo(clientId, "messages:unread", {
        unreadCounts
      });
    } catch (error) {
      console.error("Error getting unread message counts:", error);
      wsAdapter.sendTo(clientId, "error", {
        message: "Failed to get unread message counts",
        details: error.message
      });
    }
  });


  wsAdapter.on("messages:mark_read", async ({ clientId, payload }) => {
    try {
      const { roomId, userId } = payload;

      // Validate input
      if (!roomId || !userId) {
        throw new Error('Missing roomId or userId');
      }

      console.log(`Marking messages as read in room ${roomId} for user ${userId}`);

      // Update message read status in database
      await markMessagesAsRead(roomId, userId);

      // Send confirmation back to client
      wsAdapter.sendTo(clientId, "messages:marked_read", {
        roomId,
        success: true
      });

      // Get the updated unread counts for this user
      const unreadCounts = await getUnreadMessageCount(userId);

      // Send updated unread counts to user
      wsAdapter.sendTo(clientId, "messages:unread", {
        unreadCounts
      });

    } catch (error) {
      console.error("Error marking messages as read:", error);
      wsAdapter.sendTo(clientId, "error", {
        message: "Failed to mark messages as read",
        details: error.message
      });
    }
  });

  // Handle message history request
  wsAdapter.on("messages:history", async ({ clientId, payload }) => {
    try {
      const { roomId } = payload;

      // Validate input
      if (!roomId || typeof roomId !== 'string') {
        throw new Error('Invalid room ID');
      }

      const messages = await getMessages(roomId, 1000);

      wsAdapter.sendTo(clientId, "messages:history", {
        roomId,
        messages
      });

    } catch (error) {
      fastify.log.error("Message history error:", error);
      wsAdapter.sendTo(clientId, "error", {
        message: "Failed to retrieve message history",
        details: error.message
      });
    }
  });

  wsAdapter.on("user:block", async ({ clientId, payload }) => {
    try {
      const { from: blockerId, blocked: blockedId } = payload;
      // Ensure IDs are valid numbers
      if (!blockerId || !blockedId) {
        throw new Error("Missing user IDs");
      }

      const blockerIdNum = parseInt(blockerId);
      const blockedIdNum = parseInt(blockedId);

      if (isNaN(blockerIdNum) || isNaN(blockedIdNum)) {
        throw new Error("Invalid user IDs - not valid numbers");
      }
      // Block the user
      await blockUser(blockerIdNum, blockedIdNum);

      await cancelFriendRequest(blockerIdNum, blockedIdNum);
      await cancelFriendRequest(blockedIdNum, blockerIdNum);

      console.log("the user:", blockerId, ",has blocked:", blockedId);

      // Notify the blocker
      wsAdapter.sendTo(clientId, "user:blocked", {
        userId: blockedId, // Send the blocked user's ID
      });
    } catch (error) {
      console.error("Block error details:", error.message, error.stack);
      fastify.log.error(`Block error: ${error.message}`);
      wsAdapter.sendTo(clientId, "error", {
        message: "Failed to block user",
        details: error.message
      });
    }
  });

  // Handle unblock user
  wsAdapter.on("user:unblock", async ({ clientId, payload }) => {
    try {
      const { from, unblocked } = payload;

      if (!from || !unblocked) {
        throw new Error("Missing user IDs");
      }

      const blockerIdNum = parseInt(from);
      const blockedIdNum = parseInt(unblocked);

      console.log(blockedIdNum, blockerIdNum);
      if (isNaN(blockerIdNum) || isNaN(blockedIdNum)) {
        throw new Error("Invalid user IDs - not valid numbers");
      }

      // Remove from blocked users in database
      await unblockUser(blockerIdNum, blockedIdNum);

      console.log(blockerIdNum, "unblocked user", blockedIdNum);

      // Confirm unblock to user
      wsAdapter.sendTo(clientId, "user:unblocked", {
        userId: blockedIdNum
      });
    } catch (error) {
      console.error("Unblock error details:", error.message, error.stack);
      fastify.log.error(`Error in user:unblock handler: ${error.message}`);
      wsAdapter.sendTo(clientId, "error", {
        message: "Failed to unblock user",
        details: error.message
      });
    }
  });


  wsAdapter.on("friends:get", async ({ clientId, payload }) => {
    try {
      const { userId } = payload;

      // Get user data
      const user = await getUser(userId);
      if (!user) {
        wsAdapter.sendTo(clientId, "error", {
          message: "User not found"
        });
        return;
      }

      // Send friends list with online status
      const friendsWithStatus = user.friends.map(friend => ({
        ...friend,
        isOnline: onlineUsers.has(friend.username)
      }));

      wsAdapter.sendTo(clientId, "friends:list", {
        friends: friendsWithStatus
      });

    } catch (error) {
      fastify.log.error("Error fetching friends:", error);
      wsAdapter.sendTo(clientId, "error", {
        message: "Failed to fetch friends"
      });
    }
  });

  wsAdapter.on("friends:get_pending", async ({ clientId, payload }) => {
    try {
      const { userId } = payload;

      // Get pending requests from database
      const pendingRequests = await getPendingFriendRequests(userId);
      // console.log("lolllllllllllllllllllllllllll", pendingRequests);

      // // Convert user IDs to user details
      // const pendingDetails = await getUsersFromAuth(
      //   pendingRequests.map(req => req.from_user)
      // );
      // console.log(pendingDetails);

      wsAdapter.sendTo(clientId, "friends:pending", {
        pending: pendingRequests
      });

    } catch (error) {
      fastify.log.error("Error fetching pending requests:", error);
      wsAdapter.sendTo(clientId, "error", {
        message: "Failed to fetch pending requests"
      });
    }
  });

  wsAdapter.on("friendship:check", async ({ clientId, payload }) => {
    // Look up friendship status for the given nickname

    const { currentUserId, targetUserId } = payload;

    const status = await getFriendshipStatus(currentUserId, targetUserId);

    console.log(status);

    wsAdapter.sendTo(clientId, "friendship:status", {
      status: status
    });
  });

  wsAdapter.on("message:requests:get", async ({ clientId, payload }) => {
    try {
      const { userId } = payload;

      // Validate input
      if (!userId) {
        throw new Error('Missing userId');
      }

      console.log(`Fetching chat requests for user ${userId}`);

      // Get message requests using the service function
      const messageRequests = await getMessageRequests(userId);

      // Send the non-friends chat list to client
      wsAdapter.sendTo(clientId, "message:requests", {
        requests: messageRequests
      });

    } catch (error) {
      console.error("Error fetching message requests:", error);
      wsAdapter.sendTo(clientId, "error", {
        message: "Failed to fetch message requests",
        details: error.message
      });
    }
  });

  wsAdapter.on("users:blocked_list", async ({ clientId, payload }) => {
    try {
      const { userId } = payload;

      if (!userId) {
        wsAdapter.sendTo(clientId, "error", {
          message: "User ID is required"
        });
        return;
      }

      const blockedUsers = await getBlockedUsers(userId);

      wsAdapter.sendTo(clientId, "users:blocked_list", {
        blockedUsers
      });

      //testing ....
      console.log("blocked users list:", blockedUsers);
      console.log(`Sent blocked users list to user ${userId}`);


    } catch (error) {
      fastify.log.error("Error fetching blocked users:", error);
      wsAdapter.sendTo(clientId, "error", {
        message: "Failed to fetch blocked users",
        details: error.message
      });
    }
  });

  wsAdapter.on("user:check_blocked", async ({ clientId, payload }) => {
    try {
      const { userId, targetId } = payload;

      if (!userId || !targetId) {
        wsAdapter.sendTo(clientId, "error", {
          message: "Both user ID and target ID are required"
        });
        return;
      }

      // Get the list of users blocked by userId
      const blockedUsers = await getBlockedUsers(userId);

      // Check if targetId is in the list of blocked users
      const isBlocked = blockedUsers.some(user => user.id === parseInt(targetId));

      console.log(`Checking if user ${userId} has blocked user ${targetId}: ${isBlocked}`);

      // Send the result back to the client
      wsAdapter.sendTo(clientId, "user:blocked_status", {
        userId,
        targetId,
        isBlocked
      });

    } catch (error) {
      console.error("Error checking blocked status:", error);
      wsAdapter.sendTo(clientId, "error", {
        message: "Failed to check blocked status",
        details: error.message
      });
    }
  });
}
