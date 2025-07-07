import { createComponent } from "../../utils/StateManager.js";
import { t } from "../../languages/LanguageController.js";

interface Player {
  id: string;
  username: string;
  avatar?: string;
}

interface Match {
  id: string;
  round: number;
  position: number;
  player1?: Player;
  player2?: Player;
  winner?: Player;
  score1?: number;
  score2?: number;
  isCompleted: boolean;
}

interface TournamentBracketsProps {
  playersCount: number;
  matches?: Match[];
  onMatchClick?: (matchId: string) => void;
}

const TournamentBrackets = createComponent((props: TournamentBracketsProps) => {
  const {
    playersCount = 4,
    matches = [],
    onMatchClick
  } = props;

  const rounds = Math.log2(playersCount);

  const matchWidth = 220;
  const matchHeight = 150;
  const matchSpacing = 18;
  const roundSpacing = 80;
  const connectorColor = "#CBD5E0";

  const initializedMatches = matches.length > 0 ? matches : generateEmptyBracket(playersCount);

  function generateEmptyBracket(playerCount: number): Match[] {
    const result: Match[] = [];
    const roundCount = Math.log2(playerCount);

    for (let round = 0; round < roundCount; round++) {
      const matchesInRound = Math.pow(2, roundCount - round - 1);

      for (let position = 0; position < matchesInRound; position++) {
        result.push({
          id: `match-${round}-${position}`,
          round,
          position,
          isCompleted: false
        });
      }
    }
    return result;
  }

  function getMatchesByRound(round: number): Match[] {
    return initializedMatches.filter(match => match.round === round);
  }

  function renderPlayer(player?: Player, score?: number, isWinner: boolean = false) {
    return `
      <div class="flex items-center justify-between p-2 ${isWinner ? 'bg-green-50 border-l-4 border-green-500' : 'bg-gray-50'} rounded">
        <div class="flex items-center gap-2">
          ${player?.avatar ?
        `<div class="size-7 rounded-full overflow-hidden">
                <img src="${player.avatar}" alt="${player.username}" class="w-full h-full object-cover" />
              </div>` :
        `<div class="size-7 bg-gray-200 rounded-full text-lg flex items-center justify-center">${player?.username.at(0)}</div>`
      }
          <span class="text-sm text-pongdark ${isWinner ? 'font-bold' : ''}">${player?.username || t('play.tournaments.createTournament.TBD')}</span>
        </div>
        <span class="text-sm font-semibold ${isWinner ? 'text-green-600' : 'text-gray-600'}">${score !== undefined ? score : ''}</span>
      </div>
    `;
  }

  function renderMatch(match: Match) {
    const { id, player1, player2, score1, score2, winner, isCompleted } = match;
    const isPlayer1Winner = winner?.id === player1?.id;
    const isPlayer2Winner = winner?.id === player2?.id;

    return `
      <div class="match-container" data-match-id="${id}">
        <div class="match flex flex-col gap-2 border p-1 rounded-md shadow-sm cursor-pointer hover:border-blue-300 transition-colors">
          ${renderPlayer(player1, score1, isPlayer1Winner)}
          ${renderPlayer(player2, score2, isPlayer2Winner)}
          ${isCompleted ?
        `<div class="text-xs text-center text-gray-500">${t('play.tournaments.createTournament.matchCompleted')}</div>` :
        `<div class="text-xs text-center text-blue-500">${t('play.tournaments.createTournament.startSoon')}</div>`}
        </div>
      </div>
    `;
  }

  function calculateBracketHeight(): number {
    const firstRoundMatches = getMatchesByRound(0).length;
    return firstRoundMatches * matchHeight + (firstRoundMatches - 1) * matchSpacing;
  }

  function calculateMatchPosition(round: number, index: number): { x: number, y: number } {
    const x = round * (matchWidth + roundSpacing);
    let y;

    if (round === 0) {
      y = index * (matchHeight + matchSpacing);
    } else {
      const sourceIndex1 = index * 2;
      const sourceIndex2 = index * 2 + 1;

      const pos1 = calculateMatchPosition(round - 1, sourceIndex1);
      const pos2 = calculateMatchPosition(round - 1, sourceIndex2);

      y = pos1.y + (pos2.y - pos1.y + matchHeight) / 2 - matchHeight / 2;
    }

    return { x, y };
  }

  function generateSVGConnectors(): string {
    let paths = '';

    for (let round = 0; round < rounds - 1; round++) {
      const matchesInNextRound = getMatchesByRound(round + 1);

      for (let i = 0; i < matchesInNextRound.length; i++) {
        const sourceIndex1 = i * 2;
        const sourceIndex2 = i * 2 + 1;

        const source1 = calculateMatchPosition(round, sourceIndex1);
        const source2 = calculateMatchPosition(round, sourceIndex2);
        const target = calculateMatchPosition(round + 1, i);

        const source1Center = { x: source1.x + matchWidth, y: source1.y + matchHeight / 2 - matchSpacing };
        const source2Center = { x: source2.x + matchWidth, y: source2.y + matchHeight / 2 - matchSpacing };
        const targetCenter = { x: target.x, y: target.y + matchHeight / 2 - matchSpacing };

        const midX = source1Center.x + roundSpacing / 2;

        paths += `<path d="M ${source1Center.x} ${source1Center.y} H ${midX}" fill="none" stroke="${connectorColor}" stroke-width="2" />`;
        paths += `<path d="M ${source2Center.x} ${source2Center.y} H ${midX}" fill="none" stroke="${connectorColor}" stroke-width="2" />`;
        paths += `<path d="M ${midX} ${source1Center.y} V ${source2Center.y}" fill="none" stroke="${connectorColor}" stroke-width="2" />`;
        paths += `<path d="M ${midX} ${(source1Center.y + source2Center.y) / 2} H ${targetCenter.x}" fill="none" stroke="${connectorColor}" stroke-width="2" />`;
      }
    }

    return paths;
  }


  function generateSVGBracket(): string {
    const bracketHeight = calculateBracketHeight();
    const bracketWidth = rounds * (matchWidth + roundSpacing);
    const labelHeight = 30;
    const svgHeight = bracketHeight + labelHeight;

    const roundLabelsContent = Array.from({ length: rounds }, (_, round) => {
      const labelText = round === 0 ? `${t('play.tournaments.createTournament.round')} 1` : round === rounds - 1 ? t('play.tournaments.createTournament.final') : `${t('play.tournaments.createTournament.round')} ${round + 1}`;
      const labelX = round * (matchWidth + roundSpacing) + (matchWidth / 2);

      return `
      <text 
        x="${labelX}" 
        y="${labelHeight - 10}" 
        text-anchor="middle" 
        class="font-semibold" 
        fill="#4A5568"
      >
        ${labelText}
      </text>
    `;
    }).join('');

    return `
    <svg class="bracket-svg max-sm:scale-[2.5] max-md:h-fit max-md:rotate-90 ${playersCount === 4 ? 'w-1/2' : 'w-3/4'}" width="100%" viewBox="0 0 ${bracketWidth} ${svgHeight}">
      <!-- Round labels -->
      ${roundLabelsContent}
      
      <!-- Connectors -->
      <g transform="translate(0, ${labelHeight})">
        ${generateSVGConnectors()}
      </g>
      
      <!-- Matches -->
      ${Array.from({ length: rounds }, (_, round) => {
      const matchesInRound = getMatchesByRound(round);

      return matchesInRound.map((match, index) => {
        const position = calculateMatchPosition(round, index);

        return `
            <foreignObject 
              x="${position.x}" 
              y="${position.y + labelHeight}" 
              width="${matchWidth}" 
              height="${matchHeight}"
            >
              ${renderMatch(match)}
            </foreignObject>
          `;
      }).join('');
    }).join('')}
    </svg>
  `;
  }


  function addEventListeners(container: HTMLElement) {
    container.querySelectorAll('.match').forEach(match => {
      match.addEventListener('click', () => {
        const matchId = (match.closest('.match-container') as HTMLElement).dataset.matchId;
        if (matchId && onMatchClick) {
          onMatchClick(matchId);
        }
      });
    });
  }

  function render() {
    const html = `
      <div class="tournament-bracket-container size-full overflow-x-auto">
        <div class="tournament-bracket relative flex justify-center items-center size-full">
          ${generateSVGBracket()}
        </div>
      </div>
    `;

    return html;
  }

  const component = document.createElement('div');
  component.className = "tournament-brackets size-full";
  component.innerHTML = render();

  setTimeout(() => {
    addEventListeners(component);
  }, 1000);

  return component;
});

export default TournamentBrackets;