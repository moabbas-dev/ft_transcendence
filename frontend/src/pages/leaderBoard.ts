import { Header } from "../components/header_footer/header.js";
import pic1 from "../assets/p11.jpg";
import pic2 from "../assets/p10.jpg";
import pic3 from "../assets/p12.jpg";

import playerFrame from "../assets/g7.webp";
import playerFrame1 from "../assets/g6.webp";
import playerFrame2 from "../assets/g5.webp";
import { Footer } from "../components/header_footer/footer.js";

interface Player {
  id: number;
  username: string;
  avatar: string;
  wins: number;
  rank: number;
  score: number;
}

export default {
  render: async (container: HTMLElement) => {
    container.innerHTML = `
      <div class="profile"> </div>
      <div class="header bg-pongblue w-full h-fit sticky top-0 z-50"> </div>
      <div class="w-full overflow-x-none bg-pongdark">
        <div class="container mx-auto px-4 py-8 flex flex-col gap-4">
          <div class="flex flex-col gap-10">
            <h1 class="text-5xl text-center text-white font-bold drop-shadow-[1px_1px_20px_white] animate-fade-down animate-once animate-duration-700 animate-ease-linear">
              <span class="max-sm:hidden">Ping-</span>Pong Champions
            </h1>
            
            <!-- Top 3 Players Podium -->
            <div class="top-players flex items-end justify-center gap-4 min-w-0 w-full max-w-4xl mx-auto">
              <!-- 2nd Place -->
              <div class="second-place w-[30%] flex flex-col items-center gap-0.5 animate-fade-right animate-once animate-duration-700 animate-ease-linear">
                <div class="relative">
                  <div class="crown absolute -top-3 left-1/2 transform -translate-x-1/2 text-2xl animate-bounce animate-infinite animate-duration-1000">🥈</div>
                  <div class="avatar-container relative size-16 sm:size-24 overflow-hidden">
                    <img src="${pic2}" alt="2nd Place" class="second-avatar rounded-full absolute size-16 object-cover top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    <img src="${playerFrame1}" alt="Player Frame" class="absolute w-full h-full top-0 left-0 pointer-events-none z-10" />
                  </div>
                  <div class="rank-badge bg-silver text-white rounded-full w-8 h-8 flex items-center justify-center absolute -bottom-2 -right-2 border-2 border-pongdark font-bold">2</div>
                </div>
                <p class="username text-xl text-white font-semibold second-name"></p>
                <p class="score text-silver text-lg second-score"></p>
                <div class="podium bg-silver w-full h-28 rounded-t-lg"></div>
              </div>

              <!-- 1st Place -->
              <div class="first-place w-[40%] flex flex-col items-center gap-0.5 z-10 animate-fade-up animate-once animate-duration-700 animate-ease-linear">
                <div class="relative">
                  <div class="crown absolute -top-6 left-1/2 transform -translate-x-1/2 text-3xl animate-bounce animate-infinite animate-duration-1000">🥇</div>
                  <div class="avatar-container relative size-28 sm:size-32">
                    <img src="${pic1}" alt="1st Place" class="first-avatar absolute rounded-full w-24 h-24 object-cover top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    <img src="${playerFrame}" alt="Player Frame" class="absolute w-full h-full top-0 left-0 pointer-events-none z-10" />
                  </div>
                  <div class="rank-badge bg-gold text-white rounded-full size-10 flex items-center justify-center absolute -bottom-2 -right-2 border-2 border-pongdark font-bold">1</div>
                </div>
                <p class="username text-2xl text-white font-bold first-name"></p>
                <p class="score text-gold text-xl first-score"></p>
                <div class="podium bg-gold w-full h-40 rounded-t-lg"></div>
              </div>
              
              <!-- 3rd Place -->
              <div class="third-place w-[30%] flex flex-col items-center gap-0.5 animate-fade-left animate-once animate-duration-700 animate-ease-linear">
                <div class="relative">
                  <div class="crown absolute -top-3 left-1/2 transform -translate-x-1/2 text-2xl animate-bounce animate-infinite animate-duration-1000">🥉</div>
                  <div class="avatar-container relative size-16 sm:size-24 overflow-hidden">
                    <img src="${pic3}" alt="2nd Place" class="second-avatar rounded-full border-2 border-bronze absolute size-16 object-cover top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    <img src="${playerFrame2}" alt="Player Frame" class="absolute w-full h-full top-0 left-0 pointer-events-none z-10" />
                  </div>
                  <div class="rank-badge bg-bronze text-white rounded-full w-8 h-8 flex items-center justify-center absolute -bottom-2 -right-2 border-2 border-pongdark font-bold">3</div>
                </div>
                <p class="username text-2xl text-white font-bold first-name"></p>
                <p class="score text-gold text-xl first-score"></p>
                <div class="podium bg-bronze w-full h-20 rounded-t-lg"></div>
              </div>
            </div>
          </div>
          <!-- Rest of Leaderboard -->
          <div class="leaderboard-table min-w-0 w-full max-h-96 bg-pongblue bg-opacity-20 rounded-xl overflow-y-auto max-w-4xl mx-auto shadow-lg scrollbar-thin scrollbar-thumb-[#0f6292] scrollbar-track-gray-700">
            <table class="w-full overflow-hidden">
                <thead>
                  <tr class="bg-pongblue text-white text-center text-lg sm:text-xl">
                    <th class="py-3 px-4">Rank</th>
                    <th class="py-3 px-4" colspan="2">Player</th>
                    <th class="py-3 px-4">Wins</th>
                    <th class="py-3 px-4">Score</th>
                  </tr>
                </thead>
              <tbody id="leaderboardBody" class="sm:text-lg">
                <!-- Leaderboard rows will be inserted here -->
                <tr>
                  <td colspan="5" class="py-4 text-center text-white">Loading players...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="footer"> </div>
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
    // Simulated data - replace with actual API fetch
    const players: Player[] = [
      {
        id: 1,
        username: "PongMaster",
        avatar: "/images/avatars/avatar1.jpg",
        wins: 42,
        rank: 1,
        score: 2450,
      },
      {
        id: 2,
        username: "TableTennisKing",
        avatar: "/images/avatars/avatar2.jpg",
        wins: 38,
        rank: 2,
        score: 2320,
      },
      {
        id: 3,
        username: "PaddleChamp",
        avatar: "/images/avatars/avatar3.jpg",
        wins: 35,
        rank: 3,
        score: 2180,
      },
      {
        id: 4,
        username: "BallWizard",
        avatar: "/images/avatars/avatar4.jpg",
        wins: 30,
        rank: 4,
        score: 1950,
      },
      {
        id: 5,
        username: "RallyQueen",
        avatar: "/images/avatars/avatar5.jpg",
        wins: 28,
        rank: 5,
        score: 1900,
      },
      {
        id: 6,
        username: "SpinMaster",
        avatar: "/images/avatars/avatar6.jpg",
        wins: 25,
        rank: 6,
        score: 1750,
      },
      {
        id: 7,
        username: "ServeKing",
        avatar: "/images/avatars/avatar7.jpg",
        wins: 22,
        rank: 7,
        score: 1680,
      },
      {
        id: 8,
        username: "PongProdigy",
        avatar: "/images/avatars/avatar8.jpg",
        wins: 20,
        rank: 8,
        score: 1600,
      },
      {
        id: 9,
        username: "SmashQueen",
        avatar: "/images/avatars/avatar9.jpg",
        wins: 18,
        rank: 9,
        score: 1520,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        rank: 10,
        score: 1450,
      },
    ];

    // Update top 3 players podium
    // updateTopThreePlayers(players.slice(0, 3));

    // Update leaderboard table
    const leaderboardBody = document.getElementById("leaderboardBody");
    if (leaderboardBody) {
      leaderboardBody.innerHTML = "";

      // Skip the first 3 players (already shown in podium)
      players.slice(3).forEach((player) => {
        const row = document.createElement("tr");
        row.className =
          "w-full border-t border-pongblue/30 hover:bg-pongblue/30 transition-colors";

        row.innerHTML = `
          <td class="py-3 px-4 text-white text-center">${player.rank}</td>
          <td colspan="2" class="py-3 px-4 text-center">
            <div class="flex items-center justify-center ">
              <div class="size-10 rounded-full overflow-hidden border-2 border-pongblue">
                <img src="${player.avatar}" alt="${player.username}" class="w-full h-full object-cover" />
              </div>
              <p class="text-white w-[15ch] truncate text-center">${player.username}</p>
            </div>
          </td>
          <td class="py-3 px-4 text-center text-green-400">${player.wins}</td>
          <td class="py-3 px-4 text-center text-white font-semibold">${player.score}</td>
        `;
        

        leaderboardBody.appendChild(row);
      });
    }
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    const leaderboardBody = document.getElementById("leaderboardBody");
    if (leaderboardBody) {
      leaderboardBody.innerHTML = `
        <tr>
          <td colspan="5" class="py-4 text-center text-red-400">
            Failed to load leaderboard data. Please try again.
          </td>
        </tr>
      `;
    }
  }
}
