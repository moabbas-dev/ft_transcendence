import TournamentBrackets from "../components/Tournament-Game/TournamentBrackets.js";
import { Header } from "../components/header_footer/header.js";
import { WaitingRoom, renderWaitingRoomSlots } from "../components/Tournament-Game/WaitingRoom.js";
import { TournamentResult, renderResultsTab } from "../components/Tournament-Game/TournamentResults.js";
import { t } from "../languages/LanguageController.js";

export default {
    render: (container: HTMLElement) => {
        container.className = "flex flex-col h-dvh bg-pongdark"
        container.innerHTML = `
            <div class="profile"></div>
            <div class="header bg-bal w-full h-fit"></div>
            <div class="w-full overflow-x-hidden overflow-y-auto">
            <div id="content" class="flex flex-col flex-1 container mx-auto px-4 gap-6 w-full text-white py-6">
                <!-- Tournament Status Bar -->
                <div id="tournament-status" class="bg-gradient-to-r from-pongcyan to-[rgba(100,100,255,0.8)] rounded-lg p-4 shadow-lg">
                    <div class="flex justify-between items-center flex-wrap gap-4">
                        <div class="flex flex-col flex-1 gap-2">
                            <div class="flex flex-wrap items-center gap-2">
                                <h1 id="tournament-name" class="w-[25ch] text-2xl font-bold sm:text-3xl focus:outline focus:outline-1 focus:outline-white rounded-md p-2" contenteditable="true">${t('play.tournaments.createTournament.title')}</h1>
                                <div class="size-fit flex flex-wrap gap-2">
                                    <button id="submit-change-tournament-name" type="submit" class="hidden rounded-full bg-green-700 text-white size-fit text-sm px-2 py-0.5 hover:opacity-80">${t('play.tournaments.createTournament.submitTitle')}</button>
                                    <span id="name-error-message" class="hidden size-fit px-2 py-0.5 text-sm rounded-full bg-red-500 text-white">${t('play.tournaments.createTournament.nameTooshort')}</span>
                                </div>
                            </div>
                            <div class="flex flex-wrap size-fit gap-2">
                                <span id="status-badge" class="px-3 py-1 bg-yellow-600 text-white rounded-full text-sm w-fit">${t('play.tournaments.createTournament.waiting')}</span>
                                <button id="status-badge" class="px-3 py-1 bg-green-600 text-white rounded-xl text-sm w-fit hover:opacity-80 transition-all">${t('play.tournaments.createTournament.launch')}</button>
                            </div>
                        </div>
                        <div class="flex flex-col items-start sm:items-end gap-2">
                            <div class="text-lg font-medium">${t('play.tournaments.createTournament.players')}: <span id="player-count">2</span>/<span id="player-max">4</span></div>
                            
                            <div class="flex gap-4">
                                <!-- 4 Players Radio Button -->
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <div class="relative">
                                        <input type="radio" name="players" value="4" class="sr-only" checked>
                                        <div class="size-4 sm:size-6 border-2 border-gray-200 rounded-full"></div>
                                        <div class="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transform scale-75"></div>
                                    </div>
                                    <span class="max-sm:text-[14px] text-gray-200">4 ${t('play.tournaments.createTournament.players')}</span>
                                </label>
                        
                                <!-- 8 Players Radio Button -->
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <div class="relative">
                                        <input type="radio" name="players" value="8" class="sr-only">
                                        <div class="size-4 sm:size-6 border-2 border-gray-200 rounded-full"></div>
                                        <div class="absolute inset-0 bg-gradient-to-r from-pink-400 to-orange-500 rounded-full transform scale-75"></div>
                                    </div>
                                    <span class="text-gray-200">8 ${t('play.tournaments.createTournament.players')}</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tournament Content Tabs -->
                <div>
                    <div class="flex max-sm:justify-center gap-4 border-b border-pongcyan">
                        <button id="tab-waiting" class="px-2 sm:px-4 py-1 sm:py-2 text-lg font-medium border-b-2 border-pongcyan">${t('play.tournaments.createTournament.waitingRoom')}</button>
                        <button id="tab-bracket" class="px-2 sm:px-4 py-1 sm:py-2 text-lg font-medium text-gray-300">${t('play.tournaments.createTournament.bracket')}</button>
                        <button id="tab-results" class="px-2 sm:px-4 py-1 sm:py-2 text-lg font-medium text-gray-300">${t('play.tournaments.createTournament.results')}</button>
                    </div>
                </div>

                <!-- Content Area -->
                <div id="tab-content" class="flex-1">
                    <!-- Bracket View -->
                    <div id="bracket-content" class="hidden">
                        <div class="flex flex-col items-center justify-center gap-6">
                            <div class="text-2xl font-semibold">${t('play.tournaments.createTournament.tournamentBracket')}</div>
                            <div class="tournament-bracket relative w-full">
                                <!-- Tournament Brackets -->
                            </div>
                        </div>
                        <div class="text-center">
                            <p class="text-sm text-gray-300">${t('play.tournaments.createTournament.info')}</p>
                        </div>
                    </div>
                    
                    <!-- Waiting Room -->
                    <div id="waiting-content" class="block">
                    </div>
                    
                    <!-- Results Tab -->
                    <div id="results-content" class="hidden">
                        <!-- Tournament Results will be rendered here -->
                    </div>
                </div>
                
            </div>
            </div>
        `;

        // Render the header
        const headerElement = document.querySelector('.header');
        headerElement?.appendChild(Header())

        /**
         * Handle Tournament Name Change
         * We must change it in database later
         * submit button will take it to database
         */
        const tournamentName = container.querySelector('#tournament-name')!
        const changeTournamentNameBtn = container.querySelector('#submit-change-tournament-name')!
        const errorMessage = container.querySelector('#name-error-message')!
        let oldTournamentName = tournamentName.textContent!;

        tournamentName.addEventListener('focus', () => {
            changeTournamentNameBtn.classList.remove("hidden");
        })

        container.addEventListener("focusout", (e: Event) => {
            if (!container.contains((e as FocusEvent).relatedTarget as Node)) {
                changeTournamentNameBtn.classList.add("hidden");
            }
        });

        tournamentName.addEventListener('keydown', (e: Event) => {
            const allowedKeys = [
                "Backspace", "Delete", "ArrowLeft", "ArrowRight",
                "ArrowUp", "ArrowDown", "Tab", "Shift", "Home",
                "Control", "Start", "End"
            ];
            const key = (e as KeyboardEvent).key

            const selection = window.getSelection();
            let selectedLength = 0;
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              if (tournamentName.contains(range.commonAncestorContainer)) {
                selectedLength = range.toString().length;
              }
            }

            const currentLength = tournamentName.textContent!.length
            if (currentLength >= 25 && !allowedKeys.includes(key)) {
              if (selectedLength === 0) {
                e.preventDefault();
                return;
              }
            }
        })

        changeTournamentNameBtn.addEventListener("click", () => {
            if (tournamentName.textContent!.length < 3) {
                errorMessage.textContent = t('play.tournaments.createTournament.nameTooshort')
                errorMessage.classList.remove('hidden')
            }
            else if (tournamentName.textContent!.length > 25) {
                errorMessage.textContent = t('play.tournaments.createTournament.nameToolong')
                errorMessage.classList.remove('hidden')
            }
            else if (tournamentName.textContent === oldTournamentName) {
                errorMessage.textContent = 'Name not changed'
                errorMessage.classList.remove('hidden')
            }
            else {
                // here we have to send changes to database
                console.log("Tournament name submitted:", tournamentName.textContent);
                changeTournamentNameBtn.classList.add("hidden");
                oldTournamentName = tournamentName.textContent!
                errorMessage.classList.add('hidden')
            }
        });

        const waitingContent = document.getElementById('waiting-content')!;
        waitingContent.appendChild(WaitingRoom())

        const radioButtons = document.querySelectorAll('input[name="players"]');
        // Function to render the tournament brackets
        function renderTournamentBrackets(playerCount: number) {
            const tournamentContainer = container.querySelector('.tournament-bracket');

            if (tournamentContainer) {
                tournamentContainer.innerHTML = '';

                // Create and append new tournament brackets with the selected player count
                tournamentContainer.appendChild(TournamentBrackets({
                    playersCount: playerCount,
                    onMatchClick: (matchId: string) => {
                        console.log("Match clicked:", matchId);
                        // Your match click handling logic here
                    }
                }));
            }
        }

        // Function to update both tournament and waiting room when player count changes
        function updateTournamentSize(playerCount: number) {
            // Update player max display
            container.querySelector('#player-max')!.textContent = playerCount.toString();

            // Re-render tournament brackets
            renderTournamentBrackets(playerCount);

            // Re-render waiting room slots
            renderWaitingRoomSlots(container, playerCount);
        }

        // Add event listeners to radio buttons
        radioButtons.forEach(button => {
            button.addEventListener('change', (e: Event) => {
                const target = e.currentTarget as HTMLInputElement;
                if (target.checked) {
                    updateTournamentSize(parseInt(target.value));
                    // Here you would typically make an API call to update tournament size
                }
            });
        });

        // Initial render with default player count (4)
        updateTournamentSize(4);

        // Tab switching logic
        const tabBracket = document.getElementById('tab-bracket');
        const tabWaiting = document.getElementById('tab-waiting');
        const tabResults = document.getElementById('tab-results');

        const bracketContent = document.getElementById('bracket-content');
        const resultsContent = document.getElementById('results-content');

        // Function to switch tabs
        function switchTab(activeTab: HTMLElement | null, activeContent: HTMLElement | null) {
            // Reset all tabs
            [tabBracket, tabWaiting, tabResults].forEach(tab => {
                tab?.classList.remove('border-b-2', 'border-pongcyan');
                tab?.classList.add('text-gray-300');
            });

            // Reset all content
            [bracketContent, waitingContent, resultsContent].forEach(content => {
                content?.classList.add('hidden');
                content?.classList.remove('block');
            });

            // Activate selected tab
            activeTab?.classList.remove('text-gray-300');
            activeTab?.classList.add('border-b-2', 'border-pongcyan');

            // Show selected content
            activeContent?.classList.remove('hidden');
            activeContent?.classList.add('block');
        }

        tabBracket?.addEventListener('click', () => switchTab(tabBracket, bracketContent));
        tabWaiting?.addEventListener('click', () => switchTab(tabWaiting, waitingContent));
        tabResults?.addEventListener('click', () => {
            switchTab(tabResults, resultsContent);
            
            // Sample data for testing - replace with actual tournament results from API
            const sampleResults: TournamentResult[] = [
                { userId: '1', username: 'Mohamad', avatarUrl: '', place: 1, score: 25 },
                { userId: '2', username: 'Runner-Up', avatarUrl: '', place: 2, score: 20 },
                { userId: '3', username: 'ThirdPlace', avatarUrl: '', place: 3, score: 15 },
                { userId: '4', username: '4th Player', avatarUrl: '', place: 4, score: 10 },
                { userId: '5', username: '5th Player', avatarUrl: '', place: 5, score: 9 },
                { userId: '6', username: '6th Player', avatarUrl: '', place: 6, score: 7 },
                { userId: '7', username: '7th Player', avatarUrl: '', place: 7, score: 8 },
                { userId: '8', username: '8th Player', avatarUrl: '', place: 8, score: 5 },
            ];
            
            renderResultsTab(container, sampleResults);
        });

        const leaveButton = document.getElementById('leave-tournament');
        leaveButton?.addEventListener('click', () => {
            alert('Leaving tournament...');
        });
    }
};