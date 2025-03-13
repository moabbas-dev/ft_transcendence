const { getDatabase } = require("../db/initDB.js");
const { getUsersFromAuth } = require("./userService.js");

export async function addFriend(userId, friendId) {
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

export async function removeFriend(userId, friendId) {
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

export async function createFriendRequest(fromUser, toUser) {
  const db = await getDatabase();
  await db.run(
    `INSERT OR IGNORE INTO friend_requests (from_user, to_user) VALUES (?, ?)`,
    [fromUser, toUser]
  );
}

export async function getPendingFriendRequests(userId) {
  const db = await getDatabase();
  const requests = await db.all(
    `SELECT from_user FROM friend_requests WHERE to_user = ?`,
    [userId]
  );

  // Get user details for each request
  const requestIds = requests.map((r) => r.from_user);
  return await getUsersFromAuth(requestIds);
}
