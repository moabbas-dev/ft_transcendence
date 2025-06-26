import { getDatabase } from "../db/initDB.js";
import { getUsersFromAuth } from "./userService.js";

/**
 * Create a friend request between two users
 * @param {number} fromUser - The ID of the user sending the request
 * @param {number} toUser - The ID of the user receiving the request
 * @returns {Promise<boolean>} - Returns true if the request was created successfully
 */
export async function createFriendRequest(fromUser, toUser) {
  const db = await getDatabase();
  
  try {
    const existingRequest = await db.get(
      `SELECT 1 FROM friend_requests 
       WHERE (from_user = ? AND to_user = ?) 
       OR (from_user = ? AND to_user = ?)`,
      [fromUser, toUser, toUser, fromUser]
    );

    const existingFriendship = await db.get(
      `SELECT 1 FROM friends 
       WHERE (user_id = ? AND friend_id = ?) 
       OR (user_id = ? AND friend_id = ?)`,
      [fromUser, toUser, toUser, fromUser]
    );

    if (existingFriendship) {
      throw new Error('Users are already friends');
    }

    if (existingRequest) {
      throw new Error('Friend request already exists');
    }

    await db.run(
      `INSERT INTO friend_requests (from_user, to_user) VALUES (?, ?)`,
      [fromUser, toUser]
    );

    return true;
  } catch (error) {
    console.error('Error creating friend request:', error);
    throw error;
  }
}

/**
 * Cancel a sent friend request
 * @param {number} fromUserId - The ID of the user canceling the request
 * @param {number} toUserId - The ID of the user receiving the request
 * @returns {Promise<boolean>} - Returns true if the request was canceled successfully
 */
export async function cancelFriendRequest(fromUserId, toUserId) {
  const db = await getDatabase();
  
  try {
    await db.run(
      `DELETE FROM friend_requests 
       WHERE from_user = ? AND to_user = ?`,
      [fromUserId, toUserId]
    );
    return true;
  } catch (error) {
    console.error('Error canceling friend request:', error);
    throw error;
  }
}

/**
 * Add a friend connection between two users
 * @param {number} userId - The ID of the first user
 * @param {number} friendId - The ID of the second user
 * @returns {Promise<boolean>} - Returns true if the friendship was added successfully
 */
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
    return true;
  } catch (error) {
    await db.run("ROLLBACK");
    console.error('Error adding friend:', error);
    throw error;
  }
}

/**
 * Remove friendship between two users
 * @param {number} userId - The ID of the first user
 * @param {number} friendId - The ID of the friend to remove
 * @returns {Promise<boolean>} - Returns true if the friendship was removed successfully
 */
export async function removeFriend(userId, friendId) {
  const db = await getDatabase();
  
  try {
    await db.run(
      `DELETE FROM friends 
       WHERE (user_id = ? AND friend_id = ?) 
       OR (user_id = ? AND friend_id = ?)`,
      [userId, friendId, friendId, userId]
    );
    
    return true;
  } catch (error) {
    console.error('Error removing friend:', error);
    throw error;
  }
}

/**
 * Get the friendship status between two users
 * @param {number} userId - The ID of the first user
 * @param {number} friendId - The ID of the second user
 * @returns {Promise<Object>} - Returns an object with friendship status
 */
export async function getFriendshipStatus(userId, friendId) {
  const db = await getDatabase();

  userId   = Number(userId);
  friendId = Number(friendId);
  
  const isFriend = await db.get(
    `SELECT 1 FROM friends 
     WHERE (user_id = ? AND friend_id = ?)
        OR (user_id = ? AND friend_id = ?)`,
    [userId, friendId, friendId, userId]
  );

  if (isFriend) {
    return { 
      status: 'friends',
      relationship: 'mutual'
    };
  }

  const request = await db.get(
    `SELECT from_user, to_user FROM friend_requests 
     WHERE (from_user = ? AND to_user = ?)
        OR (from_user = ? AND to_user = ?)`,
    [userId, friendId, friendId, userId]
  );
  console.log(request, "userId:", userId, "friendId:", friendId);
  if (request) {
    return {
      status: 'pending',
      initiator: request.from_user === userId ? 'current_user' : 'other_user',
      direction: request.from_user === userId ? 'outgoing' : 'incoming'
    };
  }

  return { status: 'none' };
}

/**
 * Get all pending friend requests for a user
 * @param {number} userId - The ID of the user
 * @returns {Promise<Array>} - Returns an array of pending friend requests
 */
export async function getPendingFriendRequests(userId) {
  const db = await getDatabase();
  const requests = await db.all(
    `SELECT from_user FROM friend_requests WHERE to_user = ?`,
    [userId]
  );

  const requestIds = requests.map((r) => r.from_user);
  return await getUsersFromAuth(requestIds);
}
