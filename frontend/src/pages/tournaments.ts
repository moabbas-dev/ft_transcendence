import { Header } from "../components/header_footer/header.js";

export default {
    render: (container: HTMLElement) => {
        container.className = "flex flex-col h-dvh bg-pongdark"
        container.innerHTML = `
            <div class="profile"></div>
            <div class="header bg-pongblue w-full h-fit"></div>
            <div id="content" class="flex flex-col flex-1 container mx-auto px-2 w-full text-white overflow-x-hidden overflow-y-auto py-6">
                <!-- Tournament Status Bar -->
                <div id="tournament-status" class="bg-gradient-to-r from-pongblue to-[rgba(100,100,255,0.8)] rounded-lg p-4 mb-6 shadow-lg">
                    <div class="flex justify-between items-center flex-wrap gap-4">
                        <div class="flex flex-col">
                            <h1 class="text-2xl font-bold sm:text-3xl">Daily Knockout Tournament</h1>
                            <span id="status-badge" class="px-3 py-1 bg-green-600 text-white rounded-full text-sm w-fit mt-2">Waiting for Players</span>
                        </div>
                        <div class="flex flex-col items-end">
                            <div class="text-lg font-medium">Players: <span id="player-count">2</span>/<span id="player-max">8</span></div>
                            <div id="time-remaining" class="text-sm">Starting in: 3:45</div>
                        </div>
                    </div>
                </div>
                
                <!-- Tournament Content Tabs -->
                <div class="mb-6">
                    <div class="flex border-b border-pongblue">
                        <button id="tab-bracket" class="px-4 py-2 text-lg font-medium border-b-2 border-pongblue">Bracket</button>
                        <button id="tab-waiting" class="px-4 py-2 text-lg font-medium text-gray-300">Waiting Room</button>
                        <button id="tab-history" class="px-4 py-2 text-lg font-medium text-gray-300">Match History</button>
                        <button id="tab-champions" class="px-4 py-2 text-lg font-medium text-gray-300">Champions</button>
                    </div>
                </div>
                
                <!-- Content Area -->
                <div id="tab-content" class="flex-1">
                    <!-- Bracket View -->
                    <div id="bracket-content" class="block">
                        <div class="flex flex-col items-center justify-center">
                            <div class="text-2xl font-semibold mb-6">Tournament Bracket</div>
                            <div class="tournament-bracket relative w-full overflow-x-auto pb-8">
                                <svg id="bracket-svg" width="900" height="500" class="mx-auto">
                                    <!-- SVG bracket will be generated here -->
                                    <g id="tournament-lines">
                                        <!-- Quarter Finals - 8 player format -->
                                        <line x1="80" y1="90" x2="200" y2="90" stroke="#6464FF" stroke-width="2" />
                                        <line x1="80" y1="170" x2="200" y2="170" stroke="#6464FF" stroke-width="2" />
                                        <line x1="200" y1="90" x2="200" y2="170" stroke="#6464FF" stroke-width="2" />
                                        <line x1="200" y1="130" x2="320" y2="130" stroke="#6464FF" stroke-width="2" />
                                        
                                        <line x1="80" y1="250" x2="200" y2="250" stroke="#6464FF" stroke-width="2" />
                                        <line x1="80" y1="330" x2="200" y2="330" stroke="#6464FF" stroke-width="2" />
                                        <line x1="200" y1="250" x2="200" y2="330" stroke="#6464FF" stroke-width="2" />
                                        <line x1="200" y1="290" x2="320" y2="290" stroke="#6464FF" stroke-width="2" />
                                        
                                        <!-- Semi Finals -->
                                        <line x1="320" y1="130" x2="320" y2="290" stroke="#6464FF" stroke-width="2" />
                                        <line x1="320" y1="210" x2="440" y2="210" stroke="#6464FF" stroke-width="2" />
                                        
                                        <!-- Finals placeholder line for winner -->
                                        <line x1="440" y1="210" x2="560" y2="210" stroke="#6464FF" stroke-width="2" stroke-dasharray="5,5" />
                                    </g>
                                    
                                    <!-- Match nodes -->
                                    <g id="match-nodes">
                                        <!-- Quarter Finals - Match 1 -->
                                        <rect x="20" y="70" width="60" height="40" rx="5" fill="rgba(100,100,255,0.2)" stroke="#6464FF" />
                                        <text x="50" y="94" text-anchor="middle" fill="white" font-size="12">Player 1</text>
                                        
                                        <!-- Quarter Finals - Match 1 opponent -->
                                        <rect x="20" y="150" width="60" height="40" rx="5" fill="rgba(100,100,255,0.2)" stroke="#6464FF" />
                                        <text x="50" y="174" text-anchor="middle" fill="white" font-size="12">Player 2</text>
                                        
                                        <!-- Quarter Finals - Match 2 -->
                                        <rect x="20" y="230" width="60" height="40" rx="5" fill="rgba(100,100,255,0.2)" stroke="#6464FF" />
                                        <text x="50" y="254" text-anchor="middle" fill="white" font-size="12">Player 3</text>
                                        
                                        <!-- Quarter Finals - Match 2 opponent -->
                                        <rect x="20" y="310" width="60" height="40" rx="5" fill="rgba(100,100,255,0.2)" stroke="#6464FF" />
                                        <text x="50" y="334" text-anchor="middle" fill="white" font-size="12">Player 4</text>
                                        
                                        <!-- Semi Finals Nodes -->
                                        <rect x="320" y="110" width="60" height="40" rx="5" fill="rgba(100,100,255,0.3)" stroke="#6464FF" />
                                        <text x="350" y="134" text-anchor="middle" fill="white" font-size="12">TBD</text>
                                        
                                        <rect x="320" y="270" width="60" height="40" rx="5" fill="rgba(100,100,255,0.3)" stroke="#6464FF" />
                                        <text x="350" y="294" text-anchor="middle" fill="white" font-size="12">TBD</text>
                                        
                                        <!-- Finals Node -->
                                        <rect x="440" y="190" width="60" height="40" rx="5" fill="rgba(100,100,255,0.4)" stroke="#6464FF" />
                                        <text x="470" y="214" text-anchor="middle" fill="white" font-size="12">TBD</text>
                                        
                                        <!-- Champion Node -->
                                        <rect x="560" y="190" width="100" height="40" rx="20" fill="rgba(255,215,0,0.3)" stroke="gold" stroke-width="2" />
                                        <text x="610" y="214" text-anchor="middle" fill="white" font-size="12">Champion</text>
                                    </g>
                                </svg>
                                <div class="text-center mt-6">
                                    <p class="text-sm text-gray-300">Match duration: 10 minutes or first to 10 goals</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Waiting Room -->
                    <div id="waiting-content" class="hidden">
                        <div class="flex flex-col">
                            <div class="text-2xl font-semibold mb-6">Waiting Room</div>
                            <div class="bg-[rgba(100,100,255,0.1)] rounded-lg p-4">
                                <div class="mb-4 flex justify-between items-center">
                                    <div class="text-lg font-medium">Current Players</div>
                                    <div class="text-sm text-gray-300">Tournament starts when 8 players join or timer ends</div>
                                </div>
                                <div id="waiting-players" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                    <!-- Player Cards -->
                                    <div class="bg-[rgba(100,100,255,0.2)] p-4 rounded-lg flex items-center justify-between">
                                        <div class="flex items-center">
                                            <div class="size-10 rounded-full bg-pongblue mr-3"></div>
                                            <div>
                                                <div class="font-medium">Player 1</div>
                                                <div class="text-sm text-gray-300">Rank: Gold</div>
                                            </div>
                                        </div>
                                        <div class="bg-green-600 px-2 py-1 rounded text-xs">Ready</div>
                                    </div>
                                    
                                    <div class="bg-[rgba(100,100,255,0.2)] p-4 rounded-lg flex items-center justify-between">
                                        <div class="flex items-center">
                                            <div class="size-10 rounded-full bg-pongblue mr-3"></div>
                                            <div>
                                                <div class="font-medium">Player 2</div>
                                                <div class="text-sm text-gray-300">Rank: Silver</div>
                                            </div>
                                        </div>
                                        <div class="bg-green-600 px-2 py-1 rounded text-xs">Ready</div>
                                    </div>
                                    
                                    <!-- Empty slots -->
                                    <div class="border-2 border-dashed border-[rgba(100,100,255,0.3)] p-4 rounded-lg flex items-center justify-center">
                                        <div class="text-[rgba(255,255,255,0.5)]">Waiting for player...</div>
                                    </div>
                                    
                                    <div class="border-2 border-dashed border-[rgba(100,100,255,0.3)] p-4 rounded-lg flex items-center justify-center">
                                        <div class="text-[rgba(255,255,255,0.5)]">Waiting for player...</div>
                                    </div>
                                    
                                    <div class="border-2 border-dashed border-[rgba(100,100,255,0.3)] p-4 rounded-lg flex items-center justify-center">
                                        <div class="text-[rgba(255,255,255,0.5)]">Waiting for player...</div>
                                    </div>
                                    
                                    <div class="border-2 border-dashed border-[rgba(100,100,255,0.3)] p-4 rounded-lg flex items-center justify-center">
                                        <div class="text-[rgba(255,255,255,0.5)]">Waiting for player...</div>
                                    </div>
                                    
                                    <div class="border-2 border-dashed border-[rgba(100,100,255,0.3)] p-4 rounded-lg flex items-center justify-center">
                                        <div class="text-[rgba(255,255,255,0.5)]">Waiting for player...</div>
                                    </div>
                                    
                                    <div class="border-2 border-dashed border-[rgba(100,100,255,0.3)] p-4 rounded-lg flex items-center justify-center">
                                        <div class="text-[rgba(255,255,255,0.5)]">Waiting for player...</div>
                                    </div>
                                </div>
                                
                                <div class="mt-6 flex justify-between">
                                    <button id="leave-tournament" class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg">Leave Tournament</button>
                                    <div class="flex gap-2 items-center">
                                        <span class="text-sm">Tournament Size:</span>
                                        <select id="tournament-size" class="bg-[rgba(100,100,255,0.2)] border border-pongblue rounded px-2 py-1">
                                            <option value="4">4 Players</option>
                                            <option value="8" selected>8 Players</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Match History -->
                    <div id="history-content" class="hidden">
                        <div class="flex flex-col">
                            <div class="text-2xl font-semibold mb-6">Match History</div>
                            <div class="bg-[rgba(100,100,255,0.1)] rounded-lg p-4">
                                <table class="w-full">
                                    <thead>
                                        <tr class="text-left border-b border-[rgba(100,100,255,0.3)]">
                                            <th class="pb-2">Match</th>
                                            <th class="pb-2">Players</th>
                                            <th class="pb-2">Score</th>
                                            <th class="pb-2">Stage</th>
                                            <th class="pb-2">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody id="match-history-table">
                                        <tr class="border-b border-[rgba(100,100,255,0.2)]">
                                            <td class="py-3">Match 1</td>
                                            <td>Player 1 vs Player 2</td>
                                            <td>10 - 5</td>
                                            <td>Quarter Final</td>
                                            <td>7:23</td>
                                        </tr>
                                        <tr class="border-b border-[rgba(100,100,255,0.2)]">
                                            <td class="py-3">Match 2</td>
                                            <td>Player 3 vs Player 4</td>
                                            <td>8 - 10</td>
                                            <td>Quarter Final</td>
                                            <td>9:15</td>
                                        </tr>
                                        <tr class="text-[rgba(255,255,255,0.5)] border-b border-[rgba(100,100,255,0.2)]">
										<tr class="text-[rgba(255,255,255,0.5)] border-b border-[rgba(100,100,255,0.2)]">
                                            <td class="py-3">Match 3</td>
                                            <td>TBD vs TBD</td>
                                            <td>- - -</td>
                                            <td>Semi Final</td>
                                            <td>Pending</td>
                                        </tr>
                                        <tr class="text-[rgba(255,255,255,0.5)]">
                                            <td class="py-3">Match 4</td>
                                            <td>TBD vs TBD</td>
                                            <td>- - -</td>
                                            <td>Final</td>
                                            <td>Pending</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Champions -->
                    <div id="champions-content" class="hidden">
                        <div class="flex flex-col">
                            <div class="text-2xl font-semibold mb-6">Tournament Champions</div>
                            <div class="bg-[rgba(100,100,255,0.1)] rounded-lg p-4">
                                <div class="mb-4">
                                    <div class="text-lg font-medium">Previous Winners</div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <!-- Champion Cards -->
                                    <div class="bg-[rgba(255,215,0,0.1)] border border-[rgba(255,215,0,0.3)] p-4 rounded-lg">
                                        <div class="flex items-center mb-2">
                                            <div class="size-12 rounded-full bg-pongblue mr-3"></div>
                                            <div>
                                                <div class="font-bold text-lg">ChamptionGamer42</div>
                                                <div class="text-sm text-gray-300">March 14, 2025</div>
                                            </div>
                                        </div>
                                        <div class="text-sm">
                                            <div class="flex justify-between mb-1">
                                                <span>Tournament Size:</span>
                                                <span>8 Players</span>
                                            </div>
                                            <div class="flex justify-between mb-1">
                                                <span>Matches Won:</span>
                                                <span>3</span>
                                            </div>
                                            <div class="flex justify-between">
                                                <span>Final Score:</span>
                                                <span>10-7</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="bg-[rgba(255,215,0,0.1)] border border-[rgba(255,215,0,0.3)] p-4 rounded-lg">
                                        <div class="flex items-center mb-2">
                                            <div class="size-12 rounded-full bg-pongblue mr-3"></div>
                                            <div>
                                                <div class="font-bold text-lg">PongMaster99</div>
                                                <div class="text-sm text-gray-300">March 13, 2025</div>
                                            </div>
                                        </div>
                                        <div class="text-sm">
                                            <div class="flex justify-between mb-1">
                                                <span>Tournament Size:</span>
                                                <span>8 Players</span>
                                            </div>
                                            <div class="flex justify-between mb-1">
                                                <span>Matches Won:</span>
                                                <span>3</span>
                                            </div>
                                            <div class="flex justify-between">
                                                <span>Final Score:</span>
                                                <span>10-8</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="bg-[rgba(255,215,0,0.1)] border border-[rgba(255,215,0,0.3)] p-4 rounded-lg">
                                        <div class="flex items-center mb-2">
                                            <div class="size-12 rounded-full bg-pongblue mr-3"></div>
                                            <div>
                                                <div class="font-bold text-lg">TableTennis_Pro</div>
                                                <div class="text-sm text-gray-300">March 12, 2025</div>
                                            </div>
                                        </div>
                                        <div class="text-sm">
                                            <div class="flex justify-between mb-1">
                                                <span>Tournament Size:</span>
                                                <span>4 Players</span>
                                            </div>
                                            <div class="flex justify-between mb-1">
                                                <span>Matches Won:</span>
                                                <span>2</span>
                                            </div>
                                            <div class="flex justify-between">
                                                <span>Final Score:</span>
                                                <span>10-6</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mt-6">
                                    <button id="view-more-champions" class="px-4 py-2 bg-[rgba(100,100,255,0.3)] hover:bg-[rgba(100,100,255,0.4)] rounded-lg w-full">View More Champions</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Tournament Actions -->
                <div class="mt-8">
                    <div class="bg-[rgba(100,100,255,0.1)] rounded-lg p-4">
                        <div class="flex justify-between items-center">
                            <div class="text-lg font-medium">Tournament Actions</div>
                            <div class="flex gap-4">
                                <button id="refresh-tournament" class="px-4 py-2 bg-[rgba(100,100,255,0.3)] hover:bg-[rgba(100,100,255,0.4)] rounded-lg flex items-center">
                                    <span class="material-icons mr-1">refresh</span> Refresh
                                </button>
                                <button id="join-tournament" class="px-4 py-2 bg-pongblue hover:bg-[rgba(100,100,255,0.8)] rounded-lg">Join Tournament</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Render the header
        const headerElement = document.querySelector('.header');
        headerElement?.appendChild(Header())

        // // Render the profile
        // const profileElement = document.querySelector('.profile');
        // // ProfileComponent.render(profileElement);

        // Tab switching logic
        const tabBracket = document.getElementById('tab-bracket');
        const tabWaiting = document.getElementById('tab-waiting');
        const tabHistory = document.getElementById('tab-history');
        const tabChampions = document.getElementById('tab-champions');

        const bracketContent = document.getElementById('bracket-content');
        const waitingContent = document.getElementById('waiting-content');
        const historyContent = document.getElementById('history-content');
        const championsContent = document.getElementById('champions-content');

        // Function to switch tabs
        function switchTab(activeTab: HTMLElement | null, activeContent: HTMLElement | null) {
            // Reset all tabs
            [tabBracket, tabWaiting, tabHistory, tabChampions].forEach(tab => {
                tab?.classList.remove('border-b-2', 'border-pongblue');
                tab?.classList.add('text-gray-300');
            });
            
            // Reset all content
            [bracketContent, waitingContent, historyContent, championsContent].forEach(content => {
                content?.classList.add('hidden');
                content?.classList.remove('block');
            });
            
            // Activate selected tab
            activeTab?.classList.remove('text-gray-300');
            activeTab?.classList.add('border-b-2', 'border-pongblue');
            
            // Show selected content
            activeContent?.classList.remove('hidden');
            activeContent?.classList.add('block');
        }

        // Add event listeners to tabs
        tabBracket?.addEventListener('click', () => switchTab(tabBracket, bracketContent));
        tabWaiting?.addEventListener('click', () => switchTab(tabWaiting, waitingContent));
        tabHistory?.addEventListener('click', () => switchTab(tabHistory, historyContent));
        tabChampions?.addEventListener('click', () => switchTab(tabChampions, championsContent));

        // Tournament actions
        const joinButton = document.getElementById('join-tournament');
        const leaveButton = document.getElementById('leave-tournament');
        const refreshButton = document.getElementById('refresh-tournament');
        const tournamentSizeSelect = document.getElementById('tournament-size');

        joinButton?.addEventListener('click', () => {
            // Simulate joining tournament
            alert('Joining tournament...');
            // Here you would typically make an API call to join the tournament
            // Then update the UI to show the player in the waiting room
        });

        leaveButton?.addEventListener('click', () => {
            // Simulate leaving tournament
            alert('Leaving tournament...');
            // Here you would typically make an API call to leave the tournament
        });

        refreshButton?.addEventListener('click', () => {
            // Simulate refreshing tournament data
            const loadingElement = document.createElement('div');
            loadingElement.id = 'loading-overlay';
            loadingElement.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            loadingElement.innerHTML = `<div class="text-white text-xl">Refreshing tournament data...</div>`;
            document.body.appendChild(loadingElement);
            
            // Simulate API call delay
            setTimeout(() => {
                document.body.removeChild(loadingElement);
                alert('Tournament data refreshed');
            }, 1000);
        });

tournamentSizeSelect?.addEventListener('change', (e:Event) => {
	const size = (e.target as HTMLInputElement).value;
	document.getElementById('player-max')!.textContent = size;
	// Here you would typically make an API call to update tournament size
});

        // Tournament countdown timer
        function updateTimer() {
            const timerElement = document.getElementById('time-remaining')!;
            const currentText = timerElement.textContent!;
            const match = currentText.match(/(\d+):(\d+)/);
            
            if (match) {
                let minutes = parseInt(match[1]);
                let seconds = parseInt(match[2]);
                
                seconds--;
                
                if (seconds < 0) {
                    seconds = 59;
                    minutes--;
                }
                
                if (minutes < 0) {
                    timerElement.textContent = "Starting now!";
                    // Here you would trigger the tournament start logic
                    return;
                }
                
                timerElement.textContent = `Starting in: ${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }

        // Start the countdown timer
        const timerInterval = setInterval(updateTimer, 1000);

        // Clean up function
        return () => {
            clearInterval(timerInterval);
        };
    }
};