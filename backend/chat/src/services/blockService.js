import { getDatabase } from "../db/initDB.js";
import { getUsersFromAuth } from "./userService.js";

/**
 * Block a user by adding them to the blocked_users table
 * @param {number} userId - The ID of the user performing the block
 * @param {number} blockedId - The ID of the user being blocked
 * @returns {Promise<void>}
 */
export async function blockUser(userId, blockedId) {
  const db = await getDatabase();
  await db.run(
    `INSERT OR IGNORE INTO blocked_users (user_id, blocked_id) VALUES (?, ?)`,
    [userId, blockedId]
  );
}

/**
 * Unblock a user by removing them from the blocked_users table
 * @param {number} userId - The ID of the user performing the unblock
 * @param {number} blockedId - The ID of the user being unblocked
 * @returns {Promise<void>}
 */
export async function unblockUser(userId, blockedId) {
  const db = await getDatabase();
  await db.run(
    `DELETE FROM blocked_users WHERE user_id = ? AND blocked_id = ?`,
    [userId, blockedId]
  );
}

/**
 * Get a list of users blocked by a specific user
 * @param {number} userId - The ID of the user whose blocked list is being retrieved
 * @returns {Promise<Array>} - Returns an array of blocked user details
 */
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
