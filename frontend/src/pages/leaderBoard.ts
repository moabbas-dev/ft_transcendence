// import { Header } from "../components/header_footer/header.js";
// import pic1 from "../assets/p11.jpg";
// import pic2 from "../assets/p10.jpg";
// import pic3 from "../assets/p12.jpg";

// import playerFrame from "../assets/g7.webp";
// import playerFrame1 from "../assets/g6.webp";
// import playerFrame2 from "../assets/g5.webp";
// import { Footer } from "../components/header_footer/footer.js";
// import { t } from "../languages/LanguageController.js";

// interface Player {
//   id: number;
//   username: string;
//   avatar: string;
//   wins: number;
//   rank: number;
//   score: number;
// }

// export default {
//   render: async (container: HTMLElement) => {
//     container.className = 'flex flex-col h-dvh';
//     container.innerHTML = `
//       <div class="profile"></div>
//       <div class="header w-full bg-black"></div>

//       <div class="content flex-1 overflow-x-hidden bg-black relative z-10">
//         <!-- Neon glow effects -->
//         <div class="absolute inset-0 bg-gradient-to-br from-transparent via-pongcyan/5 to-transparent opacity-20 z-0 pointer-events-none"></div>

//         <div class="container mx-auto px-4 py-8 flex flex-col gap-8 relative z-10">
//           <div class="flex flex-col gap-8">
//             <h1 class="text-3xl sm:text-4xl md:text-5xl text-center font-bold text-pongcyan drop-shadow-[0_0_15px_#00f7ff] animate-fade-down animate-once animate-duration-700">
//               <span class="max-sm:hidden">Ping-</span>Pong ${t('leaderBoard.title')}
//             </h1>

//             <!-- Top 3 Players Podium -->
//             <div class="top-players flex items-end justify-center gap-2 sm:gap-4 min-w-0 w-full max-w-4xl mx-auto px-1">
//               <!-- 2nd Place -->
//               <div class="second-place w-[30%] flex flex-col items-center gap-0.5 animate-fade-right animate-once animate-duration-700">
//                 <div class="relative">
//                   <div class="crown absolute -top-6 left-1/2 transform -translate-x-1/2 text-2xl animate-bounce animate-infinite animate-duration-1000">🥈</div>
//                   <div class="avatar-container relative size-16 sm:size-24 sm:mb-2 overflow-hidden">
//                     <img src="${pic2}" alt="2nd Place" class="second-avatar absolute rounded-full  w-12 h-12 sm:w-16 sm:h-16 object-cover top-7 sm:top-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
//                     <img src="${playerFrame1}" alt="Player Frame" class="absolute w-full -top-3 sm:-top-4 left-0 pointer-events-none z-10" />
//                   </div>
//                 </div>
//                 <!--<p class="username text-xl text-white font-semibold second-name drop-shadow-[0_0_5px_rgba(255,255,255,0.6)]"></p>-->
//                 <p class="score text-pongcyan text-lg second-score drop-shadow-[0_0_8px_rgba(0,247,255,0.6)]"></p>
//                 <div class="podium bg-silver border-t-2 border-pongcyan w-full h-28 rounded-t-lg shadow-[0_-5px_15px_rgba(0,247,255,0.4)]"></div>
//               </div>

//               <!-- 1st Place -->
//               <div class="first-place w-[40%] flex flex-col items-center gap-0.5 z-10 animate-fade-up animate-once animate-duration-700">
//                 <div class="relative">
//                   <div class="crown absolute -top-6 left-1/2 transform -translate-x-1/2 text-3xl animate-bounce animate-infinite animate-duration-1000">🥇</div>
//                   <div class="avatar-container relative size-28 mb-2 sm:size-32">
//                     <img src="${pic1}" alt="1st Place" class="first-avatar absolute rounded-full w-20 h-20 sm:w-24 sm:h-24 object-cover top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
//                     <img src="${playerFrame}" alt="Player Frame" class="absolute w-full -top-3  sm:-top-4 left-0 pointer-events-none z-10" />
//                   </div>
//                 </div>
//                 <!--<p class="username text-2xl text-white font-bold first-name drop-shadow-[0_0_5px_rgba(255,255,255,0.6)]"></p>-->
//                 <p class="score text-pongpink text-xl first-score drop-shadow-[0_0_8px_rgba(255,0,228,0.6)]"></p>
//                 <div class="podium bg-gold border-t-2 border-pongpink w-full h-40 rounded-t-lg shadow-[0_-5px_15px_rgba(255,0,228,0.4)]"></div>
//               </div>

