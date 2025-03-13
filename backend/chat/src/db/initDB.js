// backend/src/database.js
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const axios = require("axios"); // You'll need to install axios

// Configure authentication service API URL
const AUTH_API_URL = process.env.AUTH_API_URL;

let db = null;

async function initDatabase() {
  // Initialize chat database
  db = await open({
    filename: "./data/chat.db",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS friends (
      user_id INTEGER NOT NULL,
      friend_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, friend_id)
    );

    CREATE TABLE IF NOT EXISTS friend_requests (
      from_user INTEGER NOT NULL,
      to_user INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (from_user, to_user)
    );

    CREATE TABLE IF NOT EXISTS blocked_users (
      user_id INTEGER NOT NULL,
      blocked_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, blocked_id)
    );

    CREATE TABLE IF NOT EXISTS chat_rooms (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS room_participants (
      room_id TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      PRIMARY KEY (room_id, user_id),
      FOREIGN KEY (room_id) REFERENCES chat_rooms (id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      sender_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES chat_rooms (id)
    );
  `);

  console.log("Database initialized");
  return db;
}

async function getDatabase() {
  if (!db) {
    db = await initDatabase();
  }
  return db;
}

// Helper function to get user from auth service API
async function getUserFromAuth(userId) {
  try {
    const response = await axios.get(`${AUTH_API_URL}/auth/users/id/${userId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching user ${userId} from auth service:`,
      error.message
    );
    return null;
  }
}

// Get multiple users from auth service API
async function getUsersFromAuth(userIds) {
  if (!userIds || userIds.length === 0) return [];

  try {
    // Get all users and filter locally - this could be optimized with a
    // custom endpoint in the auth service that accepts multiple IDs
    const response = await axios.get(`${AUTH_API_URL}/auth/users`);
    const allUsers = response.data;
    return allUsers.filter((user) => userIds.includes(user.id));
  } catch (error) {
    console.error("Error fetching users from auth service:", error.message);
    return [];
  }
}

async function getUser(userId) {
  const db = await getDatabase();
  const user = await getUserFromAuth(userId);

  if (!user) return null;

  const friends = await db.all(
    `SELECT friend_id FROM friends WHERE user_id = ?`,
    [userId]
  );
  const pendingRequests = await db.all(
    `SELECT from_user FROM friend_requests WHERE to_user = ?`,
    [userId]
  );
  const blockedUsers = await db.all(
    `SELECT blocked_id FROM blocked_users WHERE user_id = ?`,
    [userId]
  );

  // Get friend details from auth service
  const friendIds = friends.map((f) => f.friend_id);
  const friendDetails = await getUsersFromAuth(friendIds);

  // Get pending request details from auth service
  const pendingIds = pendingRequests.map((p) => p.from_user);
  const pendingDetails = await getUsersFromAuth(pendingIds);

  // Get blocked user details from auth service
  const blockedIds = blockedUsers.map((b) => b.blocked_id);
  const blockedDetails = await getUsersFromAuth(blockedIds);

  return {
    ...user,
    friends: friendDetails,
    pendingFriends: pendingDetails,
    blockedUsers: blockedDetails,
  };
}

async function getAllUsers() {
  try {
    const response = await axios.get(`${AUTH_API_URL}/auth/users`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all users from auth service:", error.message);
    return [];
  }
}

async function addFriend(userId, friendId) {
  const db = await getDatabase();
  await db.run("BEGIN TRANSACTION");

  try {
    await db.run(
      `INSERT OR IGNORE INTO friends (user_id, friend_id) VALUES (?, ?)`,
      [userId, friendId]
    );
    await db.run(
      `INSERT OR IGNORE INTO friends (user_id, friend_id) VALUES (?, ?)`,
      [friendId, userId]
    );

    await db.run(
      `DELETE FROM friend_requests WHERE (from_user = ? AND to_user = ?) OR (from_user = ? AND to_user = ?)`,
      [userId, friendId, friendId, userId]
    );

    await db.run("COMMIT");
  } catch (error) {
    await db.run("ROLLBACK");
    throw error;
  }
}

async function removeFriend(userId, friendId) {
  const db = await getDatabase();
  await db.run("BEGIN TRANSACTION");

  try {
    await db.run(
      `DELETE FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)`,
      [userId, friendId, friendId, userId]
    );

    await db.run("COMMIT");
  } catch (error) {
    await db.run("ROLLBACK");
    throw error;
  }
}

async function createFriendRequest(fromUser, toUser) {
  const db = await getDatabase();
  await db.run(
    `INSERT OR IGNORE INTO friend_requests (from_user, to_user) VALUES (?, ?)`,
    [fromUser, toUser]
  );
}

async function getPendingFriendRequests(userId) {
  const db = await getDatabase();
  const requests = await db.all(
    `SELECT from_user FROM friend_requests WHERE to_user = ?`,
    [userId]
  );

  // Get user details for each request
  const requestIds = requests.map((r) => r.from_user);
  return getUsersFromAuth(requestIds);
}

async function blockUser(userId, blockedId) {
  const db = await getDatabase();
  await db.run(
    `INSERT OR IGNORE INTO blocked_users (user_id, blocked_id) VALUES (?, ?)`,
    [userId, blockedId]
  );
}

async function unblockUser(userId, blockedId) {
  const db = await getDatabase();
  await db.run(
    `DELETE FROM blocked_users WHERE user_id = ? AND blocked_id = ?`,
    [userId, blockedId]
  );
}

async function getBlockedUsers(userId) {
  const db = await getDatabase();
  const blocked = await db.all(
    `SELECT blocked_id FROM blocked_users WHERE user_id = ?`,
    [userId]
  );

  // Get user details for each blocked user
  const blockedIds = blocked.map((b) => b.blocked_id);
  return getUsersFromAuth(blockedIds);
}

async function createChatRoom(roomId, participantIds) {
  const db = await getDatabase();
  await db.run("BEGIN TRANSACTION");

  try {
    await db.run(`INSERT OR IGNORE INTO chat_rooms (id) VALUES (?)`, [roomId]);

    for (const userId of participantIds) {
      await db.run(
        `INSERT OR IGNORE INTO room_participants (room_id, user_id) VALUES (?, ?)`,
        [roomId, userId]
      );
    }

    await db.run("COMMIT");
  } catch (error) {
    await db.run("ROLLBACK");
    throw error;
  }
}

async function getChatRoom(roomId) {
  const db = await getDatabase();
  const room = await db.get(`SELECT id FROM chat_rooms WHERE id = ?`, [roomId]);

  if (!room) return null;

  const participants = await db.all(
    `SELECT user_id FROM room_participants WHERE room_id = ?`,
    [roomId]
  );
  const messages = await getMessages(roomId);

  // Get participant details from auth service
  const participantIds = participants.map((p) => p.user_id);
  const participantDetails = await getUsersFromAuth(participantIds);

  // Enrich messages with sender details
  const enrichedMessages = await Promise.all(
    messages.map(async (message) => {
      const sender = await getUserFromAuth(message.from);
      return {
        ...message,
        sender,
      };
    })
  );

  return {
    id: roomId,
    participants: participantDetails,
    messages: enrichedMessages,
  };
}

async function getUserChatRooms(userId) {
  const db = await getDatabase();
  const rooms = await db.all(
    `SELECT room_id FROM room_participants WHERE user_id = ?`,
    [userId]
  );

  // Get full room details for each room
  const roomDetails = await Promise.all(
    rooms.map((r) => getChatRoom(r.room_id))
  );
  return roomDetails;
}

async function saveMessage(message, roomId) {
  const db = await getDatabase();
  await db.run(
    `INSERT INTO messages (id, room_id, sender_id, content, timestamp) VALUES (?, ?, ?, ?, ?)`,
    [message.id, roomId, message.from, message.content, message.timestamp]
  );
}

async function getMessages(roomId, limit = 50) {
  const db = await getDatabase();
  const messages = await db.all(
    `SELECT id, sender_id as from, content, timestamp FROM messages 
     WHERE room_id = ? 
     ORDER BY timestamp DESC 
     LIMIT ?`,
    [roomId, limit]
  );

  // Enrich messages with sender details
  const enrichedMessages = await Promise.all(
    messages.map(async (message) => {
      const sender = await getUserFromAuth(message.from);
      return {
        ...message,
        sender,
      };
    })
  );

  return enrichedMessages ?? [];
}

async function deleteMessage(messageId) {
  const db = await getDatabase();
  await db.run(`DELETE FROM messages WHERE id = ?`, [messageId]);
}

async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
  }
}

module.exports = {
  initDatabase,
  getDatabase,
  getUser,
  getAllUsers,
  addFriend,
  removeFriend,
  createFriendRequest,
  getPendingFriendRequests,
  blockUser,
  unblockUser,
  getBlockedUsers,
  createChatRoom,
  getChatRoom,
  getUserChatRooms,
  saveMessage,
  getMessages,
  deleteMessage,
  closeDatabase,
};
