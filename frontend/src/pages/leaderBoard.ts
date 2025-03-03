import { Header } from "../components/header_footer/header.js";
import { Footer } from "../components/header_footer/footer.js";
import pic1 from "../assets/afarachi.jpg";

interface Player {
  id: number;
  username: string;
  avatar: string;
  wins: number;
  losses: number;
  rank: number;
  score: number;
}

export default {
  render: async (container: HTMLElement) => {
    container.innerHTML = `
      <div class="profile"> </div>
      <div class="header bg-pongblue w-full h-fit"> </div>
      <div class="w-full overflow-x-none bg-pongdark">
        <div class="container mx-auto px-4 py-8">
          <h1 class="text-5xl text-center text-white font-bold mb-8 drop-shadow-[1px_1px_20px_white] animate-fade-down animate-once animate-duration-700 animate-ease-linear">
            Ping-Pong Champions
          </h1>
          
          <!-- Top 3 Players Podium -->
          <div class="top-players grid grid-cols-3 gap-4 mb-12 max-w-3xl mx-auto mt-16">
            <!-- 2nd Place -->
            <div class="second-place mt-14 flex flex-col items-center animate-fade-right animate-once animate-duration-700 animate-ease-linear">
              <div class="relative">
                <div class="crown absolute -top-6 left-1/2 transform -translate-x-1/2 text-2xl animate-bounce animate-infinite animate-duration-1000">🥈</div>
                <div class="avatar-container w-24 h-24 rounded-full overflow-hidden border-4 border-silver shadow-lg mb-2">
                  <img src="${pic1}" alt="2nd Place" class="second-avatar w-full h-full object-cover" />
                </div>
                <div class="rank-badge bg-silver text-white rounded-full w-8 h-8 flex items-center justify-center absolute -bottom-2 -right-2 border-2 border-pongdark font-bold">2</div>
              </div>
              <p class="username text-xl text-white font-semibold mt-2 second-name"></p>
              <p class="score text-silver text-lg second-score"></p>
              <div class="podium bg-silver w-full h-28 mt-2 rounded-t-lg"></div>
            </div>
            
            <!-- 1st Place -->
            <div class="first-place flex flex-col items-center mt-[-30px] z-10 animate-fade-up animate-once animate-duration-700 animate-ease-linear">
              <div class="relative">
                <div class="crown absolute -top-8 left-1/2 transform -translate-x-1/2 text-3xl animate-bounce animate-infinite animate-duration-1000">🥇</div>
                <div class="avatar-container w-32 h-32 rounded-full overflow-hidden border-4 border-gold shadow-lg mb-2">
                  <img src="${pic1}" alt="1st Place" class="first-avatar w-full h-full object-cover" />
                </div>
                <div class="rank-badge bg-gold text-white rounded-full w-10 h-10 flex items-center justify-center absolute -bottom-2 -right-2 border-2 border-pongdark font-bold">1</div>
              </div>
              <p class="username text-2xl text-white font-bold mt-2 first-name"></p>
              <p class="score text-gold text-xl first-score"></p>
              <div class="podium bg-gold w-full h-40 mt-4 rounded-t-lg"></div>
            </div>
            
            <!-- 3rd Place -->
            <div class="third-place flex flex-col items-center mt-20  animate-fade-left animate-once animate-duration-700 animate-ease-linear">
              <div class="relative">
                <div class="crown absolute -top-6 left-1/2 transform -translate-x-1/2 text-2xl animate-bounce animate-infinite animate-duration-1000">🥉</div>
                <div class="avatar-container w-24 h-24 rounded-full overflow-hidden border-4 border-bronze shadow-lg mb-2">
                  <img src="${pic1}" alt="3rd Place" class="third-avatar w-full h-full object-cover" />
                </div>
                <div class="rank-badge bg-bronze text-white rounded-full w-8 h-8 flex items-center justify-center absolute -bottom-2 -right-2 border-2 border-pongdark font-bold">3</div>
              </div>
              <p class="username text-xl text-white font-semibold mt-2 third-name"></p>
              <p class="score text-bronze text-lg third-score"></p>
              <div class="podium bg-bronze w-full h-20 mt-4 rounded-t-lg"></div>
            </div>
          </div>
          
          <!-- Rest of Leaderboard -->
          <div class="leaderboard-table bg-pongblue bg-opacity-20 rounded-xl overflow-hidden max-w-4xl mx-auto shadow-lg animate-fade-up animate-once animate-duration-700 animate-delay-500 animate-ease-linear">
            <table class="w-full">
              <thead>
                <tr class="bg-pongblue text-white">
                  <th class="py-3 px-4 text-left">Rank</th>
                  <th class="py-3 px-4 text-left">Player</th>
                  <th class="py-3 px-4 text-center">Wins</th>
                  <th class="py-3 px-4 text-center">Losses</th>
                  <th class="py-3 px-4 text-right">Score</th>
                </tr>
              </thead>
              <tbody id="leaderboardBody">
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
        losses: 5,
        rank: 1,
        score: 2450,
      },
      {
        id: 2,
        username: "TableTennisKing",
        avatar: "/images/avatars/avatar2.jpg",
        wins: 38,
        losses: 8,
        rank: 2,
        score: 2320,
      },
      {
        id: 3,
        username: "PaddleChamp",
        avatar: "/images/avatars/avatar3.jpg",
        wins: 35,
        losses: 10,
        rank: 3,
        score: 2180,
      },
      {
        id: 4,
        username: "BallWizard",
        avatar: "/images/avatars/avatar4.jpg",
        wins: 30,
        losses: 15,
        rank: 4,
        score: 1950,
      },
      {
        id: 5,
        username: "RallyQueen",
        avatar: "/images/avatars/avatar5.jpg",
        wins: 28,
        losses: 12,
        rank: 5,
        score: 1900,
      },
      {
        id: 6,
        username: "SpinMaster",
        avatar: "/images/avatars/avatar6.jpg",
        wins: 25,
        losses: 15,
        rank: 6,
        score: 1750,
      },
      {
        id: 7,
        username: "ServeKing",
        avatar: "/images/avatars/avatar7.jpg",
        wins: 22,
        losses: 18,
        rank: 7,
        score: 1680,
      },
      {
        id: 8,
        username: "PongProdigy",
        avatar: "/images/avatars/avatar8.jpg",
        wins: 20,
        losses: 20,
        rank: 8,
        score: 1600,
      },
      {
        id: 9,
        username: "SmashQueen",
        avatar: "/images/avatars/avatar9.jpg",
        wins: 18,
        losses: 22,
        rank: 9,
        score: 1520,
      },
      {
        id: 10,
        username: "BackspinKing",
        avatar: "/images/avatars/avatar10.jpg",
        wins: 15,
        losses: 25,
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
          "border-t border-pongblue/30 hover:bg-pongblue/30 transition-colors";

        row.innerHTML = `
          <td class="py-3 px-4 text-white">${player.rank}</td>
          <td class="py-3 px-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full overflow-hidden border-2 border-pongblue">
                <img src="${player.avatar}" alt="${player.username}" class="w-full h-full object-cover" />
              </div>
              <span class="text-white font-medium">${player.username}</span>
            </div>
          </td>
          <td class="py-3 px-4 text-center text-green-400">${player.wins}</td>
          <td class="py-3 px-4 text-center text-red-400">${player.losses}</td>
          <td class="py-3 px-4 text-right text-white font-semibold">${player.score}</td>
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