//               <!-- 3rd Place -->
//               <div class="third-place w-[30%] flex flex-col items-center gap-0.5 animate-fade-left animate-once animate-duration-700">
//                 <div class="relative">
//                   <div class="crown absolute -top-6 left-1/2 transform -translate-x-1/2 text-2xl animate-bounce animate-infinite animate-duration-1000">🥉</div>
//                   <div class="avatar-container relative size-16 sm:size-24 mb-2 overflow-hidden">
//                     <img src="${pic3}" alt="3rd Place" class="second-avatar absolute rounded-full  w-12 h-12 sm:w-16 sm:h-16 object-cover top-7 sm:top-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
//                     <img src="${playerFrame2}" alt="Player Frame" class="absolute w-full -top-3 sm:-top-4 left-0 pointer-events-none z-10" />
//                   </div>
//                 </div>
//                 <!--<p class="username text-xl text-white font-semibold third-name drop-shadow-[0_0_5px_rgba(255,255,255,0.6)]"></p>-->
//                 <p class="score text-pongcyan text-lg third-score drop-shadow-[0_0_8px_rgba(0,247,255,0.6)]"></p>
//                 <div class="podium bg-bronze border-t-2 border-pongcyan w-full h-20 rounded-t-lg shadow-[0_-5px_15px_rgba(0,247,255,0.4)]"></div>
//               </div>
//             </div>
//           </div>

//           <!-- Rest of Leaderboard -->
//           <div class="leaderboard-table min-w-0 w-full max-h-96 bg-black/60 rounded-xl overflow-y-auto max-w-4xl mx-auto border-2 border-pongcyan shadow-[0_0_20px_rgba(0,247,255,0.4)] animate-fade-up animate-once animate-duration-700 animate-delay-300 scrollbar-thin scrollbar-thumb-pongcyan scrollbar-track-gray-900">
//             <table class="relative w-full border-collapse">
//                 <thead class="sticky top-0 z-10">
//                   <tr class="bg-black text-pongcyan text-center text-lg sm:text-xl border-b border-pongcyan/50">
//                     <th class="py-3 px-4">${t('leaderBoard.rank')}</th>
//                     <th class="py-3 px-6" colspan="2">${t('leaderBoard.player')}</th>
//                     <th class="py-3 px-4">${t('leaderBoard.wins')}</th>
//                     <th class="py-3 px-4">${t('leaderBoard.score')}</th>
//                   </tr>
//                 </thead>
//               <tbody id="leaderboardBody" class="sm:text-lg">
//                 <!-- Leaderboard rows will be inserted here -->
//                 <tr>
//                   <td colspan="5" class="py-4 text-center text-pongpink">
//                     <div class="flex items-center justify-center gap-3">
//                       <div class="animate-spin h-5 w-5 border-2 border-pongpink rounded-full border-t-transparent"></div>
//                       Loading players...
//                     </div>
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       <div class="footer"></div>
//     `;

//     // Add header
//     const headerNav = container.querySelector(".header");
//     const header = Header();
//     headerNav?.appendChild(header);

//     // Add footer
//     const footer = container.querySelector(".footer")!;
//     const footerComp = Footer();
//     footer.appendChild(footerComp);

//     // Fetch leaderboard data
//     await fetchAndDisplayLeaderboard();
//   },
// };

