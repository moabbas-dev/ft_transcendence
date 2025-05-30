import { getDatabase } from "../db/initDB.js";

export async function updateGameInviteStatus(inviteId, status) {
    const db = await getDatabase(); // Ensure you await the database connection
    
    try {
      // Prepare the statement
      const stmt = await db.prepare(`
        UPDATE messages 
        SET extra_data = json_set(extra_data, '$.status', ?)
        WHERE json_extract(extra_data, '$.inviteId') = ? AND message_type = 'game_invite'
      `);
      
      // Execute the statement and get the result
      const result = await stmt.run(status, inviteId);
      await stmt.finalize(); // Finalize the statement
      
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
  
  export async function getGameInviteById(inviteId) {
    const db = await getDatabase(); // Ensure you await the database connection
    
    try {
      // Prepare the statement
      const stmt = await db.prepare(`
        SELECT id, room_id, sender_id, receiver_id, content, timestamp, read_status, message_type, extra_data 
        FROM messages 
        WHERE json_extract(extra_data, '$.inviteId') = ? AND message_type = 'game_invite'
      `);
      
      // Execute the statement and get the invite
      const invite = await stmt.get(inviteId);
      await stmt.finalize(); // Finalize the statement

      if (invite && typeof invite.extra_data === 'string') {
        invite.gameInviteData = JSON.parse(invite.extra_data);
      }
      return invite;
    } catch (error) {
      console.error("Error fetching game invite:", error);
      throw error;
    }
  }
  
  export async function expireOldGameInvites() {
    const db = await getDatabase(); // Ensure you await the database connection
    const expirationTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    const cutoffTime = Date.now() - expirationTime;
    
    try {
      // Prepare the statement
      const stmt = await db.prepare(`
        UPDATE messages 
        SET extra_data = json_set(extra_data, '$.status', 'expired')
        WHERE message_type = 'game_invite' 
          AND json_extract(extra_data, '$.status') = 'pending'
          AND timestamp < ?
      `);
      
      // Execute the statement and get the result
      const result = await stmt.run(cutoffTime);
      await stmt.finalize(); // Finalize the statement
      
      if (result.changes > 0) {
        console.log(`Expired ${result.changes} old game invites`);
      }
      
      return result.changes;
    } catch (error) {
      console.error("Error expiring old game invites:", error);
      throw error;
    }
  }