import db from "./db.js";
import axios from "axios";

// helper function to get the total played matches by a player
export async function getTotalMatchesForPlayer(playerId, matchType = null) {
    try {
        let query = `
            SELECT COUNT(*) as total
            FROM matches m
            JOIN match_players mp ON m.id = mp.match_id
            WHERE mp.player_id = ?
                AND m.status = 'completed'
        `;
        
        let params = [playerId];
        
        // Add match type filter if specified
        if (matchType) {
            query += ` AND m.match_type = ?`;
            params.push(matchType);
        }
        
        const rows = await db.query(query, params);
        return rows[0].total;
    } catch (error) {
        console.error('Error getting total matches:', error);
        throw error;
    }
}

// Function for getting the player's history
async function getPlayerHistory(playerId, limit = 10, offset = 0, matchType = null) {
    try {
        let query = `
            SELECT 
                m.id as match_id,
                m.match_type,
                m.winner_id,
                m.completed_at,
                m.started_at,
                
                -- Current player info
                mp_current.player_id as player_id,
                mp_current.goals as player_goals,
                mp_current.elo_before as player_elo_before,
                mp_current.elo_after as player_elo_after,
                
                -- Opponent info
                mp_opponent.player_id as opponent_id,
                mp_opponent.goals as opponent_goals,
                
                -- Determine outcome
                CASE 
                    WHEN m.winner_id = ? THEN 'win'
                    WHEN m.winner_id IS NULL THEN 'draw'
                    ELSE 'lose'
                END as outcome
                
            FROM matches m
            
            -- Join current player
            JOIN match_players mp_current ON m.id = mp_current.match_id 
                AND mp_current.player_id = ?
            
            -- Join opponent player  
            JOIN match_players mp_opponent ON m.id = mp_opponent.match_id 
                AND mp_opponent.player_id != ?
            
            WHERE m.status = 'completed'
                AND m.started_at IS NOT NULL
                AND m.completed_at IS NOT NULL
        `;

        let params = [playerId, playerId, playerId];

        // Add match type filter if specified
        if (matchType) {
            query += ` AND m.match_type = ?`;
            params.push(matchType);
        }

        query += ` ORDER BY m.completed_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const rows = await db.query(query, params);

        // Format the results
        const history = rows.map(row => {
            // Calculate duration in JavaScript
            const startTime = new Date(row.started_at).getTime();
            const endTime = new Date(row.completed_at).getTime();
            const durationSeconds = Math.floor((endTime - startTime) / 1000);

            return {
                matchId: row.match_id,
                opponent: {
                    id: row.opponent_id,
                    nickname: `Player ${row.opponent_id}`
                },
                result: `${row.player_goals} - ${row.opponent_goals}`,
                outcome: row.outcome,
                played: formatTimeAgo(row.completed_at),
                duration: formatDuration(durationSeconds),
                eloChange: row.player_elo_after - row.player_elo_before,
                matchType: row.match_type,
                completedAt: row.completed_at,
                startedAt: row.started_at
            };
        });

        return history;
    } catch (error) {
        console.error('Error getting player history:', error);
        throw error;
    }
}

// Helper method to format time ago
function formatTimeAgo(dateString) {
    const now = new Date();
    const completed = new Date(dateString);
    const diffInSeconds = Math.floor((now - completed) / 1000);

    if (diffInSeconds < 60) {
        return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
}

// Helper method to format duration
function formatDuration(durationInSeconds) {

    if (!durationInSeconds || durationInSeconds <= 0) {
        console.log('Returning N/A because duration is:', durationInSeconds);
        return 'N/A';
    }

    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;

    if (minutes > 0) {
        return `${minutes} min${minutes > 1 ? 's' : ''}`;
    } else {
        return `${seconds} sec${seconds > 1 ? 's' : ''}`;
    }
}

// method to get user's info
async function getUserInfo(userId) {
    try {
        const user = await axios.get(`http://127.0.0.1:8001/auth/users/id/${userId}`);
        return user.data;
    }
    catch (error) {
        console.error(`auth error: ${error.message}`);
        return [];
    }
}
// Method to get player history with opponent nicknames
export async function getPlayerHistoryWithNicknames(playerId, limit = 10, offset = 0, match_type = null) {
    try {
        // First get the basic history
        const history = await getPlayerHistory(playerId, limit, offset, match_type);

        // You'll need to implement db based on how you access your main users database
        // For example, if you have a method to get user info:
        for (let match of history) {
            try {
                // Replace db with your actual method to get user info
                const opponentInfo = await getUserInfo(match.opponent.id);
                if (opponentInfo) {
                    match.opponent.nickname = opponentInfo.nickname || opponentInfo.fullName || `Player ${match.opponent.id}`;
                }
            } catch (error) {
                console.warn(`Could not get nickname for player ${match.opponent.id}`);
            }
        }

        return history;
    } catch (error) {
        console.error('Error getting player history with nicknames:', error);
        throw error;
    }
}

