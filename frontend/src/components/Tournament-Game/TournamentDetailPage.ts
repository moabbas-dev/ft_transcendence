import store from "../../../store/store";
import { t } from "../../languages/LanguageController";
import { fetchUserDetails, tournamentClient } from "../../main";
import { navigate } from "../../router";
import TournamentBrackets from "./TournamentBrackets";
import { TournamentClient } from "./TournamentClient";
import { showTournamentMatchNotification } from "./TournamentMatchNotification";
import { WaitingRoom } from "./WaitingRoom";

interface Player {
  player_id: string;
  nickname?: string;
  avatar_url?: string;
  joined_at?: string;
}

interface UserDetails {
  id: string;
  nickname?: string;
  avatar_url?: string;
}

export default {
  render: async (container: HTMLElement, params?: { [key: string]: string }) => {

    if (!params || !params.tournamentId) {
      console.error("Tournament ID is required");
      navigate("/play/tournaments");
      return;
    }

    const tournamentId = params.tournamentId;
    const userId = store.userId;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const client = tournamentClient || new TournamentClient(`${protocol}//${window.location.hostname}:${window.location.port}/matchmaking/`, userId as string);

    if (!tournamentClient) {
      await client.initialize().catch(err => {
        console.error("Failed to initialize tournament client:", err);
      });
    }

    container.className = "bg-ponghover w-full h-dvh flex flex-col items-center justify-center";
    container.innerHTML = `
      <div class="size-full flex flex-col gap-3 p-4 bg-gray-800 rounded-lg shadow-lg">
        <div class="flex justify-between items-center gap-2">
          <h1 id="tour-name" class="text-2xl font-bold text-white">Loading...</h1>
          <button id="back-button" class="px-4 py-2 bg-pongcyan text-white rounded hover:bg-blue-700">
            ${t('play.tournaments.backToTournaments')}
          </button>
        </div>
        
        <div id="tournament-content" class="flex-1 p-4 bg-gray-900 rounded-lg">
          <div class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pongcyan"></div>
            <p class="mt-2 text-gray-400">${t('play.tournaments.loading')}</p>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#back-button')?.addEventListener('click', () => navigate('/play/tournaments'));
    client.getTournamentDetails(tournamentId);

    client.on('tournament_details', async (data) => {
      container.querySelector('#tour-name')!.textContent = data.tournament.name;
      if ((data.tournament.id as string).toString() === tournamentId) {
        try {
          const userIds = data.players.map((p: any) => p.player_id);
          const userDetails = await fetchUserDetails(userIds);          
          const enrichedPlayers = data.players.map((player: Player) => {
            const userInfo = userDetails?.find((u: UserDetails) => u.id === player.player_id);
            return {
              ...player,
              nickname: userInfo?.nickname || `Player ${player.player_id}`,
              avatar_url: userInfo?.avatar_url
            };
          });

          data.players = enrichedPlayers;          
          console.log(enrichedPlayers);
          console.log(data.players); 
          if (data.tournament.status === 'registering') {
            showWaitingRoom(container, data, client, userId as string);
          } else if (data.tournament.status === 'in_progress') {
            showTournamentBrackets(container, data, client, userId as string);
          } else if (data.tournament.status === 'completed') {
            showTournamentResults(container, data, client, userId as string);
          }
        } catch (error) {
          console.error('Error processing tournament details:', error);
        }
      }
    });

    client.on('tournament_player_joined', (data) => {
      if (String(data.tournamentId) === String(tournamentId)) {
        client.getTournamentDetails(tournamentId);
      }
    });

    client.on('tournament_started', (data) => {
      if (String(data.tournamentId) === String(tournamentId)) {
        showTournamentBrackets(container, data, client, userId as string);
      } else {
        console.error("[TournamentDetails]: Ids don't match");
      }
    });

    client.on('tournament_match_starting', (data) => {
      if (String(data.tournamentId) === String(tournamentId)) {
        startTournamentMatch(container, data.matchId, {
          players: [
            {
              userId: userId,
              username: 'You',
              elo: 1000,
              avatar: undefined
            },
            {
              userId: data.opponent.id,
              username: data.opponent.username,
              elo: data.opponent.elo,
              avatar: data.opponent.avatar
            }
          ],
          tournamentName: container.querySelector('#tour-name')?.textContent || 'Tournament',
          round: 1
        }, userId as string, client);
      } else {
        console.error("[tournament_match_starting]: Ids don't match");
      }
    });

    client.on('tournament_match_completed', (data) => {
      if (String(data.tournamentId) === String(tournamentId)) {
        showTournamentBrackets(container, data, client, userId as string);
      } else {
        console.error("Ids don't match");
      }
    });

    client.on('tournament_completed', (data) => {
      if (String(data.tournamentId) === String(tournamentId)) {
        showTournamentResults(container, data, client, userId as string);
      } else {
        console.error("Ids don't match");
      }
    });

    client.on('tournament_match_notification', (data) => {
      if (String(data.tournamentId) === String(tournamentId)) {
        showTournamentMatchNotification({
          tournamentId: data.tournamentId,
          matchId: data.matchId,
          opponent: data.opponent,
          onAccept: (matchId) => {
            startTournamentMatch(container, matchId, {
              players: data.matchPlayers,
              tournamentName: "Tournament Match",
              round: data.round || 1
            }, userId as string, client);
          }
        });
      }
    });

    client.on('tournament_match_accepted', (data) => {
      console.log('Match accepted:', data);
    });

    client.on('tournament_opponent_accepted', (data) => {
      console.log('Opponent accepted:', data);
    });

    client.on('tournament_match_starting', (data) => {
      if (String(data.tournamentId) === String(tournamentId)) {
        console.log('Match starting:', data);
        
        startTournamentMatch(container, data.matchId, {
          players: [
            {
              userId: userId,
              username: 'You',
              elo: 1000,
              avatar: undefined
            },
            {
              userId: data.opponent.id,
              username: data.opponent.username,
              elo: data.opponent.elo,
              avatar: data.opponent.avatar
            }
          ],
          tournamentName: container.querySelector('#tour-name')?.textContent || 'Tournament',
          tournamentId: data.tournamentId,
          round: 1
        }, userId as string, client);
      } else {
        console.error("[tournament_match_starting 2]: Ids don't match");
      }
    });
  }
};

interface WaitingRoomPlayer {
  userId: string;
  username: string;
  avatar?: string;
  joinedAt?: string;
}

interface WaitingRoomData {
  tournamentId: string;
  playerCount: number;
  players: WaitingRoomPlayer[];
  isCreator: boolean;
  client: TournamentClient;
  onTournamentStart: () => void;
}

function showWaitingRoom(container: HTMLElement, data: { tournament: { id: string; player_count: number; creator_id: string }; players: Player[] }, client: TournamentClient, userId: string): void {
  const content = container.querySelector('#tournament-content');
  if (!content) return;

  const waitingRoomData: WaitingRoomData = {
    tournamentId: data.tournament.id,
    playerCount: data.tournament.player_count,
    players: data.players.map((p) => ({
      userId: p.player_id,
      username: p.nickname || `Player ${p.player_id}`,
      avatar: p.avatar_url,
      joinedAt: p.joined_at
    })),
    isCreator: data.tournament.creator_id === userId,
    client,
    onTournamentStart: () => {
      // Will be handled by tournament_started event
    }
  };

  content.innerHTML = '';
  content.appendChild(WaitingRoom(waitingRoomData));
}
function showTournamentBrackets(container: HTMLElement, data: any, client: TournamentClient, userId: string) {
  const content = container.querySelector('#tournament-content');
  if (!content) return;

  content.innerHTML = `
    <div class="tournament-brackets-container w-full h-full flex flex-col gap-2">
      <div class="flex justify-between items-center">
        <div>
          <div class="text-sm text-gray-400">
            ${data.tournament.player_count} ${t('play.tournaments.createTournament.players')} • 
            Status: ${data.tournament.status}
          </div>
        </div>
        <div class="text-sm text-gray-300">
          <i class="fas fa-trophy text-pongcyan mr-2"></i>
          Tournament in Progress
        </div>
      </div>
      
      <div id="brackets-display" class="flex-1 size-full overflow-auto bg-gray-900 rounded-lg">
        <!-- Brackets will be rendered here -->
      </div>
      
      <div class="p-4 bg-gray-800 rounded-lg">
        <div class="text-sm text-gray-300 text-center">
          <i class="fas fa-info-circle mr-2"></i>
          Click on a match to view details. Matches will become playable when it's your turn.
        </div>
      </div>
    </div>
  `;

  const bracketsDisplay = content.querySelector('#brackets-display');
  if (!bracketsDisplay) return;

  // Format the matches data for the TournamentBrackets component
  const formattedMatches = formatMatchesForBrackets(data);
  
  // Create and render the TournamentBrackets component
  const bracketsComponent = TournamentBrackets({
    playersCount: data.tournament.player_count,
    matches: formattedMatches,
    onMatchClick: (matchId: string) => {
      handleMatchClick(matchId, data, client, userId);
    }
  });

  bracketsDisplay.appendChild(bracketsComponent);
}

// Implement the formatMatchesForBrackets helper function
function formatMatchesForBrackets(tournamentData: any) {
  if (!tournamentData.matches || !Array.isArray(tournamentData.matches)) {
    return [];
  }

  return tournamentData.matches.map((match: any, index: number) => {
    // Get players for this match
    const matchPlayers = match.players || [];
    const player1Data = matchPlayers[0];
    const player2Data = matchPlayers[1];

    // Find player details from tournament players list
    const findPlayerDetails = (playerId: string) => {
      return tournamentData.players? tournamentData.players.find((p: any) => 
        String(p.player_id) === String(playerId) || String(p.id) === String(playerId)
      ) : null;
    };

    const player1Details = player1Data ? findPlayerDetails(player1Data.player_id) : null;
    const player2Details = player2Data ? findPlayerDetails(player2Data.player_id) : null;

    // Determine winner
    let winner = null;
    if (match.winner_id) {
      const winnerDetails = findPlayerDetails(match.winner_id);
      if (winnerDetails) {
        winner = {
          id: winnerDetails.player_id || winnerDetails.id,
          username: winnerDetails.nickname || `Player ${winnerDetails.player_id || winnerDetails.id}`
        };
      }
    }

    // Calculate round and position based on tournament structure
    const round = calculateRound(index, tournamentData.tournament.player_count);
    const position = calculatePosition(index, round, tournamentData.tournament.player_count);

    return {
      id: match.id,
      round: round,
      position: position,
      player1: player1Details ? {
        id: player1Details.player_id || player1Details.id,
        username: player1Details.nickname || `Player ${player1Details.player_id || player1Details.id}`,
        avatar: player1Details.avatar_url
      } : undefined,
      player2: player2Details ? {
        id: player2Details.player_id || player2Details.id,
        username: player2Details.nickname || `Player ${player2Details.player_id || player2Details.id}`,
        avatar: player2Details.avatar_url
      } : undefined,
      winner: winner,
      score1: player1Data?.goals || 0,
      score2: player2Data?.goals || 0,
      isCompleted: match.status === 'completed'
    };
  });
}

function calculateRound(matchIndex: number, playerCount: number): number {
  // For 4 players: Round 0 = semifinals (matches 0,1), Round 1 = final (match 2)
  // For 8 players: Round 0 = quarterfinals (matches 0-3), Round 1 = semifinals (matches 4,5), Round 2 = final (match 6)
  
  if (playerCount === 4) {
    return matchIndex < 2 ? 0 : 1;
  } else if (playerCount === 8) {
    if (matchIndex < 4) return 0; // Quarterfinals
    if (matchIndex < 6) return 1; // Semifinals
    return 2; // Final
  }
  
  return 0;
}

function calculatePosition(matchIndex: number, round: number, playerCount: number): number {
  if (playerCount === 4) {
    return round === 0 ? matchIndex : 0;
  } else if (playerCount === 8) {
    if (round === 0) return matchIndex;
    if (round === 1) return matchIndex - 4;
    return 0;
  }
  
  return 0;
}

function handleMatchClick(matchId: string, tournamentData: any, client: TournamentClient, userId: string) {
  const match = tournamentData.matches.find((m: any) => String(m.id) === String(matchId));
  
  if (!match) {
    console.error('Match not found:', matchId);
    return;
  }

  console.log("TOURNAMENT DATA: ", tournamentData);
  console.log("MATCH DATA: ", match);
  console.log("USER ID: ", userId);
  console.log("MATCH ID: ", matchId);

  const matchPlayers = match.players || [];
  const isPlayerInMatch = matchPlayers.some((p: any) => 
    String(p.player_id) === String(userId)
  );

  if (!isPlayerInMatch) {
    showMatchDetails(match, tournamentData);
    return;
  }

  if (match.status === 'completed') {
    showMatchDetails(match, tournamentData);
    return;
  }

  if (match.status === 'pending') {
    const opponent = matchPlayers.find((p: any) => String(p.player_id) !== String(userId));
    const opponentDetails = tournamentData.players.find((p: any) => 
      String(p.player_id) === String(opponent?.player_id)
    );

    if (opponentDetails) {
      showTournamentMatchNotification({
        tournamentId: tournamentData.tournament.id,
        matchId: match.id,
        opponent: {
          id: opponentDetails.player_id,
          username: opponentDetails.nickname || `Player ${opponentDetails.player_id}`,
          elo: opponent?.elo_before || 1000,
          avatar: opponentDetails.avatar_url
        },
        onAccept: (acceptedMatchId) => {
          client.send('tournament_match_accept', { matchId: acceptedMatchId });
        }
      });
    }
  }
}

function showMatchDetails(match: any, tournamentData: any) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  
  const matchPlayers = match.players || [];
  const player1 = matchPlayers[0];
  const player2 = matchPlayers[1];
  
  const player1Details = tournamentData.players.find((p: any) => 
    String(p.player_id) === String(player1?.player_id) || String(p.id) === String(player1?.player_id)
  );
  const player2Details = tournamentData.players.find((p: any) => 
    String(p.player_id) === String(player2?.player_id) || String(p.id) === String(player2?.player_id)
  );

  modal.innerHTML = `
    <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold text-white">Match Details</h3>
        <button class="close-modal text-gray-400 hover:text-white text-2xl">&times;</button>
      </div>
      
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <div class="text-center flex-1">
            <div class="text-white font-medium">
              ${player1Details?.nickname || `Player ${player1?.player_id || 'TBD'}`}
            </div>
            <div class="text-2xl font-bold text-pongcyan">
              ${player1?.goals || 0}
            </div>
          </div>
          
          <div class="px-4 text-gray-400">VS</div>
          
          <div class="text-center flex-1">
            <div class="text-white font-medium">
              ${player2Details?.nickname || `Player ${player2?.player_id || 'TBD'}`}
            </div>
            <div class="text-2xl font-bold text-pongcyan">
              ${player2?.goals || 0}
            </div>
          </div>
        </div>
        
        <div class="border-t border-gray-700 pt-4">
          <div class="text-sm text-gray-300">
            <div>Status: <span class="text-white">${match.status}</span></div>
            ${match.status === 'completed' ? 
              `<div>Winner: <span class="text-green-400">${
                match.winner_id ? 
                  (tournamentData.players.find((p: any) => String(p.player_id) === String(match.winner_id) || String(p.id) === String(match.winner_id))?.nickname || `Player ${match.winner_id}`) 
                  : 'TBD'
              }</span></div>` 
              : ''
            }
          </div>
        </div>
      </div>
    </div>
  `;

  // Add event listener to close modal
  modal.querySelector('.close-modal')?.addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });

  document.body.appendChild(modal);
}

// Add these imports at the top of TournamentDetailPage.ts
import { OnlineGameBoard } from "../Online-Game/components/OnlineGameBoard.js";
import { TournamentResult, renderResultsTab } from "./TournamentResults.js";
import { showTournamentMatchResult } from "./TournamentMatchResult.js";

// Implement showTournamentResults function
function showTournamentResults(container: HTMLElement, data: any, client: TournamentClient, userId: string) {
  const content = container.querySelector('#tournament-content');
  if (!content) return;

  // Clear the current content and show results
  content.innerHTML = `
    <div class="tournament-results-container w-full">
      <div class="flex justify-between items-center mb-6">
        <div>
          <div class="text-sm text-gray-400">
            ${data.tournament.player_count} ${t('play.tournaments.createTournament.players')} • 
            Tournament Completed
          </div>
        </div>
        <div class="text-sm text-green-400">
          <i class="fas fa-trophy text-yellow-400 mr-2"></i>
          Tournament Finished
        </div>
      </div>
      
      <div id="results-content" class="w-full">
        <!-- Results will be rendered here -->
      </div>
      
      <div class="mt-6 flex justify-center gap-4">
        <button id="back-to-tournaments" class="px-6 py-3 bg-pongcyan text-white rounded-lg hover:bg-blue-700 transition-colors">
          <i class="fas fa-arrow-left mr-2"></i>
          ${t('play.tournaments.backToTournaments')}
        </button>
        <button id="view-brackets" class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
          <i class="fas fa-bracket mr-2"></i>
          View Final Brackets
        </button>
      </div>
    </div>
  `;

  // Format results from tournament data
  const results: TournamentResult[] = formatTournamentResults(data);
  
  // Render the results using the existing component
  renderResultsTab(content as HTMLElement, results);

  // Add event listeners for buttons
  const backButton = content.querySelector('#back-to-tournaments');
  if (backButton) {
    backButton.addEventListener('click', () => {
      navigate('/play/tournaments');
    });
  }

  const bracketsButton = content.querySelector('#view-brackets');
  if (bracketsButton) {
    bracketsButton.addEventListener('click', () => {
      showTournamentBrackets(container, data, client, userId as string);
    });
  }
}

// Helper function to format tournament results
function formatTournamentResults(tournamentData: any): TournamentResult[] {
  if (!tournamentData.players || !Array.isArray(tournamentData.players)) {
    return [];
  }

  // Calculate scores for each player based on their match performance
  const playerStats = new Map();

  // Initialize player stats
  tournamentData.players.forEach((player: any) => {
    const playerId = player.player_id || player.id;
    playerStats.set(playerId, {
      player: player,
      wins: 0,
      losses: 0,
      totalGoals: 0,
      goalsAgainst: 0,
      matches: 0
    });
  });

  // Process matches to calculate stats
  if (tournamentData.matches) {
    tournamentData.matches.forEach((match: any) => {
      if (match.status === 'completed' && match.players && match.players.length === 2) {
        const player1 = match.players[0];
        const player2 = match.players[1];
        
        const player1Id = player1.player_id;
        const player2Id = player2.player_id;
        
        const player1Goals = player1.goals || 0;
        const player2Goals = player2.goals || 0;
        
        const stats1 = playerStats.get(player1Id);
        const stats2 = playerStats.get(player2Id);
        
        if (stats1) {
          stats1.totalGoals += player1Goals;
          stats1.goalsAgainst += player2Goals;
          stats1.matches++;
          if (player1Goals > player2Goals) stats1.wins++;
          else stats1.losses++;
        }
        
        if (stats2) {
          stats2.totalGoals += player2Goals;
          stats2.goalsAgainst += player1Goals;
          stats2.matches++;
          if (player2Goals > player1Goals) stats2.wins++;
          else stats2.losses++;
        }
      }
    });
  }

  // Convert to results array and sort by performance
  const results = Array.from(playerStats.values()).map((stats: any) => {
    const player = stats.player;
    
    // Calculate score (wins * 3 + draws * 1 + goal difference)
    const goalDifference = stats.totalGoals - stats.goalsAgainst;
    const score = (stats.wins * 3) + goalDifference;
    
    return {
      userId: player.player_id || player.id,
      username: player.nickname || `Player ${player.player_id || player.id}`,
      avatarUrl: player.avatar_url,
      place: 0, // Will be assigned after sorting
      score: score
    };
  });

  // Sort by score (descending) and assign places
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // If scores are equal, sort by username for consistency
    return a.username.localeCompare(b.username);
  });

  // Assign places
  results.forEach((result, index) => {
    result.place = index + 1;
  });

  return results;
}

function startTournamentMatch(container: HTMLElement, matchId: string, matchData: any, userId: string, client: TournamentClient) {
  const content = container.querySelector('#tournament-content');
  if (!content) {
    console.log("Tournament DOM Content not found");
    return;
  }

  // Get opponent info
  const currentPlayer = matchData.players.find((p: any) => String(p.userId) === String(userId));
  const opponent = matchData.players.find((p: any) => String(p.userId) !== String(userId));
  
  if (!opponent) {
    console.error('Could not find opponent for match');
    return;
  }

  const isPlayer1 = matchData.players.indexOf(currentPlayer) === 0;

  // Store original tournament view to restore later
  const originalContent = content.innerHTML;

  // Clear content and create match interface
  content.innerHTML = `
    <div class="tournament-match-container w-full h-full flex flex-col">
      <div class="match-header flex justify-between items-center p-4 bg-gray-800 mb-4 rounded-lg">
        <div class="flex items-center gap-4">
          <button id="back-to-tournament" class="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
            <i class="fas fa-arrow-left mr-2"></i>
            Back to Tournament
          </button>
          <div class="text-xl text-white font-bold">
            <i class="fas fa-trophy text-yellow-400 mr-2"></i>
            Tournament Match
          </div>
          <div class="text-pongcyan">
            ${matchData.tournamentName || 'Tournament'} • Round ${matchData.round || 1}
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex flex-col items-end">
            <div class="text-lg text-white">
              <span id="player-score1">0</span> - <span id="player-score2">0</span>
            </div>
            <div class="text-sm text-gray-300">
              vs ${opponent.username}
            </div>
          </div>
          ${opponent.avatar ? 
            `<div class="size-12 rounded-full overflow-hidden border-2 border-pongcyan">
               <img src="${opponent.avatar}" alt="${opponent.username}" class="size-full object-cover">
             </div>` :
            `<div class="size-12 rounded-full bg-pongcyan flex items-center justify-center text-white font-bold text-lg border-2 border-pongcyan">
               ${opponent.username.charAt(0).toUpperCase()}
             </div>`
          }
        </div>
      </div>
      
      <div class="game-container flex-1 flex items-center justify-center bg-gray-900 rounded-lg p-4">
        <canvas id="tournament-game-canvas" class="bg-black rounded-lg shadow-lg"></canvas>
      </div>
      
      <div class="match-footer p-4 bg-gray-800 rounded-lg mt-4">
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-300">
            <i class="fas fa-info-circle mr-2"></i>
            Use W/S keys or touch controls to move your paddle
          </div>
          <button id="forfeit-match" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
            <i class="fas fa-flag mr-2"></i>
            Forfeit Match
          </button>
        </div>
      </div>
    </div>
  `;

  // Back to tournament button
  const backButton = content.querySelector('#back-to-tournament');
  if (backButton) {
    backButton.addEventListener('click', () => {
      if (confirm('Are you sure you want to leave the match? This will count as a forfeit.')) {
        // Send forfeit and return to tournament view
        client.completeMatch(matchId, opponent.userId, {
          player1: 0,
          player2: 10
        });
        
        // Restore tournament view
        client.getTournamentDetails(matchData.tournamentId);
      }
    });
  }

  // Set up canvas and game
  const canvas = content.querySelector('#tournament-game-canvas') as HTMLCanvasElement;
  const matchHeader = content.querySelector('.match-header') as HTMLElement;
  
  if (!canvas || !matchHeader) {
    console.error('Could not find canvas or match header');
    return;
  }

  // Set canvas size
  canvas.width = 800;
  canvas.height = 600;
  
  // Responsive canvas
  const resizeCanvas = () => {
    const gameContainer = content.querySelector('.game-container') as HTMLElement;
    if (!gameContainer) return;
    
    const containerWidth = gameContainer.clientWidth - 32;
    const containerHeight = gameContainer.clientHeight - 32;
    const aspectRatio = 600 / 800;
    
    let width = Math.min(800, containerWidth);
    let height = width * aspectRatio;
    
    // Make sure it fits in height too
    if (height > containerHeight) {
      height = containerHeight;
      width = height / aspectRatio;
    }
    
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  };
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Set up forfeit button
  const forfeitButton = content.querySelector('#forfeit-match');
  if (forfeitButton) {
    forfeitButton.addEventListener('click', () => {
      if (confirm('Are you sure you want to forfeit this match? This will count as a loss.')) {
        client.completeMatch(matchId, opponent.userId, {
          player1: 0,
          player2: 10
        });
      }
    });
  }

  // Initialize the OnlineGameBoard
  const gameBoard = new OnlineGameBoard(
    canvas,
    matchHeader,
    client,
    matchId,
    userId,
    opponent.userId,
    isPlayer1
  );

  // Handle game end event
  const handleGameResult = (data: any) => {
    if (String(data.matchId) === String(matchId)) {
      // Clean up
      client.off('game_result', handleGameResult);
      window.removeEventListener('resize', resizeCanvas);
      
      // Show match result
      showTournamentMatchResult({
        matchId: matchId,
        tournamentId: matchData.tournamentId || '',
        isWinner: String(data.winner) === String(userId),
        playerScore: isPlayer1 ? data.finalScore.player1 : data.finalScore.player2,
        opponentScore: isPlayer1 ? data.finalScore.player2 : data.finalScore.player1,
        eloChange: data.eloChanges[userId] || 0,
        opponent: {
          id: opponent.userId,
          username: opponent.username,
          avatar: opponent.avatar
        },
        onContinue: () => {
          // Return to tournament brackets view
          client.getTournamentDetails(matchData.tournamentId);
        }
      });
    }
  };

  client.on('game_result', handleGameResult);

  // Start the game
  gameBoard.startGame();
}

function calculateRoundFromMatchId(matchId: string, tournamentData: any): number {
  if (!tournamentData?.matches) return 1;
  
  const matchIndex = tournamentData.matches.findIndex((m: any) => String(m.id) === String(matchId));
  if (matchIndex === -1) return 1;
  
  return calculateRound(matchIndex, tournamentData.tournament?.player_count || 4) + 1;
}