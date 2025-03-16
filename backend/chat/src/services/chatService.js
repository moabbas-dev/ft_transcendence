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
        message.timestamp
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