// async function fetchAndDisplayLeaderboard() {
//   try {
//     // Simulated data - replace with actual API fetch
//     const players: Player[] = [
//       {
//         id: 1,
//         username: "PongMaster",
//         avatar: "/images/avatars/avatar1.jpg",
//         wins: 42,
//         rank: 1,
//         score: 2450,
//       },
//       {
//         id: 2,
//         username: "TableTennisKing",
//         avatar: "/images/avatars/avatar2.jpg",
//         wins: 38,
//         rank: 2,
//         score: 2320,
//       },
//       {
//         id: 3,
//         username: "PaddleChamp",
//         avatar: "/images/avatars/avatar3.jpg",
//         wins: 35,
//         rank: 3,
//         score: 2180,
//       },
//       {
//         id: 4,
//         username: "BallWizard",
//         avatar: "/images/avatars/avatar4.jpg",
//         wins: 30,
//         rank: 4,
//         score: 1950,
//       },
//       {
//         id: 5,
//         username: "RallyQueen",
//         avatar: "/images/avatars/avatar5.jpg",
//         wins: 28,
//         rank: 5,
//         score: 1900,
//       },
//       {
//         id: 6,
//         username: "SpinMaster",
//         avatar: "/images/avatars/avatar6.jpg",
//         wins: 25,
//         rank: 6,
//         score: 1750,
//       },
//       {
//         id: 7,
//         username: "ServeKing",
//         avatar: "/images/avatars/avatar7.jpg",
//         wins: 22,
//         rank: 7,
//         score: 1680,
//       },
//       {
//         id: 8,
//         username: "PongProdigy",
//         avatar: "/images/avatars/avatar8.jpg",
//         wins: 20,
//         rank: 8,
//         score: 1600,
//       },
//       {
//         id: 9,
//         username: "SmashQueen",
//         avatar: "/images/avatars/avatar9.jpg",
//         wins: 18,
//         rank: 9,
//         score: 1520,
//       },
//       {
//         id: 10,
//         username: "BackspinKing",
//         avatar: "/images/avatars/avatar10.jpg",
//         wins: 15,
//         rank: 10,
//         score: 1450,
//       },
//       {
//         id: 11,
//         username: "BackspinQueen",
//         avatar: "/images/avatars/avatar10.jpg",
//         wins: 14,
//         rank: 11,
//         score: 1420,
//       },
//       {
//         id: 12,
//         username: "PongWizard",
//         avatar: "/images/avatars/avatar10.jpg",
//         wins: 13,
//         rank: 12,
//         score: 1380,
//       }
//     ];

//     // Generate additional dummy players for display
//     for (let i = 13; i <= 40; i++) {
//       players.push({
//         id: i,
//         username: `Player${i}`,
//         avatar: "/images/avatars/avatar10.jpg",
//         wins: Math.floor(15 - (i-10) * 0.3),
//         rank: i,
//         score: Math.floor(1450 - (i-10) * 30),
//       });
//     }

//     // Update top 3 players podium display
//     updateTopThreePlayers(players.slice(0, 3));

//     // Update leaderboard table
//     const leaderboardBody = document.getElementById("leaderboardBody");
//     if (leaderboardBody) {
//       leaderboardBody.innerHTML = "";

//       // Skip the first 3 players (already shown in podium)
//       // players.slice(3).forEach((player) => {
//       players.forEach((player) => {

//         const row = document.createElement("tr");
//         row.className =
//           "border-b border-pongcyan/20 hover:bg-pongcyan/10 transition-colors";

//         row.innerHTML = `
//           <td class="py-3 px-4 text-pongcyan text-center font-semibold">${player.rank}</td>
//           <td colspan="2" class="py-3 px-6">
//             <div class="flex items-center gap-3 w-28 sm:w-auto justify-center sm:justify-start">
//               <div class="size-10 rounded-full overflow-hidden border-2 border-pongcyan shadow-[0_0_8px_rgba(0,247,255,0.4)]">
//                 <img src="${player.avatar}" alt="${player.username}" class="w-full h-full object-cover" />
//               </div>
//               <p class="text-white max-w-[60px] sm:max-w-[120px]  text-center">${player.username}</p>
//             </div>
//           </td>
//           <td class="py-3 px-4 text-center text-pongpink font-medium">${player.wins}</td>
//           <td class="py-3 px-4 text-center text-white font-semibold">${player.score}</td>
//         `;

//         leaderboardBody.appendChild(row);
//       });
//     }
//   } catch (error) {
//     console.error("Error fetching leaderboard data:", error);
//     const leaderboardBody = document.getElementById("leaderboardBody");
//     if (leaderboardBody) {
//       leaderboardBody.innerHTML = `
//         <tr>
//           <td colspan="5" class="py-4 text-center text-pongpink">
//             <div class="flex flex-col items-center gap-2">
//               <i class="fas fa-exclamation-triangle text-2xl"></i>
//               <span>Failed to load leaderboard data. Please try again.</span>
//             </div>
//           </td>
//         </tr>
//       `;
//     }
//   }
// }

