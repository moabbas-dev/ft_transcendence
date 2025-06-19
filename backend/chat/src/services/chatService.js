import { getDatabase } from "../db/initDB.js";

/**
 * Save a message in the database
 * @param {Object} message - The message object
 * @param {number} roomId - The ID of the room where the message was sent
 * @returns {Promise<boolean>} - Returns true if the message was saved successfully
 */
export async function saveMessage(message, roomId) {
  const db = await getDatabase();
  
  try {
    await db.run('BEGIN TRANSACTION');

    await db.run(
      `INSERT INTO messages (id, room_id, sender_id, receiver_id, content, timestamp, read_status, message_type, extra_data) 
      VALUES (?, ?, ?, ?,?, ?, ?, ?, ?)`,
      [
        message.id,
        roomId,
        message.senderId,
        message.receiverId,
        message.content,
        message.timestamp,
        message.read_status || 0,
        message.messageType || null,
        message.gameInviteData ? JSON.stringify(message.gameInviteData) : null
      ]
    );

    await db.run('COMMIT');
    return true;

  } catch (error) {
    await db.run('ROLLBACK');
    console.error('Error saving message:', error);
    throw new Error('Failed to save message');
  }
}

/**
 * Retrieve messages from a chat room
 * @param {number} roomId - The ID of the chat room
 * @param {number} [limit=1000] - The maximum number of messages to retrieve
 * @returns {Promise<Array>} - Returns an array of messages
 */
export async function getMessages(roomId, limit = 1000) {
  const db = await getDatabase();
  
  try {
    const messages = await db.all(
      `SELECT 
        id, 
        sender_id as senderId, 
        receiver_id as receiverId,
        content, 
        timestamp,
        read_status,
        message_type,
        extra_data,
        created_at as createdAt 
       FROM messages 
       WHERE room_id = ? 
       ORDER BY timestamp DESC 
       LIMIT ?`,
      [roomId, limit]
    );

    return messages.map(message => ({
      ...message,
      createdAt: new Date(message.createdAt).getTime(),
      timestamp: parseInt(message.timestamp),
      messageType: message.message_type,
      gameInviteData: message.extra_data ? JSON.parse(message.extra_data) : undefined
    }));

  } catch (error) {
    console.error('Error fetching messages:', error);
    throw new Error('Failed to retrieve messages');
  }
}

/**
 * Get the count of unread messages for a user
 * @param {number} userId - The ID of the user
 * @returns {Promise<Object>} - Returns an object with unread message counts per user
 */
export async function getUnreadMessageCount(userId) {
  const db = await getDatabase();
  
  const rooms = await db.all(
    `SELECT room_id FROM room_participants WHERE user_id = ?`,
    [userId]
  );
  
  const unreadCounts = {};
  
  for (const room of rooms) {
    const roomId = room.room_id;
    
    const otherUser = await db.get(
      `SELECT user_id FROM room_participants 
       WHERE room_id = ? AND user_id != ?`,
      [roomId, userId]
    );
    
    if (otherUser) {
      const count = await db.get(
        `SELECT COUNT(*) as count FROM messages 
         WHERE room_id = ? AND sender_id != ? AND read_status = 0`,
        [roomId, userId]
      );
      
      unreadCounts[otherUser.user_id] = count.count;
    }
  }
  return unreadCounts;
}

/**
 * Mark all messages in a room as read for a user
 * @param {number} roomId - The ID of the chat room
 * @param {number} userId - The ID of the user marking messages as read
 * @returns {Promise<boolean>} - Returns true if messages were successfully marked as read
 */
export async function markMessagesAsRead(roomId, userId) {
  const db = await getDatabase();
  
  await db.run(
    `UPDATE messages 
     SET read_status = 1 
     WHERE room_id = ? AND sender_id != ?`,
    [roomId, userId]
  );
  
  return true;
}


/**
 * Get all message requests from non-friends
 * @param {number} userId - The ID of the user to check for
 * @returns {Promise<Array>} - Array of users who have sent messages but aren't friends
 */
export async function getMessageRequests(userId) {
  try {
    const db = await getDatabase();

    // Get all rooms where the user is a participant
    const rooms = await db.all(
      `SELECT rp.room_id
       FROM room_participants rp
       WHERE rp.user_id = ?`,
      [userId]
    );

    const messageRequests = [];

    // For each room, check if it's with a non-friend
    for (const room of rooms) {
      const roomId = room.room_id;

      // Get the other user in this chat room
      const otherUser = await db.get(
        `SELECT user_id FROM room_participants
         WHERE room_id = ? AND user_id != ?`,
        [roomId, userId]
      );

      if (!otherUser) continue;

      // Check if they are friends
      const isFriend = await db.get(
        `SELECT 1 FROM friends
         WHERE user_id = ? AND friend_id = ?`,
        [userId, otherUser.user_id]
      );

      // If not friends, add to requests
      if (!isFriend) {
        // Get user details
        const userDetails = await getUserFromAuth(otherUser.user_id);

        if (userDetails) {
          messageRequests.push({
            user: userDetails,
          });
        }
      }
    }

    return messageRequests;

  } catch (error) {
    console.error("Error getting message requests:", error);
    throw new Error(`Failed to get message requests: ${error.message}`);
  }
}

/**
 * Creates a chat room and adds users as participants.
 *
 * Ensures the chat room and participant entries exist. Uses transactions for consistency.
 *
 * @param {string} roomId - The ID of the chat room.
 * @param {Array<number>} participants - List of user IDs to include in the room.
 * @returns {Promise<boolean>} - Returns true on success, throws on failure.
*/
export async function createChatRoom(roomId, participants) {
  const db = await getDatabase();

  try {
    await db.run('BEGIN TRANSACTION');

    await db.run(
      `INSERT OR IGNORE INTO chat_rooms (id) VALUES (?)`,
      [roomId]
    );

    for (const userId of participants) {
      await db.run(
        `INSERT OR IGNORE INTO room_participants (room_id, user_id) VALUES (?, ?)`,
        [roomId, userId]
      );
    }

    await db.run('COMMIT');
    return true;

  } catch (error) {
    await db.run('ROLLBACK');
    console.error('Error creating chat room:', error);
    throw new Error('Failed to create chat room');
  }
};
