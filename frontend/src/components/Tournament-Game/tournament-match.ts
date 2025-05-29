import store from "../../../store/store";
import { navigate } from "../../router";
import { Page } from "../../types/types";
import { OfflineGameHeader } from "../Offline-Game/components/GameHeader";
import { OnlineGameBoard } from "../Online-Game/components/OnlineGameBoard";
import { TournamentClient } from "./TournamentClient";

const TournamentMatchPage: Page = {
  render: (container: HTMLElement, params?: { [key: string]: string }, state?: any) => {
    if (!params || !params.tournamentId || !params.matchId) {
      console.error("Tournament ID and Match ID are required");
      navigate("/play/tournaments");
      return;
    }
    
    if (!state || !state.client) {
      console.error("Tournament match state is required");
      navigate(`/tournaments/${params.tournamentId}`);
      return;
    }

    const { matchId, tournamentId, opponent, isPlayer1, client } = state;
    const userId = store.userId as string;

    container.className = "bg-ponghover w-full h-dvh flex flex-col items-center justify-center";
    container.innerHTML = `
      <div class="size-full flex flex-col gap-3 p-4">
        <div id="game-header" class="w-full h-[15%]">
          <!-- Game header will be inserted here -->
        </div>
        
        <div class="flex-1 flex items-center justify-center">
          <canvas id="tournament-game-canvas" 
                  class="portrait:-rotate-90 portrait:origin-center max-sm:w-[85dvh] max-sm:h-[85dvw] portrait:w-[85dvh] portrait:h-[85dvw] sm:w-[80vw] sm:h-[80vh] rounded-lg -rotate-90 sm:rotate-0">
          </canvas>
        </div>
        
        <div class="w-full h-[10%] flex justify-center items-center">
          <button id="leave-match-btn" 
                  class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Forfeit Match
          </button>
        </div>
      </div>
    `;

    // Create game header
    const gameHeaderContainer = container.querySelector('#game-header') as HTMLElement;
    const gameHeader = OfflineGameHeader({
      gameMode: "online",
      player1_id: isPlayer1 ? userId : opponent.id,
      player2_id: isPlayer1 ? opponent.id : userId,
      client: client
    });
    gameHeaderContainer.appendChild(gameHeader);

    // Get canvas and initialize game
    const canvas = container.querySelector('#tournament-game-canvas') as HTMLCanvasElement;
    const gameBoard = new OnlineGameBoard(
      canvas,
      gameHeader,
      client as TournamentClient,
      matchId,
      userId,
      opponent.id,
      isPlayer1
    );
    gameBoard.startGame();

    // Handle forfeit button
    const leaveButton = container.querySelector('#leave-match-btn');
    leaveButton?.addEventListener('click', () => {
      if (confirm('Are you sure you want to forfeit this match? This will count as a loss.')) {
        client.send('tournament_match_result', {
          matchId: matchId,
          winnerId: opponent.id,
          finalScore: { winner: 10, loser: 0 }
        });
        navigate(`/tournaments/${tournamentId}`);
      }
    });

    // Handle match completion
    client.on('tournament_match_completed', (data: any) => {
      if (String(data.matchId) === String(matchId)) {
        setTimeout(() => navigate(`/tournaments/${tournamentId}`), 3000);
      }
    });

    // Handle tournament completion
    client.on('tournament_completed', (data: any) => {
      setTimeout(() => navigate(`/tournaments/${tournamentId}`), 5000);
    });

    // Cleanup
    window.addEventListener('beforeunload', () => {
      // Cleanup logic
    });
  }
};

export default TournamentMatchPage;