// // Helper function to update top 3 players display
// function updateTopThreePlayers(topPlayers: Player[]) {
//   if (topPlayers.length >= 1) {
//     const firstPlayer = topPlayers[0];
//     // document.querySelector('.first-name')!.textContent = firstPlayer.username;
//     document.querySelector('.first-score')!.textContent = firstPlayer.score.toString();
//   }

//   if (topPlayers.length >= 2) {
//     const secondPlayer = topPlayers[1];
//     // document.querySelector('.second-name')!.textContent = secondPlayer.username;
//     document.querySelector('.second-score')!.textContent = secondPlayer.score.toString();
//   }

//   if (topPlayers.length >= 3) {
//     const thirdPlayer = topPlayers[2];
//     // document.querySelector('.third-name')!.textContent = thirdPlayer.username;
//     document.querySelector('.third-score')!.textContent = thirdPlayer.score.toString();
//   }
// }

import { Header } from "../components/header_footer/header.js";
import playerFrame from "../assets/g7.webp";
import playerFrame1 from "../assets/g6.webp";
import playerFrame2 from "../assets/g5.webp";
import { Footer } from "../components/header_footer/footer.js";
import { t } from "../languages/LanguageController.js";
import axios from 'axios';
import getValidAccessToken from "../../refresh/RefreshToken.js";
import store from "../../store/store.js";

// Updated interface to match backend response
interface Player {
  rank: number;
  id: number;
  wins: number;
  eloScore: number;
  fullName: string | null;
  nickname: string | null;
  avatarUrl: string | null;
}

interface LeaderboardResponse {
  leaderboard: Player[];
  total_players: number;
  requested_limit: number;
}

