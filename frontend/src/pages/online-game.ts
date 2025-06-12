import { Header } from "../components/header_footer/header.js";
import { PongLoading } from "../components/partials/PongLoading.js";
import { FetchFriendsList } from "../components/Online-Game/components/FriendsList.js";
import { FindOpponent } from "../components/Online-Game/components/FindOpponent.js";
import { t } from "../languages/LanguageController.js";
import { Footer } from "../components/header_footer/footer.js";
import { pongGameClient } from "../main.js";
import { OnlineGameBoard } from "../components/Online-Game/components/OnlineGameBoard.js";
import { navigate, refreshRouter } from "../router.js";
import store from "../../store/store.js";
import { OfflineGameHeader } from "../components/Offline-Game/components/GameHeader.js";

export default {
	render: (container: HTMLElement) => {
		container.className = "flex flex-col h-dvh";
		container.innerHTML = `
			<div class="header z-50 w-full bg-black"></div>
			
			<div class="content flex-1 relative overflow-hidden bg-black">
				<!-- Neon glow effects -->
				<div class="absolute inset-0 bg-gradient-to-br from-transparent via-pongcyan/5 to-transparent opacity-20 z-5 pointer-events-none"></div>
				
				<div id="content" class="flex max-sm:flex-col max-sm:items-center max-sm:justify-around max-sm:py-4 flex-1 container mx-auto px-4 w-full text-white z-10 relative h-full">
					<div class="flex flex-col items-center justify-center gap-5 sm:gap-10 w-full sm:w-1/2 py-8">
						<h1 class="text-4xl md:text-5xl font-bold text-center text-pongcyan drop-shadow-[0_0_15px_#00f7ff] animate-fade-down animate-once animate-duration-700">
							${t('play.title')}
						</h1>
						<div class="flex flex-col gap-6 w-full max-w-md">
							<button id="play-with-friend" class="play-btn p-4 border-2 border-pongcyan rounded-xl group bg-black hover:bg-black/80 text-white flex items-center gap-4 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.02] shadow-[0_0_15px_rgba(0,247,255,0.4)] hover:shadow-[0_0_25px_rgba(0,247,255,0.6)] animate-fade-right animate-once animate-duration-700">
								<span class="group-hover:scale-110 text-2xl transition-transform duration-300 ease-in-out text-pongcyan drop-shadow-[0_0_10px_#00f7ff]">
									<i class="fa-solid fa-users"></i>
								</span>
								<div class="flex flex-col gap-1 items-start">
									<h2 class="text-xl font-bold text-pongcyan drop-shadow-[0_0_5px_#00f7ff] group-hover:text-white group-hover:drop-shadow-[0_0_10px_#00f7ff]">${t('play.onlineGame.friendBtn')}</h2>
									<p class="text-sm opacity-90">${t('play.onlineGame.vsFriend')}</p>
								</div>
							</button>
							
							<button id="online-showdown" class="play-btn p-4 border-2 border-pongpink rounded-xl group bg-black hover:bg-black/80 text-white flex items-center gap-4 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.02] shadow-[0_0_15px_rgba(255,0,228,0.4)] hover:shadow-[0_0_25px_rgba(255,0,228,0.6)] animate-fade-left animate-once animate-duration-700 animate-delay-100">
								<span class="group-hover:scale-110 text-2xl transition-transform duration-300 ease-in-out text-pongpink drop-shadow-[0_0_10px_#ff00e4]">
									<i class="fa-solid fa-globe"></i>
								</span>
								<div class="flex flex-col gap-1 items-start">
									<h2 class="text-xl font-bold text-pongpink drop-shadow-[0_0_5px_#ff00e4] group-hover:text-white group-hover:drop-shadow-[0_0_10px_#ff00e4]">${t('play.onlineGame.onlineShowdownBtn')}</h2>
									<p class="text-sm opacity-90">${t('play.onlineGame.vsRivals')}</p>
								</div>
							</button>
						</div>
					</div>
					
					<div id="game-mode-details" class="flex flex-col items-center justify-center gap-10 w-full sm:w-1/2 py-8">
						<div class="relative w-full flex items-center justify-center">
							<div class="animation-container relative w-full max-w-md">
								<i id="icon-friends" class="fa-solid fa-users text-7xl md:text-8xl absolute top-1/4 left-1/2 -translate-x-1/2 transition-opacity duration-500 opacity-100 bg-gradient-to-r from-pongcyan via-[rgba(100,100,255,0.8)] to-pongcyan text-transparent bg-clip-text"></i>
								<span id="text-friends" class="text-3xl md:text-4xl text-center font-bold absolute top-1/4 left-1/2 -translate-x-1/2 transition-opacity duration-500 opacity-0">${t('play.onlineGame.vsFriend')}</span>
								
								<div id="loading-pong" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-125"></div>
								
								<i id="icon-online" class="fa-solid fa-globe text-7xl md:text-8xl absolute bottom-1/4 left-1/2 -translate-x-1/2 transition-opacity duration-500 opacity-100 bg-gradient-to-b from-pongpink via-[rgba(255,0,228,0.8)] to-pongpink text-transparent bg-clip-text"></i>
								<span id="text-online" class="text-3xl md:text-4xl text-center font-bold absolute bottom-1/4 left-1/2 -translate-x-1/2 transition-opacity duration-500 opacity-0">${t('play.onlineGame.vsRivals')}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
			
			<div class="footer"></div>
		`;

		let isIconVisible = true;
		let toggleInterval = setInterval(() => {
			isIconVisible = !isIconVisible;
	
			// Toggle Friends animation
			document.getElementById("icon-friends")?.classList.toggle("opacity-0", !isIconVisible);
			document.getElementById("icon-friends")?.classList.toggle("opacity-100");
			document.getElementById("text-friends")?.classList.toggle("opacity-0", isIconVisible);

			// Toggle Online animation
			document.getElementById("icon-online")?.classList.toggle("opacity-0", !isIconVisible);
			document.getElementById("icon-online")?.classList.toggle("opacity-100");
			document.getElementById("text-online")?.classList.toggle("opacity-0", isIconVisible);
		}, 3000);

		const heading = container.querySelector("h1")!;


		// Header
		const headerNav = container.querySelector(".header");
		const header = Header();
		headerNav?.appendChild(header);

		// Footer component
		const footerContainer = container.querySelector(".footer");
		const footerComp = Footer();
		footerContainer?.appendChild(footerComp);

		// Loading pong animation
		const loadingPong = container.querySelector('#loading-pong');
		loadingPong?.appendChild(PongLoading({text: t('play.onlineGame.or')}));
		
		const userId = store.userId?? '0';
		const client = pongGameClient;

		// State for tracking current match
		let currentMatchId: string | null = null;
		let currentOpponentId: string | null = null;
		let isPlayer1 = false;
		let gameBoard:any | null = null;
		
		const waitingForMatchHandler = (data:any) => {
			// Update queue position display if we have one
			const queuePositionElement = document.getElementById('queue-position');
			if (queuePositionElement) {
				queuePositionElement.textContent = `Position: ${data.position}`;
			}
		}
		client?.on('waiting_for_match', waitingForMatchHandler);

		const matchFoundHandler = (data: any) => {
			currentMatchId = data.matchId;
			currentOpponentId = data.opponent.id;
			isPlayer1 = data.isPlayer1; // We're player 1 if we initiated
			console.log(`This is player 1: ${isPlayer1}`);
			
			// Show match found UI
			showMatchFound(data.opponent);
			client?.off('waiting_for_match', waitingForMatchHandler);
		}
		client?.on('match_found', matchFoundHandler);

		const gameStartHandler = (data: any) => {
			console.log(`Game started with match ID: ${data.matchId}`);
			console.log("ISPLAYER 1: ", isPlayer1);
			
			if (currentMatchId && currentOpponentId && currentMatchId === data.matchId) {
				startGame(currentMatchId, currentOpponentId, isPlayer1);
			}
			client?.off('match_found', matchFoundHandler)
		}
		client?.on('game_start', gameStartHandler);
		
		client?.on('friend_match_invite', (data:any) => {
			// Show friend invite notification
			const accept = confirm(`${data.fromId} has invited you to a match. Accept?`);
			if (accept) {
				client.acceptFriendMatch(data.fromId);
			}
		});
		
		client?.on('friend_match_created', (data:any) => {
			currentMatchId = data.matchId;
			currentOpponentId = data.opponent.id;
			isPlayer1 = data.isPlayer1; 
			
			// Show match found UI
			showMatchFound(data.opponent);
		});
		
		const matchResultsHandler = (data: any) => {
			if (gameBoard) {
				// Game ended, show results
				showGameResults(data);
				gameBoard.cleanup();
				gameBoard = null;
			}
		}
		client?.on('match_results', (data:any) => {
			matchResultsHandler(data);
			client.off('match_results', matchResultsHandler);
			client.off('game_start', gameStartHandler)
		});

		// Play with Friend functionality
		const playWithFriendBtn = document.getElementById("play-with-friend");
		playWithFriendBtn?.addEventListener("click", () => {
			clearInterval(toggleInterval);

			const gameModeDetails = document.getElementById("game-mode-details");
			if (gameModeDetails) {
				heading.textContent = t('play.onlineGame.findFriend');
				heading.className = "text-4xl md:text-5xl font-bold text-center text-pongcyan drop-shadow-[0_0_15px_#00f7ff]";

				// Replace the existing FetchFriendsList with one that uses our client
				gameModeDetails.innerHTML = '';
				const friendsList = FetchFriendsList();
				gameModeDetails.appendChild(friendsList);
				
				// Add event handler for friend invitation
				friendsList.addEventListener('friend-selected', (e:any) => {
					const friendId = e.detail;
					client?.inviteFriend(friendId);
					
					// Show waiting for response UI
					showWaitingForFriend(friendId);
				});
			}
		});

		// Online Showdown functionality
		const onlineShowdownBtn = document.getElementById("online-showdown");
		onlineShowdownBtn?.addEventListener("click", () => {
			clearInterval(toggleInterval);

			const gameModeDetails = document.getElementById("game-mode-details");			
			if (gameModeDetails) {
				heading.textContent = t('play.onlineGame.findingOponent');
				heading.className = "text-4xl md:text-5xl font-bold text-center text-pongpink drop-shadow-[0_0_15px_#ff00e4]";

				gameModeDetails.innerHTML = '';
				const findOpponent = FindOpponent({heading, isIconVisible, toggleInterval, client});
				gameModeDetails.appendChild(findOpponent);
				isIconVisible = !isIconVisible;
				
				// Start matchmaking
				// client.findMatch();
				console.log("find_match request sent");
				
				// Add cancel button event handler
				findOpponent.querySelector('#cancel-matchmaking')?.addEventListener('click', () => {
					client?.cancelMatchmaking();
					// showMainMenu();
				});
			}
		});
		
		function showWaitingForFriend(friendId:string) {
			const gameModeDetails = document.getElementById("game-mode-details");
			if (gameModeDetails) {
				gameModeDetails.innerHTML = `
					<div class="flex flex-col items-center justify-center gap-6">
						<h2 class="text-2xl text-pongcyan">${'waiting for Friend'}</h2>
						<p>${'Invite sent to'} ${friendId}</p>
						<div class="spinner"></div>
						<button id="cancel-invite" class="px-6 py-3 bg-red-600 text-white rounded-md">
							${t('play.onlineGame.cancel')}
						</button>
					</div>
				`;
				
				// Add cancel button handler
				// document.getElementById('cancel-invite')?.addEventListener('click', () => {
				// 	// showMainMenu();
				// });
			}
		}
		
		function showMatchFound(opponent:any) {
			const gameModeDetails = document.getElementById("game-mode-details");
			if (gameModeDetails) {
				gameModeDetails.innerHTML = `
					<div class="flex flex-col items-center justify-center gap-6">
						<h2 class="text-2xl text-pongpink">${t('play.onlineGame.matchFound')}</h2>
						<p>${t('play.onlineGame.opponent')}: ${opponent.id}</p>
						<p>${t('play.onlineGame.opponentElo')}: ${opponent.elo}</p>
						<div class="countdown-container">
							<p>${t('play.onlineGame.startingIn')}</p>
							<div class="text-5xl font-bold countdown">3</div>
						</div>
					</div>
				`;
				
				// Start countdown
				let count = 3;
				const countdownElement = document.querySelector('.countdown');
				const interval = setInterval(() => {
					count--;
					if (countdownElement) {
						countdownElement.textContent = count.toString();
					}
					
					if (count <= 0) {
						clearInterval(interval);
					}
				}, 1000);
			}
		}
		
		function startGame(matchId:string, opponentId:string, isPlayer1:boolean) {
			if (gameBoard) {
				gameBoard.cleanup();
				gameBoard = null;
			}
			// Create game container
			container.innerHTML = `
				<div class="content relative flex flex-col items-center sm:justify-around h-screen max-sm:p-2 sm:border-8 bg-pongcyan border-pongdark border-solid">
					<div class="player-header w-4/5 "></div>
					<div class="game-container flex items-center justify-center max-sm:flex-1 max-w-0">
						<canvas id="game-canvas" class="portrait:-rotate-90 portrait:origin-center max-sm:w-[85dvh] max-sm:h-[85dvw] portrait:w-[85dvh] portrait:h-[85dvw] sm:w-[80vw] sm:h-[80vh] rounded-lg -rotate-90 sm:rotate-0"></canvas>
					</div>
					<div class="fixed hidden inset-0 flex items-center justify-center bg-black bg-opacity-75" id="result-popup">
						<div class="bg-black border-2 border-pongcyan p-6 rounded-lg shadow-lg text-center">
							<p class="text-xl font-bold mb-4 text-white text-shadow-neon" id="winner-text"></p>
							<p class="mb-4 text-lg text-white text-shadow-neon" id="score-text"></p>
							<button class="px-4 py-2 bg-pongcyan text-white border border-white rounded-lg transition-all hover:opacity-80 hover:shadow-neon" id="restart-btn" style="box-shadow: rgb(0, 255, 255) 0px 0px 10px, rgb(0, 255, 255) 0px 0px 20px;">Return</button>
						</div>
					</div>
				</div>
			`;
			
			// Get canvas and header
			const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
			const gameHeader = OfflineGameHeader({gameMode: 'online', player1_id: userId, player2_id: opponentId, client });
			const playerHeader = container.querySelector('.player-header')!;
			playerHeader.appendChild(gameHeader);
			// Create game board
			if (canvas && gameHeader) {
				gameBoard = new OnlineGameBoard(
					canvas,
					gameHeader,
					client!,
					matchId,
					userId,
					opponentId,
					isPlayer1
				);

				gameBoard.startGame();
			}
		}
		
		function showGameResults(results: any) {
			const resultsOverlay = document.createElement('div');
			if (document.body.contains(resultsOverlay))
				return;
			resultsOverlay.className = 'game-results fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50';
			console.log(results);
			// Determine if player won
			const isWinner = (results.winner === Number(store.userId));
			console.log(results.winner, store.userId);
			console.log(isWinner);			
			// Calculate ELO change
			const eloChange = results.eloChange[userId] || 0;
			const eloChangeDisplay = eloChange >= 0 ? `+${eloChange}` : eloChange;
			
			resultsOverlay.innerHTML = `
				<div class="results-container bg-black p-8 rounded-xl border-2 ${isWinner ? 'border-pongcyan' : 'border-pongpink'} max-w-md w-full">
					<h2 class="text-3xl font-bold mb-4 ${isWinner ? 'text-pongcyan' : 'text-pongpink'}">
						${isWinner ? t('play.onlineGame.youWon') : t('play.onlineGame.youLost')}
					</h2>
					<p class="text-white mb-2">${t('play.onlineGame.finalScore')}: ${results.finalScore.player1} - ${results.finalScore.player2}</p>
					<p class="text-white mb-6">${t('play.onlineGame.eloChange')}: <span class="${eloChange >= 0 ? 'text-green-500' : 'text-red-500'}">${eloChangeDisplay}</span></p>
					
					<div class="flex gap-4">
						<button id="play-again-btn" class="flex-1 py-3 px-4 bg-pongcyan text-white rounded-md">
							${t('play.onlineGame.playAgain')}
						</button>
					</div>
				</div>
			`;
			
			// Add to DOM
			document.body.appendChild(resultsOverlay);
			
			// Add button event handlers
			document.getElementById('play-again-btn')?.addEventListener('click', () => {
				document.body.removeChild(resultsOverlay);
				gameBoard = null;
				navigate("/play/online-game");
			});
		}

		return () => {
			gameBoard.cleanup();
			gameBoard = null;
			client?.disconnect();
			clearInterval(toggleInterval);
		};
	}
};