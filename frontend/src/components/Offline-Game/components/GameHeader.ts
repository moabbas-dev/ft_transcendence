import { createComponent } from "../../../utils/StateManager.js";
import playerPic from "/src/assets/afarachi.jpg";
import player2Pic from "/src/assets/moabbas.jpg";
import aiPic1 from "/src/assets/ai/pic1.jpg";
import aiPic2 from "/src/assets/ai/pic2.jpg";
import aiPic3 from "/src/assets/ai/pic3.jpg";
import aiPic4 from "/src/assets/ai/pic4.jpg";
import aiPic5 from "/src/assets/ai/pic5.jpg";
import {
	createDivider,
	createParticles,
	initBackgrounds,
	updateBackgrounds,
} from "./HeaderAnimations_utils.js";
import { GameType } from "../../../types/types.js";
import axios from "axios";

interface OfflineGameHeader {
	gameMode: GameType;
	player1_id?: string;
	player2_id?: string;
	client?: any;
}

const aiImages = [aiPic1, aiPic2, aiPic3, aiPic4, aiPic5];

const getRandomAIImage = () => aiImages[Math.floor(Math.random() * aiImages.length)];

export const OfflineGameHeader = createComponent((props: OfflineGameHeader) => {
	const aiPic = getRandomAIImage();
	const container = document.createElement("div");
	container.className = `
    relative flex items-center text-white text-lg shadow-lg overflow-hidden rounded-lg md:rounded-2xl
    border border-yellow-500 md:border-2
  `;

	const particleContainer = createParticles();
	container.appendChild(particleContainer);

	const dividerContainer = createDivider();
	container.appendChild(dividerContainer);

	const content = document.createElement("div");
	content.className =
		"rounded-lg md:rounded-2xl relative z-30 grid grid-cols-3 items-center w-full px-2 sm:px-4 md:px-8";

	let player1Image = playerPic;
	let player2Image = props.gameMode === "AI" ? aiPic : player2Pic;
	let player1Name = props.gameMode === "AI" ? "Player" : "Player 1";
	let player2Name = props.gameMode === "AI" ? "AI" : "Player 2";

	const fetchUserData = async (userId: string) => {
		try {
			const response = await axios.get(`http://localhost:8001/auth/users/id/${userId}`);
			return response.data;
		} catch (error) {
			console.log("Error fetching user data:", error);
			return null;
		}
	};

	content.innerHTML = `
    <!-- Player 1 Info -->
    <div class="flex items-center gap-1 sm:gap-2 md:gap-4 justify-self-start">
    <div id="player-avatar-container">
      <img src="${player1Image}" alt="Player 1" class="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 rounded-full border border-blue-300 md:border-2">
    </div>
    <div>
      <p id="player1-name" class="font-bold text-sm sm:text-base md:text-xl text-blue-200">${player1Name}</p>
      <div class="flex items-center">
      <p id="player-score1" class="text-lg sm:text-xl md:text-2xl font-bold relative">
        <span class="relative z-10 text-white">0</span>
      </p>
      </div>
    </div>
    </div>
    
    <!-- Center Title with Animated Effect - Now in the center column of the grid -->
    <div class="flex flex-col items-center justify-self-center">
    <div class="relative text-base sm:text-xl md:text-3xl font-extrabold uppercase tracking-wider">
      <div class="absolute inset-0 bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500 opacity-30 blur-md rounded-lg"></div>
      <div class="relative text-center">
      <span class="font-mono text-yellow-300">Pong</span>
      <span class="hidden sm:inline pl-1">Game</span>
      </div>
      <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500 animate-shimmer" 
        style="background-size: 200% 100%;"></div>
    </div>
    <div class="mt-1 hidden sm:block">
      <i class="fa-solid fa-table-tennis-paddle-ball text-yellow-300 animate-float"></i>
    </div>
    </div>
    
    <!-- Player 2 Info -->
    <div class="flex items-center gap-1 sm:gap-2 md:gap-4 justify-self-end">
      <div class="text-right">
        <p id="player2-name" class="font-bold text-sm sm:text-base md:text-xl text-red-200">${player2Name}</p>
        <div class="flex items-center justify-end">
          <p id="player-score2" class="text-lg sm:text-xl md:text-2xl font-bold relative">
            <span class="relative z-10 text-white">0</span>
          </p>
        </div>
      </div>
      <div id="player2-avatar-container">
        <img src="${player2Image}" alt="Player 2" class="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 rounded-full border border-red-300 md:border-2">
      </div>
    </div>
  `;

	container.appendChild(content);
	initBackgrounds(container);

	if (props.gameMode === "online" && props.player1_id && props.player2_id) {
		const updatePlayerDisplay = (playerNumber: number, userData: any) => {
			if (!userData) return;

			const nameElement = document.getElementById(`player${playerNumber}-name`);
			const avatarContainer = document.getElementById(
				playerNumber === 1 ? 'player-avatar-container' : 'player2-avatar-container'
			);

			if (nameElement && userData.nickname) {
				nameElement.textContent = userData.nickname;
			}

			if (avatarContainer && userData.avatar_url) {
				const avatarImg = avatarContainer.querySelector('img');
				if (avatarImg) {
					avatarImg.src = userData.avatar_url;
					avatarImg.alt = userData.nickname || `Player ${playerNumber}`;
				}
			}
		};

		const showGoalAnimation = (scoringPlayer: number) => {
			const goalFlash = document.createElement('div');
			goalFlash.className = `absolute inset-0 z-40 flex items-center justify-center bg-opacity-70 ${scoringPlayer === 1 ? 'bg-blue-600' : 'bg-red-600'
				}`;

			goalFlash.innerHTML = `
        <div class="text-4xl md:text-6xl font-bold text-white animate-bounce">
          GOAL!
        </div>
      `;

			container.appendChild(goalFlash);
			setTimeout(() => {
				container.removeChild(goalFlash);
			}, 1500);
		};

		Promise.all([
			fetchUserData(props.player1_id),
			fetchUserData(props.player2_id)
		]).then(([player1Data, player2Data]) => {

			updatePlayerDisplay(1, player1Data);
			updatePlayerDisplay(2, player2Data);
		}).catch(error => {
			console.error("Error fetching player data:", error);
		});

		if (props.client) {
			props.client.on('score_update', (data: any) => {
				const score1Element = document.getElementById('player-score1')?.querySelector('span');
				const score2Element = document.getElementById('player-score2')?.querySelector('span');

				if (score1Element) score1Element.textContent = String(data.player1Score);
				if (score2Element) score2Element.textContent = String(data.player2Score);

				updateBackgrounds(data.player1Score, data.player2Score);
			});

			props.client.on('goal_scored', (data: any) => {
				const score1Element = document.getElementById('player-score1')?.querySelector('span');
				const score2Element = document.getElementById('player-score2')?.querySelector('span');

				if (score1Element) score1Element.textContent = String(data.newScore.player1);
				if (score2Element) score2Element.textContent = String(data.newScore.player2);

				updateBackgrounds(data.newScore.player1, data.newScore.player2);

				showGoalAnimation(data.scoringPlayer);
			});
		}
	}

	return container;
});