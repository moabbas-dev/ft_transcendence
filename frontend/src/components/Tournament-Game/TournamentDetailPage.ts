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


export default {
  render: async (container: HTMLElement, params?: { [key: string]: string }) => {

    if (!params || !params.tournamentId) {
      console.error("Tournament ID is required");
      navigate("/play/tournaments");
      return;
    }

    const tournamentId = params.tournamentId;
    const userId = store.userId;

    if (!/^\d+$/.test(tournamentId)) {
      console.error("Invalid tournament ID format");
      navigate("/404");
      return;
    }
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const client = tournamentClient || new TournamentClient(`${protocol}//${window.location.hostname}:${window.location.port}/matchmaking/`, userId as string);

    if (!tournamentClient) {
      await client.initialize().catch(err => {
        console.error("Failed to initialize tournament client:", err);
      });
    }

    container.className = "bg-ponghover w-full h-dvh flex flex-col items-center justify-center";
    container.innerHTML = `
      <div class="size-full flex flex-col gap-3 p-4 bg-black rounded-lg shadow-lg">
        <div class="flex justify-between items-center gap-2">
          <h1 id="tour-name" class="text-2xl font-bold text-white drop-shadow-pongcyan">Loading...</h1>
          <button id="back-button" class="px-4 py-2 bg-pongcyan text-white rounded drop-shadow-pongcyan transition-all hover:bg-cyan-700">
            ${t('play.tournaments.backToTournaments')}
          </button>
        </div>
        
        <div id="tournament-content" class="h-[calc(100%-20%)] flex-1 p-4 bg-gray-900 rounded-lg">
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
      const tourNameElement = container.querySelector('#tour-name');
      if (tourNameElement) {
        tourNameElement.textContent = data.tournament.name;
      }
      if ((data.tournament.id as string).toString() === tournamentId) {
        try {
          const userIds = data.players.map((p: any) => p.player_id);
          const userDetails = await fetchUserDetails(userIds);          
          const enrichedPlayers = data.players.map((player: Player) => {
            const userInfo = userDetails?.find((u: UserDetails) => u.id === player.player_id);
            return {
              ...player,
              nickname: userInfo?.nickname || `${t("play.player")} ${player.player_id}`,
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

    client.on('tournament_match_notification', (data) => {
      if (String(data.tournamentId) === String(tournamentId)) {
        showTournamentMatchNotification({
          matchId: data.matchId,
          opponent: data.opponent,
          onAccept: (matchId) => client.send('tournament_match_accept', { matchId })
        });
      }
    });

    client.on('tournament_opponent_accepted', (data) => {
      console.log('Opponent accepted event received:', data);
      if (!data.tournamentId || String(data.tournamentId) === String(tournamentId)) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 animate-fade-in';
        notification.innerHTML = `
          <div class="flex items-center gap-3">
            <i class="fas fa-check-circle text-xl"></i>
            <div>
              <div class="font-semibold">Opponent Ready!</div>
              <div class="text-sm opacity-90">Your opponent accepted the match</div>
            </div>
          </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
          if (document.body.contains(notification)) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
              if (document.body.contains(notification)) {
                document.body.removeChild(notification);
              }
            }, 300);
          }
        }, 4000);
      }
    });
    
    client.on('tournament_match_accepted', (data) => {
      if (!data.tournamentId || String(data.tournamentId) === String(tournamentId)) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-pongcyan text-white p-4 rounded-lg shadow-lg z-50';
        notification.innerHTML = `
          <div class="flex items-center gap-2">
            <i class="fas fa-clock"></i>
            <span>Match accepted! Waiting for opponent...</span>
          </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 3000);
      }
    });

    client.on('tournament_match_starting', (data) => {
      console.log('Tournament match starting event received:', data);
      if (String(data.tournamentId) === String(tournamentId)) {
        document.querySelectorAll('.fixed.top-4.right-4').forEach(el => el.remove());
        navigate(`/tournaments/${tournamentId}/match/${data.matchId}`, {
          state: {
            matchId: data.matchId,
            tournamentId: data.tournamentId,
            opponent: data.opponent,
            isPlayer1: data.isPlayer1,
            client: client
          }
        });
      }
    });

    client.on('tournament_match_completed', (data) => {
      if (String(data.tournamentId) === String(tournamentId)) {
        console.log('Tournament match completed, refreshing details...');
        client.getTournamentDetails(tournamentId);
        
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 animate-fade-in';
        notification.innerHTML = `
          <div class="flex items-center gap-3">
            <i class="fas fa-check-circle text-xl"></i>
            <div>
              <div class="font-semibold">Match Completed!</div>
              <div class="text-sm opacity-90">Brackets updated</div>
            </div>
          </div>
        `;
        const app = document.getElementById("app")!;
        app.appendChild(notification);
        setTimeout(() => {
          if (app.contains(notification)) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
              if (app.contains(notification)) {
                app.removeChild(notification);
              }
            }, 300);
          }
        }, 4000);
      }
    });

    client.on('tournament_not_found', (error) => {
      console.error('Tournament error received:', error);
      
      if (error.message && (
        error.message.includes('Tournament not found') || 
        error.message.includes('Error getting tournament details')
      )) {
        navigate('/play/tournaments');
        Toast.show("Tournament not found", "error");
      }
    });
  }
};

function showWaitingRoom(container: HTMLElement, data: { tournament: { id: string; player_count: number; creator_id: string }; players: Player[] }, client: TournamentClient, userId: string): void {
  const content = container.querySelector('#tournament-content');
  if (!content) return;

  const waitingRoomData: WaitingRoomData = {
    tournamentId: data.tournament.id,
    playerCount: data.tournament.player_count,
    players: data.players.map((p) => ({
      userId: p.player_id,
      username: p.nickname || `${t("play.player")} ${p.player_id}`,
      avatar: p.avatar_url,
      joinedAt: p.joined_at
    })),
    isCreator: data.tournament.creator_id === userId,
    client,
    onTournamentStart: () => {
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
            ${t("play.tournaments.inTournament.status")}: ${data.tournament.status === "in_progress" ? t("play.tournaments.inTournament.tournamentInProgress") : t("play.tournaments.TournamentResults.tournamentCompleted")}
          </div>
        </div>
        <div class="text-sm text-gray-300">
          <i class="fas fa-trophy text-pongcyan mr-2"></i>
          ${t("play.tournaments.inTournament.tournamentInProgress")}
        </div>
      </div>
      
      <div id="brackets-display" class="flex-1 size-full overflow-auto bg-gray-900 rounded-lg">
        <!-- Brackets will be rendered here -->
      </div>
      
      <div class="p-4 bg-gray-800 rounded-lg">
        <div class="text-sm text-gray-300 text-center">
          <i class="fas fa-info-circle mr-2"></i>
          ${t('play.tournaments.inTournament.clickToViewMatch')}
        </div>
      </div>
    </div>
  `;

  const bracketsDisplay = content.querySelector('#brackets-display');
  if (!bracketsDisplay) return;

  const formattedMatches = formatMatchesForBrackets(data);
  
  const bracketsComponent = TournamentBrackets({
    playersCount: data.tournament.player_count,
    matches: formattedMatches,
    onMatchClick: (matchId: string) => {
      handleMatchClick(matchId, data, client, userId);
    }
  });

  bracketsDisplay.appendChild(bracketsComponent);
}

function formatMatchesForBrackets(tournamentData: any) {
  if (!tournamentData.matches || !Array.isArray(tournamentData.matches)) {
    return [];
  }

  return tournamentData.matches.map((match: any, index: number) => {
    const matchPlayers = match.players || [];
    const player1Data = matchPlayers[0];
    const player2Data = matchPlayers[1];    

    const findPlayerDetails = (playerId: string) => {
      return tournamentData.players? tournamentData.players.find((p: any) => 
        String(p.player_id) === String(playerId) || String(p.id) === String(playerId)
      ) : null;
    };

    const player1Details = player1Data ? findPlayerDetails(player1Data.player_id) : null;
    const player2Details = player2Data ? findPlayerDetails(player2Data.player_id) : null;

    let winner = null;
    if (match.winner_id) {
      const winnerDetails = findPlayerDetails(match.winner_id);
      if (winnerDetails) {
        winner = {
          id: winnerDetails.player_id || winnerDetails.id,
          username: winnerDetails.nickname || `${t("play.player")} ${winnerDetails.player_id || winnerDetails.id}`
        };
      }
    }

    const round = calculateRound(index, tournamentData.tournament.player_count);
    const position = calculatePosition(index, round, tournamentData.tournament.player_count);

    return {
      id: match.id,
      round: round,
      position: position,
      player1: player1Details ? {
        id: player1Details.player_id || player1Details.id,
        username: player1Details.nickname || `${t("play.player")} ${player1Details.player_id || player1Details.id}`,
        avatar: player1Details.avatar_url
      } : undefined,
      player2: player2Details ? {
        id: player2Details.player_id || player2Details.id,
        username: player2Details.nickname || `${t("play.player")} ${player2Details.player_id || player2Details.id}`,
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
  if (playerCount === 4) {
    return matchIndex < 2 ? 0 : 1;
  } else if (playerCount === 8) {
    if (matchIndex < 4) return 0;
    if (matchIndex < 6) return 1;
    return 2;
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
        matchId: match.id,
        opponent: {
          id: opponentDetails.player_id,
          username: opponentDetails.nickname || `${t("play.player")} ${opponentDetails.player_id}`,
          elo: opponent?.elo_before || 1000,
          avatar: opponentDetails.avatar_url
        },
        onAccept: (acceptedMatchId) => {
          console.log("Sending tournament_match_accept for match:", acceptedMatchId);
          client.send('tournament_match_accept', { matchId })
            .then(() => {
              console.log("Successfully sent tournament_match_accept");
            })
            .catch((error) => {
              console.error("Failed to send tournament_match_accept:", error);
            });
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
        <h3 class="text-xl font-bold text-white">${t("play.tournaments.inTournament.matchDetails")}</h3>
        <button class="close-modal text-gray-400 hover:text-white text-2xl">&times;</button>
      </div>
      
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <div class="text-center flex-1">
            <div class="text-white font-medium">
              ${player1Details?.nickname || `${t("play.player")} ${player1?.player_id || t("play.tournaments.inTournament.tbd")}`}
            </div>
            <div class="text-2xl font-bold text-pongcyan">
              ${player1?.goals || 0}
            </div>
          </div>
          
          <div class="px-4 text-gray-400">${t("play.tournaments.inTournament.vs")}</div>
          
          <div class="text-center flex-1">
            <div class="text-white font-medium">
              ${player2Details?.nickname || `${t("play.player")} ${player2?.player_id || t("play.tournaments.inTournament.tbd")}`}
            </div>
            <div class="text-2xl font-bold text-pongcyan">
              ${player2?.goals || 0}
            </div>
          </div>
        </div>
        
        <div class="border-t border-gray-700 pt-4">
          <div class="text-sm text-gray-300">
            <div>${t("play.tournaments.inTournament.status")}: <span class="text-white">${match.status  === "in_progress" ? t("play.tournaments.inTournament.tournamentInProgress") : t("play.tournaments.TournamentResults.tournamentCompleted")}</span></div>
            ${match.status === 'completed' ? 
              `<div>${t("play.tournaments.inTournament.winner")}: <span class="text-green-400">${
                match.winner_id ? 
                  (tournamentData.players.find((p: any) => String(p.player_id) === String(match.winner_id) || String(p.id) === String(match.winner_id))?.nickname || `${t("play.player")} ${match.winner_id}`) 
                  : t("play.tournaments.inTournament.tbd")
              }</span></div>` 
              : ''
            }
          </div>
        </div>
      </div>
    </div>
  `;

  modal.querySelector('.close-modal')?.addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });

  document.body.appendChild(modal);
}

import { TournamentResult, renderResultsTab } from "./TournamentResults.js";
import Toast from "../../toast/Toast.js";

function showTournamentResults(container: HTMLElement, data: any, client: TournamentClient, userId: string) {
  const content = container.querySelector('#tournament-content');
  if (!content) return;

  content.innerHTML = `
    <div class="tournament-results-container size-full flex flex-col gap-3">
      <div class="flex justify-between items-center flex-wrap gap-1">
        <div>
          <div class="text-sm text-gray-400">
            ${data.tournament.player_count} ${t('play.tournaments.createTournament.players')} • 
            ${t("play.tournaments.TournamentResults.tournamentCompleted")}
          </div>
        </div>
        <div class="text-sm text-green-400 drop-shadow-[0_0_5px_#4ade80]">
          <i class="fas fa-trophy text-yellow-400 mr-2"></i>
          ${t("play.tournaments.TournamentResults.tournamentFinished")}
        </div>
      </div>
      
      <div id="results-content" class="flex-1 size-full">
        <!-- Results will be rendered here -->
      </div>
      
      <div class="flex justify-center gap-4">
        <button id="back-to-tournaments" class="hidden md:block px-6 py-3 bg-pongcyan text-white rounded-lg hover:bg-cyan-700 transition-colors">
          <i class="fas fa-arrow-left mr-2"></i>
          ${t('play.tournaments.backToTournaments')}
        </button>
        <button id="view-brackets" class="px-6 py-2 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
          <i class="fas fa-bracket mr-2"></i>
          ${t('play.tournaments.inTournament.viewFinalBrackets')}
        </button>
      </div>
    </div>
  `;

  const results: TournamentResult[] = formatTournamentResults(data);
  
  renderResultsTab(content as HTMLElement, results);

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

function formatTournamentResults(tournamentData: any): TournamentResult[] {
  if (!tournamentData.players || !Array.isArray(tournamentData.players)) {
    return [];
  }

  const playerStats = new Map();

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

  const results = Array.from(playerStats.values()).map((stats: any) => {
    const player = stats.player;
    
    const goalDifference = stats.totalGoals - stats.goalsAgainst;
    const score = (stats.wins * 3) + goalDifference;
    
    return {
      userId: player.player_id || player.id,
      username: player.nickname || `${t("play.player")} ${player.player_id || player.id}`,
      avatarUrl: player.avatar_url,
      place: 0,
      score: score
    };
  });

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.username.localeCompare(b.username);
  });

  results.forEach((result, index) => {
    result.place = index + 1;
  });

  return results;
}
