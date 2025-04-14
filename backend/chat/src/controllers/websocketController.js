import { blockUser, getBlockedUsers, unblockUser } from "../services/blockService.js";
import { getUser, createOrUpdateUser, getUserByUsername, createChatRoom, getUsersFromAuth, getMessageRequests } from "../services/userService.js";
import { createFriendRequest, cancelFriendRequest, addFriend, getPendingFriendRequests, removeFriend, getFriendshipStatus } from "../services/friendService.js"
import { saveMessage, getMessages, getUnreadMessageCount, markMessagesAsRead } from "../services/chatService.js";

import { getDatabase } from "../db/initDB.js";


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
    console.log("#########");
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
      onlineUsers.set(clientId, userId);

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
    console.log("user disconnected:", username);
    if (disconnectedUser) {
      onlineUsers.delete(disconnectedUser);
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
    
    // Optionally, notify the sender that their request was declined
    // wsAdapter.sendTo(from, "friend:request:declined", {
    //   success: true,
    //   userId: to
    // });
    
  } catch (error) {
    console.error("Error in friend:decline handler:", error);
    wsAdapter.sendTo(clientId, "error", {
      message: "Failed to decline friend request",
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
      let recipientClientId = null;
      for (const [wsClientId, userId] of onlineUsers.entries()) {
        if (userId === to.toString()) {
          recipientClientId = wsClientId;
          break;
        }
      }
  
    // Send the message to recipient if online
    if (recipientClientId) {
      wsAdapter.sendTo(recipientClientId, "message:received", {
        roomId,
        message: newMessage,
      });

      // Get updated unread counts and send them to the recipient
      // const unreadCounts = await getUnreadMessageCount(to);
      // wsAdapter.sendTo(recipientClientId, "messages:unread", {
      //   unreadCounts
      // });
    }
      // Also send confirmation to sender
      wsAdapter.sendTo(clientId, "message:sent", {
        roomId,
        message: newMessage,
      });



      // console.log("nb of msgs: ",unreadCounts);
      


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
      console.log(blockerId, "blocked", blockedId);
      // Ensure IDs are valid numbers
      if (typeof blockerId !== "number" || typeof blockedId !== "number") {
        throw new Error("Invalid user IDs");
      }

      // Block the user
      await blockUser(blockerId, blockedId);

      console.log("the user:", blockerId, ", blocked:", blockedId);

      // Notify the blocker
      wsAdapter.sendTo(clientId, "user:blocked", {
        userId: blockedId, // Send the blocked user's ID
      });
    } catch (error) {
      fastify.log.error("Block error:", error);
      wsAdapter.sendTo(clientId, "error", {
        message: "Failed to block user",
      });
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

  wsAdapter.on("users:blocked_list", async ({clientId, payload}) => {
    try {
      const { userId } = payload;

      if (!userId)
      {
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
}
