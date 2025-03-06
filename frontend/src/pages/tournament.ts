const buildTournamentTree = (playersNum: number): string => {
	if (playersNum < 4 || playersNum > 8 || playersNum % 2 != 0) {
		return "<p>Invalid Number of players!</p>";
	}
	const rounds = Math.log2(playersNum);
	if (!Number.isInteger(rounds)) {
	  return "<p>Only tournaments with players as powers of 2 are supported!</p>";
	}

    const buildRound = (currentRound: number): string => {
        if (currentRound >= rounds) return '';

        const matchesInRound = playersNum / (2 ** (currentRound + 1));
        const isFirstRound = currentRound === 0;
        const isLastRound = currentRound === rounds - 1;

        const buildMatches = (remainingMatches: number): string => {
            if (remainingMatches <= 0) return '';
            return `
                <div class="match-${remainingMatches} flex gap-1 sm:gap-2 relative after:absolute after:w-[57%] after:rounded-full after:h-1 after:left-1/2 after:-translate-x-1/2 after:bg-pongblue after:-top-5 before:absolute before:-top-10 before:h-5 ${remainingMatches % 2 === 0? `before:border-l-4 before:left-1/2` : 'before:border-r-4'} ${isLastRound? `before:left-1/2 before:-translate-x-1/2 before:border-t-0 before:h-[92px] before:-top-[108px] before:w-1` : `before:w-1/2 before:border-t-4`} before:border-pongblue">
                    <div class="${isFirstRound? 'player' : 'slot'} relative size-10 sm:size-14 border-[3px] border-pongblue bg-pongdark rounded-full before:absolute before:h-5 before:w-1 before:bg-pongblue before:-top-5 before:left-1/2 before:-translate-x-1/2"></div>
                    <div class="${isFirstRound? 'player' : 'slot'} relative size-10 sm:size-14 border-[3px] border-pongblue bg-pongdark rounded-full before:absolute before:h-5 before:w-1 before:bg-pongblue before:-top-5 before:left-1/2 before:-translate-x-1/2"></div>
                </div>
                ${buildMatches(remainingMatches - 1)}
            `;
        };

        return `
            <div class="round-${currentRound + 1} flex justify-around gap-2 sm:gap-5">
                ${buildMatches(matchesInRound)}
            </div>
            ${buildRound(currentRound + 1)}
        `;
    };

    return `
        <div class="tournament container mx-auto flex flex-col-reverse justify-around gap-10 w-full h-dvh">
            ${buildRound(0)}
            <div class="w-full flex items-center justify-center">
                <div class="winner size-10 sm:size-14 border-[3px] border-pongblue rounded-full bg-pongdark"></div>
            </div>
        </div>
    `;
}

export default {
	render: (container: HTMLElement) => {
		container.className = "w-full h-dvh flex items-center justify-center";
		container.innerHTML = `
			${buildTournamentTree(8)}
		`;
	}
}