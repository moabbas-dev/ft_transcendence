// Define the TournamentResult interface
export interface TournamentResult {
    userId: string;
    username: string;
    avatarUrl: string;
    place: number;
    score?: number;
}

// Create a Results component
const TournamentResults = (results: TournamentResult[] = []) => {
    const resultsElement = document.createElement('div');
    resultsElement.className = 'flex flex-col items-center justify-center gap-4';

    // Filter results for top 3 and ensure they're sorted
    const topResults = results
        .filter(r => r.place <= 3)
        .sort((a, b) => a.place - b.place);

    // Define podium positions [Testing purposes]
    const podiumPositions = [
        { place: 2, height: 'h-40', color: 'bg-gray-300', label: '2nd' },
        { place: 1, height: 'h-52', color: 'bg-yellow-400', label: '1st' },
        { place: 3, height: 'h-32', color: 'bg-amber-700', label: '3rd' }
    ];

    // Create HTML structure for podium
    let podiumHTML = '';
    podiumPositions.forEach(position => {
        const player = topResults.find(r => r.place === position.place);
        
        let playerInfoHTML = '';
        if (player) {
            // Avatar HTML
            let avatarHTML = '';
            if (player.avatarUrl) {
                avatarHTML = `<img src="${player.avatarUrl}" alt="${player.username}" class="w-full h-full object-cover">`;
            } else {
                avatarHTML = `<div class="w-full h-full flex items-center justify-center text-2xl font-bold text-white">${player.username.charAt(0).toUpperCase()}</div>`;
            }
            
            // Score HTML if available
            let scoreHTML = '';
            if (player.score !== undefined) {
                scoreHTML = `<span class="text-sm opacity-80">${player.score} pts</span>`;
            }
            
            playerInfoHTML = `
                <div class="flex flex-col items-center mb-2">
                    <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-white mb-2 bg-pongblue">
                        ${avatarHTML}
                    </div>
                    <span class="font-medium text-center break-all max-w-[100px] text-sm">${player.username}</span>
                    ${scoreHTML}
                </div>
            `;
        } else {
            playerInfoHTML = `
                <div class="flex flex-col items-center mb-2">
                    <div class="w-16 h-16 rounded-full bg-gray-700 opacity-50 mb-2"></div>
                    <span class="text-sm text-gray-400">Empty</span>
                </div>
            `;
        }
        
        podiumHTML += `
            <div class="flex flex-col items-center w-32 ${position.place === 1 ? 'z-10' : ''}">
                ${playerInfoHTML}
                <div class="w-full ${position.height} ${position.color} rounded-t-lg flex items-center justify-center relative">
                    <span class="absolute top-2 text-lg font-bold text-white">${position.label}</span>
                </div>
            </div>
        `;
    });
    
    // Other players HTML
    let otherPlayersHTML = '';
    if (results.length > 3) {
        const otherPlayers = results.filter(r => r.place > 3);
        
        let playerCardsHTML = '';
        otherPlayers.forEach(player => {
            // Avatar HTML
            let avatarHTML = '';
            if (player.avatarUrl) {
                avatarHTML = `
                    <div class="w-8 h-8 rounded-full overflow-hidden mr-3 bg-pongblue">
                        <img src="${player.avatarUrl}" alt="${player.username}" class="w-full h-full object-cover">
                    </div>
                `;
            }
            
            // Score HTML if available
            let scoreHTML = '';
            if (player.score !== undefined) {
                scoreHTML = `<span class="text-sm text-gray-300">${player.score} pts</span>`;
            }
            
            playerCardsHTML += `
                <div class="flex items-center gap-2 p-3 bg-pongblue bg-opacity-30 rounded-lg">
					<span>${player.place}</span>
                    <span class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 font-medium">${player.place}</span>
                    ${avatarHTML}
                    <span class="flex-1 font-medium text-sm truncate">${player.username}</span>
                    ${scoreHTML}
                </div>
            `;
        });
        
        otherPlayersHTML = `
            <div class="w-full max-w-md flex flex-col gap-2">
                ${playerCardsHTML}
            </div>
        `;
    }
    
    // No results message HTML
    let noResultsHTML = '';
    if (results.length === 0) {
        noResultsHTML = `
            <div class="flex flex-col items-center justify-center text-center p-8 bg-pongblue bg-opacity-20 rounded-lg">
                <div class="text-4xl mb-4">🏆</div>
                <p class="text-lg text-gray-300">No tournament results available yet</p>
                <p class="text-sm text-gray-400 mt-2">Complete the tournament to see the final standings</p>
            </div>
        `;
    }
    
    // Combine all HTML
    resultsElement.innerHTML = `
        <h2 class="text-2xl font-semibold">Tournament Results</h2>
        <div class="relative flex gap-4 items-end justify-center w-full h-fit">
            ${podiumHTML}
        </div>
        ${otherPlayersHTML}
        ${noResultsHTML}
    `;
    
    return resultsElement;
};

// Function to render the results tab
export const renderResultsTab = (container: HTMLElement, results: TournamentResult[] = []) => {
    const resultsContent = container.querySelector('#results-content');
    if (resultsContent) {
        resultsContent.innerHTML = '';
        resultsContent.appendChild(TournamentResults(results));
    }
};
