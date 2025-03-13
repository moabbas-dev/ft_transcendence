import { blockUser, unblockUser } from "../services/blockService.js";
import { getUser, createOrUpdateUser, getUserByUsername } from "../services/userService.js";
import { createFriendRequest, addFriend } from "../services/friendService.js"

export function setupWebSocketHandlers(wsAdapter, fastify) {
  // Track online users mapping username to clientId
  const onlineUsers = new Map();

  wsAdapter.on("user:connect", async ({ clientId, payload }) => {
    const { username, userId } = payload; // Destructure both fields
    if (!username || !userId) {
        wsAdapter.sendTo(clientId, "error", { message: "Username and User ID are required" });
        return;
    }
    console.log(userId);
    console.log(username);

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
      onlineUsers.set(clientId, username);

    //   // Send friend list to user with online status
    //   const friendsWithStatus = await Promise.all(
    //     (user.friends || []).map(async (friendUsername) => {
    //       const friend = await getUser(friendUsername);
    //       if (!friend) return null;

    //       return {
    //         username: friend.username,
    //         firstname: friend.firstname,
    //         lastname: friend.lastname,
    //         isOnline: onlineUsers.has(friendUsername),
    //       };
    //     })
    //   );

    //   // Filter out null entries
    //   const validFriends = friendsWithStatus.filter((f) => f !== null);

    //   wsAdapter.sendTo(clientId, "friends:list", {
    //     friends: validFriends,
    //   });

    //   // Send pending friend requests
    //   wsAdapter.sendTo(clientId, "friends:pending", {
    //     pending: user.pendingFriends || [],
    //   });
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

    // Find username by client id
    let disconnectedUser;
    onlineUsers.forEach((cId, username) => {
      if (cId === clientId) {
        disconnectedUser = username;
      }
    });

    if (disconnectedUser) {
      onlineUsers.delete(disconnectedUser);
    }
  });

  // Handle friend request
  wsAdapter.on("friend:request", async ({ clientId, payload }) => {
    const { from, to } = payload;
    
    console.log("a friend request was sent from:", from)
    console.log("to:" ,to);
    try {
      // Save friend request to database
      await createFriendRequest(from, to);

      // // Notify the user if they're online
      // const toClientId = onlineUsers.get(to);
      // if (toClientId) {
      //   const fromUser = await getUser(from);
      //   if (fromUser) {
      //     wsAdapter.sendTo(toClientId, "friend:request", {
      //       username: fromUser.username,
      //       firstname: fromUser.firstname,
      //       lastname: fromUser.lastname,
      //     });
      //   }
      // }
    } catch (error) {
      fastify.log.error("Error in friend:request handler", error);
      wsAdapter.sendTo(clientId, "error", {
        message: "Failed to send friend request",
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

      // Notify both users
      // const fromClientId = onlineUsers.get(from);
      // const toClientId = onlineUsers.get(to);

      // if (fromClientId) {
      //   wsAdapter.sendTo(fromClientId, "friend:accepted", {
      //     username: toUser.username,
      //     firstname: toUser.firstname,
      //     lastname: toUser.lastname,
      //     isOnline: onlineUsers.has(to),
      //   });
      // }

      // if (toClientId) {
      //   wsAdapter.sendTo(toClientId, "friend:accepted", {
      //     username: fromUser.username,
      //     firstname: fromUser.firstname,
      //     lastname: fromUser.lastname,
      //     isOnline: onlineUsers.has(from),
      //   });
      // }
    } catch (error) {
      fastify.log.error("Error in friend:accept handler", error);
      wsAdapter.sendTo(clientId, "error", {
        message: "Failed to accept friend request",
      });
    }
  });

  // Handle private messages
  wsAdapter.on("message:private", async ({ clientId, payload }) => {
    try {
      const { from, to, content, timestamp } = payload;

      // Create a room ID (combination of both usernames sorted alphabetically)
      const roomId = [from, to].sort().join("-");

      // Ensure chat room exists in database
      await chatService.createChatRoom(roomId, [from, to]);

      // Create message
      const newMessage = {
        id: Date.now().toString(),
        from,
        content,
        timestamp,
      };

      // Save message to database
      await chatService.saveMessage(newMessage, roomId);

      // Send the message to recipient if online
      const toClientId = onlineUsers.get(to);
      if (toClientId) {
        wsAdapter.sendTo(toClientId, "message:received", {
          roomId,
          message: newMessage,
        });
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

  // Handle message history request
  wsAdapter.on("messages:history", async ({ clientId, payload }) => {
    try {
      const { roomId } = payload;

      // Get messages from database
      const messages = await chatService.getMessages(roomId, 50);

      wsAdapter.sendTo(clientId, "messages:history", {
        roomId,
        messages,
      });
    } catch (error) {
      fastify.log.error("Error in messages:history handler", error);
      wsAdapter.sendTo(clientId, "error", {
        message: "Failed to retrieve message history",
      });
    }
  });

  // Handle user typing indicator
  wsAdapter.on("user:typing", ({ payload }) => {
    const { from, to } = payload;
    const toClientId = onlineUsers.get(to);

    if (toClientId) {
      wsAdapter.sendTo(toClientId, "user:typing", { username: from });
    }
  });

  // Handle block user
  wsAdapter.on("user:block", async ({ clientId, payload }) => {
    try {
        const { from: blockerUsername, blocked: blockedUsername } = payload;
        
        // Convert usernames to user IDs
        const blocker = await getUserByUsername(blockerUsername);
        const blocked = await getUserByUsername(blockedUsername);
        if (!blocker || !blocked) throw new Error("User not found");

        await blockUser(blocker.id, blocked.id); // Use IDs
        wsAdapter.sendTo(clientId, "user:blocked", { username: blockedUsername });
    } catch (error) {
        fastify.log.error("Block error:", error);
        wsAdapter.sendTo(clientId, "error", { message: "Failed to block user" });
    }
});

  // Handle unblock user
  wsAdapter.on("user:unblock", async ({ clientId, payload }) => {
    try {
      const { from, unblocked } = payload;

      // Remove from blocked users in database
      await unblockUser(from, unblocked);

      // Confirm unblock to user
      wsAdapter.sendTo(clientId, "user:unblocked", { username: unblocked });
    } catch (error) {
      fastify.log.error("Error in user:unblock handler", error);
      wsAdapter.sendTo(clientId, "error", {
        message: "Failed to unblock user",
      });
    }
  });
}


