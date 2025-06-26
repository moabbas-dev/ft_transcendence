import { getDatabase } from "../db/initDB.js";

/**
 * Updates the status of a game invite in the database.
 *
 * This function locates the game invite message using the inviteId stored in `extra_data`
 * and updates its `status` field (e.g., to "accepted", "declined", or "expired").
 *
 * @param {string} inviteId - The unique ID of the game invite.
 * @param {string} status - The new status to assign to the invite.
 * @returns {Promise<object>} - The result of the database update operation.
 */
export async function updateGameInviteStatus(inviteId, status) {
  const db = await getDatabase();

  try {
    const stmt = await db.prepare(`
        UPDATE messages 
        SET extra_data = json_set(extra_data, '$.status', ?)
        WHERE json_extract(extra_data, '$.inviteId') = ? AND message_type = 'game_invite'
      `);

    const result = await stmt.run(status, inviteId);
    await stmt.finalize();

    if (result.changes === 0) {
      console.warn(`Game invite with ID ${inviteId} not found or status not updated.`);
    }

    console.log(`Updated game invite ${inviteId} status to ${status}`);
    return result;
  } catch (error) {
    console.error("Error updating game invite status:", error);
    throw error;
  }
}

/**
 * Retrieves a game invite message from the database by its inviteId.
 *
 * Searches for a message with type 'game_invite' and extracts its structured `extra_data`.
 *
 * @param {string} inviteId - The ID of the game invite to fetch.
 * @returns {Promise<object|null>} - The invite message object including parsed `gameInviteData`, or null if not found.
 */
export async function getGameInviteById(inviteId) {
  const db = await getDatabase();

  try {
    const stmt = await db.prepare(`
        SELECT id, room_id, sender_id, receiver_id, content, timestamp, read_status, message_type, extra_data 
        FROM messages 
        WHERE json_extract(extra_data, '$.inviteId') = ? AND message_type = 'game_invite'
      `);

    const invite = await stmt.get(inviteId);
    await stmt.finalize();

    if (invite && typeof invite.extra_data === 'string') {
      invite.gameInviteData = JSON.parse(invite.extra_data);
    }
    return invite;
  } catch (error) {
    console.error("Error fetching game invite:", error);
    throw error;
  }
}

/**
 * Expires old pending game invites that are older than 5 minutes.
 *
 * This function runs periodically to clean up old pending invites by setting their status to "expired".
 *
 * @returns {Promise<number>} - The number of invites marked as expired.
 */
export async function expireOldGameInvites() {
  const db = await getDatabase();
  const expirationTime = 5 * 60 * 1000; // 5 minutes in milliseconds
  const cutoffTime = Date.now() - expirationTime;

  try {
    const stmt = await db.prepare(`
        UPDATE messages 
        SET extra_data = json_set(extra_data, '$.status', 'expired')
        WHERE message_type = 'game_invite' 
          AND json_extract(extra_data, '$.status') = 'pending'
          AND timestamp < ?
      `);

    const result = await stmt.run(cutoffTime);
    await stmt.finalize();

    if (result.changes > 0) {
      console.log(`Expired ${result.changes} old game invites`);
    }

    return result.changes;
  } catch (error) {
    console.error("Error expiring old game invites:", error);
    throw error;
  }
}