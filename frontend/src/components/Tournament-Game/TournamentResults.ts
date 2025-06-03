import { t } from "../../languages/LanguageController";

export interface TournamentResult {
    userId: string;
    username: string;
    avatarUrl: string;
    place: number;
    score?: number;
}

const TournamentResults = (results: TournamentResult[] = []) => {
    const resultsElement = document.createElement('div');
    resultsElement.className = 'flex flex-col items-center justify-center gap-4 h-full';

    const topResults = results
        .filter(r => r.place <= 3)
        .sort((a, b) => a.place - b.place);

    const podiumPositions = [
        { place: 2, height: 'h-[50%]', color: 'bg-gray-400', label: t('play.tournaments.TournamentResults.second') },
        { place: 1, height: 'h-[60%]', color: 'bg-yellow-400', label: t('play.tournaments.TournamentResults.first') },
        { place: 3, height: 'h-[40%]', color: 'bg-amber-700', label: t('play.tournaments.TournamentResults.third') }
    ];

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
                avatarHTML = `<div class="w-full h-full flex items-center justify-center text-2xl font-bold text-white drop-shadow-pongcyan">${player.username.charAt(0).toUpperCase()}</div>`;
            }
            
            let scoreHTML = '';
            if (player.score !== undefined) {
                scoreHTML = `<span class="text-sm text-pongpink opacity-80">${player.score} ${t('play.tournaments.createTournament.pts')}</span>`;
            }
            
            playerInfoHTML = `
                <div class="flex flex-col items-center mb-2">
                    <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 mb-2 bg-pongcyan ${position.place === 1 ? 'border-yellow-400 animate-pulse' : position.place === 2 ? 'border-gray-400' : 'border-amber-700'}">
                        ${avatarHTML}
                    </div>
                    <span class="font-medium text-center text-pongcyan break-all max-w-[100px] text-sm">${player.username}</span>
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
            <div class="flex flex-col items-center justify-end w-32 h-full ${position.place === 1 ? 'z-10' : ''}">
                ${playerInfoHTML}
                <div class="w-full ${position.height} ${position.color} rounded-t-lg flex items-center justify-center relative">
                    <span class="absolute top-2 text-lg font-bold text-white">${position.label}</span>
                </div>
            </div>
        `;
    });
    
    let otherPlayersHTML = '';
    if (results.length > 3) {
        const otherPlayers = results.filter(r => r.place > 3);
        
        let playerCardsHTML = '';
        otherPlayers.forEach(player => {
            let avatarHTML = '';
            if (player.avatarUrl) {
                avatarHTML = `
                    <div class="size-8 rounded-full overflow-hidden bg-pongcyan">
                        <img src="${player.avatarUrl}" alt="${player.username}" class="size-full object-cover">
                    </div>
                `;
            }
            
            let scoreHTML = '';
            if (player.score !== undefined) {
                scoreHTML = `<span class="text-sm text-gray-300">${player.score} ${t('play.tournaments.createTournament.pts')}</span>`;
            }
            
            playerCardsHTML += `
                <div class="flex items-center gap-2 p-3 bg-pongcyan text-pongcyan bg-opacity-30 rounded-lg">
					<span class="drop-shadow-pongcyan">${player.place}</span>
                    ${avatarHTML}
                    <span class="flex-1 drop-shadow-pongcyan font-medium text-sm truncate">${player.username}</span>
                    ${scoreHTML}
                </div>
            `;
        });
        
        otherPlayersHTML = `
            <div class="w-full max-w-md flex flex-col gap-2 h-20 overflow-auto">
                ${playerCardsHTML}
            </div>
        `;
    }
    
    // No results message HTML
    let noResultsHTML = '';
    if (results.length === 0) {
        noResultsHTML = `
            <div class="flex flex-col items-center justify-center text-center p-8 bg-pongcyan bg-opacity-20 rounded-lg">
                <div class="text-4xl mb-4">🏆</div>
                <p class="text-lg text-gray-300">No tournament results available yet</p>
                <p class="text-sm text-gray-400 mt-2">Complete the tournament to see the final standings</p>
            </div>
        `;
    }
    
    // Combine all HTML
    resultsElement.innerHTML = `
        <h2 class="text-pongcyan drop-shadow-pongcyan text-2xl font-semibold">${t("play.tournaments.TournamentResults.tournamentResults")}</h2>
        <div class="size-full relative flex flex-1 gap-4 items-end justify-center">
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
