import { getDatabase } from "../db/initDB.js";
import { getUsersFromAuth } from "./userService.js";


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
