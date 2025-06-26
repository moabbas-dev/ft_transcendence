import { getDatabase } from "../db/initDB.js";
import axios from "axios";

/**
 * Fetches user information from the authentication service using user ID.
 *
 * @param {number|string} userId - The ID of the user to fetch.
 * @returns {Promise<object|null>} - The user data or null if not found.
*/
export async function getUserFromAuth(userId) {
  try {
    const response = await axios.get(`http://authentication:8001/auth/users/id/${userId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching user ${userId} from auth service:`,
      error.message
    );
    return null;
  }
}

/**
 * Fetches a user from the authentication service using their username (nickname).
 *
 * @param {string} username - The nickname/username of the user to look up.
 * @returns {Promise<object|null>} - The user data or null if not found.
*/
export async function getUserByUsername(username) {
  try {
    const response = await axios.get(`http://authentication:8001/auth/users/nickname/${username}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${username}:`, error.message);
    return null;
  }
}

/**
 * Fetches a list of users by their IDs from the authentication service.
 *
 * @param {Array<number>} userIds - List of user IDs to fetch.
 * @returns {Promise<Array<object>>} - List of user data.
*/
export async function getUsersFromAuth(userIds) {
  if (!userIds || userIds.length === 0) return [];

  try {
    const response = await axios.get(`http://authentication:8001/auth/users`);
    const allUsers = response.data;
    return allUsers.filter((user) => userIds.includes(user.id));
  } catch (error) {
    console.error("Error fetching users from auth service:", error.message);
    return [];
  }
}

/**
 * Retrieves a user by ID, along with their friends, pending friend requests, and blocked users.
 *
 * Combines data from the authentication service and local database.
 *
 * @param {number} userId - The ID of the user to fetch.
 * @returns {Promise<object|null>} - A full user profile with friends and blocked users.
*/
export async function getUser(userId) {
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

  const friendIds = friends.map((f) => f.friend_id);
  const friendDetails = await getUsersFromAuth(friendIds);

  const pendingIds = pendingRequests.map((p) => p.from_user);
  const pendingDetails = await getUsersFromAuth(pendingIds);

  const blockedIds = blockedUsers.map((b) => b.blocked_id);
  const blockedDetails = await getUsersFromAuth(blockedIds);

  return {
    ...user,
    friends: friendDetails,
    pendingFriends: pendingDetails,
    blockedUsers: blockedDetails,
  };
};

/**
 * Fetches all users from the authentication service.
 *
 * @returns {Promise<Array<object>>} - A list of all users.
*/
export async function getAllUsers() {
  try {
    const response = await axios.get(`http://authentication:8001/auth/users`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all users from auth service:", error.message);
    return [];
  }
};

/**
 * Retrieves a list of pending friend requests sent to the given user.
 *
 * @param {number} userId - The ID of the user receiving friend requests.
 * @returns {Promise<Array<object>>} - List of requests from other users.
*/
export async function getPendingFriendRequests(userId) {
  const db = await getDatabase();
  const requests = await db.all(
    `SELECT from_user FROM friend_requests WHERE to_user = ?`,
    [userId]
  );
  return requests;
};

export async function createOrUpdateUser(userData) {
  return userData;
}