export default {
  render: async (container: HTMLElement) => {
    container.className = 'flex flex-col h-dvh';
    container.innerHTML = `
      <div class="profile"></div>
      <div class="header w-full bg-black"></div>
      
      <div class="content flex-1 overflow-x-hidden bg-black relative z-10">
        <!-- Neon glow effects -->
        <div class="absolute inset-0 bg-gradient-to-br from-transparent via-pongcyan/5 to-transparent opacity-20 z-0 pointer-events-none"></div>
        
        <div class="container mx-auto px-4 py-8 flex flex-col gap-8 relative z-10">
          <div class="flex flex-col gap-8">
            <h1 class="text-3xl sm:text-4xl md:text-5xl text-center font-bold text-pongcyan drop-shadow-[0_0_15px_#00f7ff] animate-fade-down animate-once animate-duration-700">
              <span class="max-sm:hidden">Ping-</span>Pong ${t('leaderBoard.title')}
            </h1>
            
            <!-- Top 3 Players Podium -->
            <div class="top-players flex items-end justify-center gap-2 sm:gap-4 min-w-0 w-full max-w-4xl mx-auto px-1">
              <!-- 2nd Place -->
              <div class="second-place w-[30%] flex flex-col items-center gap-0.5 animate-fade-right animate-once animate-duration-700" style="display: none;">
                <div class="relative">
                  <div class="crown absolute -top-6 left-1/2 transform -translate-x-1/2 text-2xl animate-bounce animate-infinite animate-duration-1000">🥈</div>
                  <div class="avatar-container relative size-16 sm:size-24 sm:mb-2 overflow-hidden">
                    <img src="/images/avatars/default.jpg" alt="2nd Place" class="second-avatar absolute rounded-full  w-12 h-12 sm:w-16 sm:h-16 object-cover top-7 sm:top-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    <img src="${playerFrame1}" alt="Player Frame" class="absolute w-full -top-3 sm:-top-4 left-0 pointer-events-none z-10" />
                  </div>
                </div>
                <p class="username text-sm text-white font-semibold second-name drop-shadow-[0_0_5px_rgba(255,255,255,0.6)] truncate w-full text-center"></p>
                <p class="score text-pongcyan text-lg second-score drop-shadow-[0_0_8px_rgba(0,247,255,0.6)]"></p>
                <div class="podium bg-silver border-t-2 border-pongcyan w-full h-28 rounded-t-lg shadow-[0_-5px_15px_rgba(0,247,255,0.4)]"></div>
              </div>

              <!-- 1st Place -->
              <div class="first-place w-[40%] flex flex-col items-center gap-0.5 z-10 animate-fade-up animate-once animate-duration-700" style="display: none;">
                <div class="relative">
                  <div class="crown absolute -top-6 left-1/2 transform -translate-x-1/2 text-3xl animate-bounce animate-infinite animate-duration-1000">🥇</div>
                  <div class="avatar-container relative size-28 mb-2 sm:size-32">
                    <img src="/images/avatars/default.jpg" alt="1st Place" class="first-avatar absolute rounded-full w-20 h-20 sm:w-24 sm:h-24 object-cover top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    <img src="${playerFrame}" alt="Player Frame" class="absolute w-full -top-3  sm:-top-4 left-0 pointer-events-none z-10" />
                  </div>
                </div>
                <p class="username text-lg text-white font-bold first-name drop-shadow-[0_0_5px_rgba(255,255,255,0.6)] truncate w-full text-center"></p>
                <p class="score text-pongpink text-xl first-score drop-shadow-[0_0_8px_rgba(255,0,228,0.6)]"></p>
                <div class="podium bg-gold border-t-2 border-pongpink w-full h-40 rounded-t-lg shadow-[0_-5px_15px_rgba(255,0,228,0.4)]"></div>
              </div>
              
              <!-- 3rd Place -->
              <div class="third-place w-[30%] flex flex-col items-center gap-0.5 animate-fade-left animate-once animate-duration-700" style="display: none;">
                <div class="relative">
                  <div class="crown absolute -top-6 left-1/2 transform -translate-x-1/2 text-2xl animate-bounce animate-infinite animate-duration-1000">🥉</div>
                  <div class="avatar-container relative size-16 sm:size-24 mb-2 overflow-hidden">
                    <img src="/images/avatars/default.jpg" alt="3rd Place" class="third-avatar absolute rounded-full  w-12 h-12 sm:w-16 sm:h-16 object-cover top-7 sm:top-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    <img src="${playerFrame2}" alt="Player Frame" class="absolute w-full -top-3 sm:-top-4 left-0 pointer-events-none z-10" />
                  </div>
                </div>
                <p class="username text-sm text-white font-semibold third-name drop-shadow-[0_0_5px_rgba(255,255,255,0.6)] truncate w-full text-center"></p>
                <p class="score text-pongcyan text-lg third-score drop-shadow-[0_0_8px_rgba(0,247,255,0.6)]"></p>
                <div class="podium bg-bronze border-t-2 border-pongcyan w-full h-20 rounded-t-lg shadow-[0_-5px_15px_rgba(0,247,255,0.4)]"></div>
              </div>

              <!-- No Players Placeholder -->
              <div class="no-players w-full flex flex-col items-center gap-4 py-8" style="display: block;">
                <div class="text-center text-pongcyan">
                  <i class="fas fa-trophy text-6xl opacity-30 mb-4"></i>
                  <p class="text-xl font-semibold mb-2">No Players Yet</p>
                  <p class="text-sm opacity-75">Be the first to join the leaderboard!</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Rest of Leaderboard -->
          <div class="leaderboard-table min-w-0 w-full max-h-96 bg-black/60 rounded-xl overflow-y-auto max-w-4xl mx-auto border-2 border-pongcyan shadow-[0_0_20px_rgba(0,247,255,0.4)] animate-fade-up animate-once animate-duration-700 animate-delay-300 scrollbar-thin scrollbar-thumb-pongcyan scrollbar-track-gray-900">
            <table class="relative w-full border-collapse">
                <thead class="sticky top-0 z-10">
                  <tr class="bg-black text-pongcyan text-center text-lg sm:text-xl border-b border-pongcyan/50">
                    <th class="py-3 px-4">${t('leaderBoard.rank')}</th>
                    <th class="py-3 px-6" colspan="2">${t('leaderBoard.player')}</th>
                    <th class="py-3 px-4">${t('leaderBoard.wins')}</th>
                    <th class="py-3 px-4">${t('leaderBoard.score')}</th>
                  </tr>
                </thead>
              <tbody id="leaderboardBody" class="sm:text-lg">
                <!-- Leaderboard rows will be inserted here -->
                <tr>
                  <td colspan="5" class="py-4 text-center text-pongpink">
                    <div class="flex items-center justify-center gap-3">
                      <div class="animate-spin h-5 w-5 border-2 border-pongpink rounded-full border-t-transparent"></div>
                      Loading players...
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div class="footer"></div>
    `;

    // Add header
    const headerNav = container.querySelector(".header");
    const header = Header();
    headerNav?.appendChild(header);

    // Add footer
    const footer = container.querySelector(".footer")!;
    const footerComp = Footer();
    footer.appendChild(footerComp);

    // Fetch leaderboard data
    await fetchAndDisplayLeaderboard();
  },
};