export async function getPlayerStats(playerId) {
    try {
        // Overall stats query (existing)
        const overallQuery = `
      SELECT 
        COUNT(*) as total_matches,
        SUM(CASE WHEN winner_id = ? THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN winner_id != ? AND winner_id IS NOT NULL THEN 1 ELSE 0 END) as losses,
        SUM(CASE WHEN winner_id IS NULL THEN 1 ELSE 0 END) as draws,
        AVG(
          CASE 
            WHEN started_at IS NOT NULL AND completed_at IS NOT NULL 
            THEN CAST((strftime('%s', completed_at) - strftime('%s', started_at)) AS INTEGER)
            ELSE NULL 
          END
        ) as avg_duration_seconds,
        p.elo_score as current_elo
      FROM matches m
      JOIN match_players mp ON m.id = mp.match_id
      JOIN players p ON p.id = ?
      WHERE mp.player_id = ? 
        AND m.status = 'completed'
        AND m.match_type = '1v1'
    `;

        // Monthly stats query
        const monthlyQuery = `
      SELECT 
        strftime('%Y-%m', m.completed_at) as month,
        strftime('%m', m.completed_at) as month_number,
        SUM(CASE WHEN m.winner_id = ? THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN m.winner_id != ? AND m.winner_id IS NOT NULL THEN 1 ELSE 0 END) as losses
      FROM matches m
      JOIN match_players mp ON m.id = mp.match_id
      WHERE mp.player_id = ? 
        AND m.status = 'completed'
        AND m.match_type = '1v1'
        AND m.completed_at IS NOT NULL
        AND strftime('%Y', m.completed_at) = strftime('%Y', 'now')
      GROUP BY strftime('%Y-%m', m.completed_at)
      ORDER BY month
    `;

        // ELO progression query
        const eloProgressionQuery = `
      SELECT 
        strftime('%Y-%m', m.completed_at) as month,
        strftime('%m', m.completed_at) as month_number,
        mp.elo_after as elo_rating,
        m.completed_at
      FROM matches m
      JOIN match_players mp ON m.id = mp.match_id
      WHERE mp.player_id = ? 
        AND m.status = 'completed'
        AND m.match_type = '1v1'
        AND m.completed_at IS NOT NULL
        AND strftime('%Y', m.completed_at) = strftime('%Y', 'now')
      ORDER BY m.completed_at ASC
    `;

        // Execute all queries
        const [overallRows, monthlyRows, eloRows] = await Promise.all([
            db.query(overallQuery, [playerId, playerId, playerId, playerId]),
            db.query(monthlyQuery, [playerId, playerId, playerId]),
            db.query(eloProgressionQuery, [playerId])
        ]);

        const overallStats = overallRows[0];

        // Month setup
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const monthlyStats = monthNames.map((name, index) => ({
            month: name,
            monthNumber: (index + 1).toString().padStart(2, '0'),
            wins: 0,
            losses: 0,
            eloRating: null
        }));

        // Apply wins/losses
        monthlyRows.forEach(row => {
            const monthIndex = parseInt(row.month_number) - 1;
            if (monthIndex >= 0 && monthIndex < 12) {
                monthlyStats[monthIndex].wins = row.wins || 0;
                monthlyStats[monthIndex].losses = row.losses || 0;
            }
        });

        // Process ELO
        const monthlyElo = {};
        let currentElo = 1000;

        eloRows.forEach(row => {
            const monthKey = row.month_number;
            monthlyElo[monthKey] = row.elo_rating;
            currentElo = row.elo_rating;
        });

        let lastKnownElo = 1000;
        monthlyStats.forEach(month => {
            const monthKey = month.monthNumber;
            if (monthlyElo[monthKey]) {
                month.eloRating = monthlyElo[monthKey];
                lastKnownElo = monthlyElo[monthKey];
            } else {
                month.eloRating = lastKnownElo;
            }
        });

        // Calculate total wins/losses for pie
        const totalWins = overallStats.wins || 0;
        const totalLosses = overallStats.losses || 0;
        const totalGames = totalWins + totalLosses;

        // Get last 4 months (including current)
        const now = new Date();
        const currentMonthIndex = now.getMonth();
        const start = Math.max(0, currentMonthIndex - 3);
        const recentMonths = monthlyStats.slice(start, currentMonthIndex + 1);

        return {
            totalMatches: overallStats.total_matches || 0,
            wins: totalWins,
            losses: totalLosses,
            draws: overallStats.draws || 0,
            winRate: overallStats.total_matches > 0
                ? ((totalWins / overallStats.total_matches) * 100).toFixed(1)
                : '0.0',
            averageDuration: overallStats.avg_duration_seconds
                ? formatDuration(Math.floor(overallStats.avg_duration_seconds))
                : 'N/A',
            currentElo: overallStats.current_elo || 1000,

            monthlyStats: monthlyStats, // full year for reference

            chartData: {
                barChart: recentMonths.map(month => ({
                    month: month.month,
                    wins: month.wins,
                    losses: month.losses
                })),
                lineChart: recentMonths.map(month => ({
                    month: month.month,
                    eloRating: month.eloRating
                })),
                pieChart: [
                    {
                        label: 'Wins',
                        value: totalWins,
                        percentage: totalGames > 0
                            ? ((totalWins / totalGames) * 100).toFixed(1)
                            : '0.0'
                    },
                    {
                        label: 'Losses',
                        value: totalLosses,
                        percentage: totalGames > 0
                            ? ((totalLosses / totalGames) * 100).toFixed(1)
                            : '0.0'
                    }
                ]
            }
        };
    } catch (error) {
        console.error('Error getting player stats:', error);
        throw error;
    }
}