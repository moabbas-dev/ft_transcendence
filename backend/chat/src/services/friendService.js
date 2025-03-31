import { getDatabase } from "../db/initDB.js";
import { getUsersFromAuth } from "./userService.js";


export async function createFriendRequest(fromUser, toUser) {
  const db = await getDatabase();
  
  try {
    // First, check if a request already exists in either direction
    const existingRequest = await db.get(
      `SELECT 1 FROM friend_requests 
       WHERE (from_user = ? AND to_user = ?) 
       OR (from_user = ? AND to_user = ?)`,
      [fromUser, toUser, toUser, fromUser]
    );

    // Check if they are already friends
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

    // Insert the friend request
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
 * @returns {Promise<void>}
 */
export async function removeFriend(userId, friendId) {
  const db = await getDatabase();
  
  try {
    // Remove friendship in both directions
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




/////////////////////////////////////////////////////////////
//                                                         //
//                      👈(⌒▽⌒)👉                       //
//                                                         //
/////////////////////////////////////////////////////////////
export async function getFriendshipStatus(userId, friendId) {
  const db = await getDatabase();
  
  // First check if they are friends
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

  // Check for pending requests
  const request = await db.get(
    `SELECT from_user, to_user FROM friend_requests 
     WHERE (from_user = ? AND to_user = ?)
        OR (from_user = ? AND to_user = ?)`,
    [userId, friendId, friendId, userId]
  );

  if (request) {
    return {
      status: 'pending',
      initiator: request.from_user === userId ? 'current_user' : 'other_user',
      direction: request.from_user === userId ? 'outgoing' : 'incoming'
    };
  }

  // No relationship
  return { status: 'none' };
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
