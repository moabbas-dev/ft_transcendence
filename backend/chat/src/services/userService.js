import { getDatabase } from "../db/initDB.js";
import axios from "axios";


// Configure authentication service API URL
const AUTH_API_URL = "http://localhost:8001";

// Helper function to get user from auth service API
export async function getUserFromAuth(userId) {
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

export async function getUserByUsername(username) {
  try {
    const response = await axios.get(`${AUTH_API_URL}/auth/users/username/${username}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${username}:`, error.message);
    return null;
  }
}

// Get multiple users from auth service API
export async function getUsersFromAuth(userIds) {
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

export async function getAllUsers() {
  try {
    const response = await axios.get(`${AUTH_API_URL}/auth/users`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all users from auth service:", error.message);
    return [];
  }
}

export async function getPendingFriendRequests(userId) {
  const db = await getDatabase();
  const requests = await db.all(
    `SELECT from_user FROM friend_requests WHERE to_user = ?`,
    [userId]
  );
  return requests;
}

export async function createOrUpdateUser(userData) {
  // This is a placeholder since user creation is handled by auth service
  // We might add local caching or other functionality here if needed
  return userData;
}