async function fetchAndDisplayLeaderboard() {
  try {
    // Get authentication data
    const token = await getValidAccessToken();
    const userId = store.userId;

    if (!token || !userId) {
      throw new Error('Authentication required');
    }

    // Fetch leaderboard data from backend using axios
    const response = await axios.get(`/matchmaking/api/leaderboard/${userId}`, {
      params: {
        limit: 20
      },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data: LeaderboardResponse = response.data;
    const players = data.leaderboard;

    // Update top 3 players podium display
    updateTopThreePlayers(players.slice(0, 3));

    // Update leaderboard table
    const leaderboardBody = document.getElementById("leaderboardBody");
    if (leaderboardBody) {
      leaderboardBody.innerHTML = "";

      // Display all players in the table
      players.forEach((player) => {
        const row = document.createElement("tr");
        row.className =
          "border-b border-pongcyan/20 hover:bg-pongcyan/10 transition-colors";

        // Use fallbacks for missing data
        const displayName = player.nickname || player.fullName || `Player ${player.id}`;
        const avatarUrl = player.avatarUrl || '/images/avatars/default.jpg';

        row.innerHTML = `
          <td class="py-3 px-4 text-pongcyan text-center font-semibold">${player.rank}</td>
          <td colspan="2" class="py-3 px-6">
            <div class="flex items-center gap-3 w-28 sm:w-auto justify-center sm:justify-start">
              <div class="size-10 rounded-full overflow-hidden border-2 border-pongcyan shadow-[0_0_8px_rgba(0,247,255,0.4)]">
                <img src="${avatarUrl}" alt="${displayName}" class="w-full h-full object-cover" onerror="this.src='/images/avatars/default.jpg'" />
              </div>
              <p class="text-white max-w-[60px] sm:max-w-[120px] text-center truncate" title="${displayName}">${displayName}</p>
            </div>
          </td>
          <td class="py-3 px-4 text-center text-pongpink font-medium">${player.wins}</td>
          <td class="py-3 px-4 text-center text-white font-semibold">${player.eloScore}</td>
        `;

        leaderboardBody.appendChild(row);
      });

      // Show message if no players found
      if (players.length === 0) {
        leaderboardBody.innerHTML = `
          <tr>
            <td colspan="5" class="py-8 text-center text-pongcyan">
              <div class="flex flex-col items-center gap-2">
                <i class="fas fa-trophy text-3xl opacity-50"></i>
                <span class="text-lg">No players found</span>
                <span class="text-sm opacity-75">Be the first to join the leaderboard!</span>
              </div>
            </td>
          </tr>
        `;
      }
    }
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    const leaderboardBody = document.getElementById("leaderboardBody");
    if (leaderboardBody) {
      leaderboardBody.innerHTML = `
        <tr>
          <td colspan="5" class="py-4 text-center text-pongpink">
            <div class="flex flex-col items-center gap-2">
              <i class="fas fa-exclamation-triangle text-2xl"></i>
              <span>Failed to load leaderboard data. Please try again.</span>
              <button onclick="location.reload()" class="mt-2 px-4 py-2 bg-pongcyan text-black rounded hover:bg-pongcyan/80 transition-colors">
                Retry
              </button>
            </div>
          </td>
        </tr>
      `;
    }
  }
}

// Helper function to update top 3 players display
function updateTopThreePlayers(topPlayers: Player[]) {
  // Hide all podium positions initially
  const firstPlace = document.querySelector('.first-place') as HTMLElement;
  const secondPlace = document.querySelector('.second-place') as HTMLElement;
  const thirdPlace = document.querySelector('.third-place') as HTMLElement;
  const noPlayers = document.querySelector('.no-players') as HTMLElement;

  if (topPlayers.length === 0) {
    // Show no players message
    if (firstPlace) firstPlace.style.display = 'none';
    if (secondPlace) secondPlace.style.display = 'none';
    if (thirdPlace) thirdPlace.style.display = 'none';
    if (noPlayers) noPlayers.style.display = 'block';
    return;
  }

  // Hide no players message
  if (noPlayers) noPlayers.style.display = 'none';

  if (topPlayers.length >= 1) {
    const firstPlayer = topPlayers[0];
    const firstName = firstPlayer.nickname || firstPlayer.fullName || `Player ${firstPlayer.id}`;
    const firstAvatar = firstPlayer.avatarUrl || '/images/avatars/default.jpg';

    const firstNameEl = document.querySelector('.first-name') as HTMLElement;
    const firstScoreEl = document.querySelector('.first-score') as HTMLElement;
    const firstAvatarEl = document.querySelector('.first-avatar') as HTMLImageElement;

    if (firstNameEl) firstNameEl.textContent = firstName;
    if (firstScoreEl) firstScoreEl.textContent = firstPlayer.eloScore.toString();
    if (firstAvatarEl) {
      firstAvatarEl.src = firstAvatar;
      firstAvatarEl.alt = firstName;
      firstAvatarEl.onerror = () => { firstAvatarEl.src = '/images/avatars/default.jpg'; };
    }
    if (firstPlace) firstPlace.style.display = 'flex';
  } else {
    if (firstPlace) firstPlace.style.display = 'none';
  }

  if (topPlayers.length >= 2) {
    const secondPlayer = topPlayers[1];
    const secondName = secondPlayer.nickname || secondPlayer.fullName || `Player ${secondPlayer.id}`;
    const secondAvatar = secondPlayer.avatarUrl || '/images/avatars/default.jpg';

    const secondNameEl = document.querySelector('.second-name') as HTMLElement;
    const secondScoreEl = document.querySelector('.second-score') as HTMLElement;
    const secondAvatarEl = document.querySelector('.second-avatar') as HTMLImageElement;

    if (secondNameEl) secondNameEl.textContent = secondName;
    if (secondScoreEl) secondScoreEl.textContent = secondPlayer.eloScore.toString();
    if (secondAvatarEl) {
      secondAvatarEl.src = secondAvatar;
      secondAvatarEl.alt = secondName;
      secondAvatarEl.onerror = () => { secondAvatarEl.src = '/images/avatars/default.jpg'; };
    }
    if (secondPlace) secondPlace.style.display = 'flex';
  } else {
    if (secondPlace) secondPlace.style.display = 'none';
  }

  if (topPlayers.length >= 3) {
    const thirdPlayer = topPlayers[2];
    const thirdName = thirdPlayer.nickname || thirdPlayer.fullName || `Player ${thirdPlayer.id}`;
    const thirdAvatar = thirdPlayer.avatarUrl || '/images/avatars/default.jpg';

    const thirdNameEl = document.querySelector('.third-name') as HTMLElement;
    const thirdScoreEl = document.querySelector('.third-score') as HTMLElement;
    const thirdAvatarEl = document.querySelector('.third-avatar') as HTMLImageElement;

    if (thirdNameEl) thirdNameEl.textContent = thirdName;
    if (thirdScoreEl) thirdScoreEl.textContent = thirdPlayer.eloScore.toString();
    if (thirdAvatarEl) {
      thirdAvatarEl.src = thirdAvatar;
      thirdAvatarEl.alt = thirdName;
      thirdAvatarEl.onerror = () => { thirdAvatarEl.src = '/images/avatars/default.jpg'; };
    }
    if (thirdPlace) thirdPlace.style.display = 'flex';
  } else {
    if (thirdPlace) thirdPlace.style.display = 'none';
  }
}