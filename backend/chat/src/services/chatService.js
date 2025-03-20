import { getDatabase } from "../db/initDB.js";
import { getUsersFromAuth } from "./userService.js"


export async function blockUser(userId, blockedId) {
  const db = await getDatabase();
  await db.run(
    `INSERT OR IGNORE INTO blocked_users (user_id, blocked_id) VALUES (?, ?)`,
    [userId, blockedId]
  );
}

export async function unblockUser(userId, blockedId) {
  const db = await getDatabase();
  await db.run(
    `DELETE FROM blocked_users WHERE user_id = ? AND blocked_id = ?`,
    [userId, blockedId]
  );
}

export async function getBlockedUsers(userId) {
  const db = await getDatabase();
  const blocked = await db.all(
    `SELECT blocked_id FROM blocked_users WHERE user_id = ?`,
    [userId]
  );

  // Get user details for each blocked user
  const blockedIds = blocked.map((b) => b.blocked_id);
  return await getUsersFromAuth(blockedIds);
}


export async function saveMessage(message, roomId) {
  const db = await getDatabase();
  
  try {
    await db.run('BEGIN TRANSACTION');

    // Insert the message
    await db.run(
      `INSERT INTO messages (id, room_id, sender_id, content, timestamp) 
      VALUES (?, ?, ?, ?, ?)`,
      [
        message.id,
        roomId,
        message.from,
        message.content,
        message.timestamp,
        message.read_status || 0
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


// In chatService.js
export async function getMessages(roomId, limit = 50) {
  const db = await getDatabase();
  
  try {
    const messages = await db.all(
      `SELECT 
        id, 
        sender_id as senderId, 
        content, 
        timestamp,
        read_status 
        created_at as createdAt 
       FROM messages 
       WHERE room_id = ? 
       ORDER BY timestamp DESC 
       LIMIT ?`,
      [roomId, limit]
    );

    // Convert SQLite timestamp strings to JS timestamps
    return messages.map(message => ({
      ...message,
      createdAt: new Date(message.createdAt).getTime(),
      timestamp: parseInt(message.timestamp)
    }));

  } catch (error) {
    console.error('Error fetching messages:', error);
    throw new Error('Failed to retrieve messages');
  }
}

// ///////////////////////////////////////////////////////

// // working on displayin the un-read messages  
// // ⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️

// ///////////////////////////////////////////////////////

// export async function getUnreadMessageCount(userId) {
//   const db = await getDatabase();
  
//   // Get all rooms the user is part of
//   const rooms = await db.all(
//     `SELECT room_id FROM room_participants WHERE user_id = ?`,
//     [userId]
//   );
  
//   const unreadCounts = {};
  
//   // For each room, count unread messages
//   for (const room of rooms) {
//     const roomId = room.room_id;
    
//     // Get the other participant in this room
//     const otherUser = await db.get(
//       `SELECT user_id FROM room_participants 
//        WHERE room_id = ? AND user_id != ?`,
//       [roomId, userId]
//     );
    
//     if (otherUser) {
//       // Count unread messages from the other user
//       const count = await db.get(
//         `SELECT COUNT(*) as count FROM messages 
//          WHERE room_id = ? AND sender_id != ? AND read_status = 0`,
//         [roomId, userId]
//       );
      
//       unreadCounts[otherUser.user_id] = count.count;
//     }
//   }
  
//   return unreadCounts;
// }


// // Add a function to mark messages as read
// export async function markMessagesAsRead(roomId, userId) {
//   const db = await getDatabase();
  
//   await db.run(
//     `UPDATE messages 
//      SET read_status = 1 
//      WHERE room_id = ? AND sender_id != ?`,
//     [roomId, userId]
//   );
  
//   return true;
// }