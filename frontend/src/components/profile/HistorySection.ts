import { t } from "../../languages/LanguageController.js";
import { createComponent } from "../../utils/StateManager.js";

interface HistorySectionProps {
	opponentName: string;
	played: string;
	duration: string;
	// resPlayer: number;
	// resOpponent: number;
	outcome: string;
	result: string;
}

export const HistorySection = createComponent((props: HistorySectionProps) => {
	const container = document.createElement("tr");
	const finalOutcome = props.outcome === "win" ? t('profile.historyTab.win') : props.outcome === "draw" ? t('profile.historyTab.draw') : t('profile.historyTab.lose');
	container.classList.add(props.outcome === "win" ? 'bg-green-300' :
	props.outcome === "draw" ? 'bg-slate-300' : 'bg-red-300', 'text-black');
	container.innerHTML = `
		<td class="px-3 py-2 lg:px-6 lg:py-4 text-center whitespace-nowrap">${props.opponentName}</td>
		<td class="px-3 py-2 lg:px-6 lg:py-4 text-center whitespace-nowrap">${props.result}</td>
		<td class="px-3 py-2 lg:px-6 lg:py-4 text-center whitespace-nowrap">${finalOutcome}</td>
		<td class="px-3 py-2 lg:px-6 lg:py-4 text-center whitespace-nowrap">${props.played} ago</td>
		<td class="px-3 py-2 lg:px-6 lg:py-4 text-center whitespace-nowrap">${props.duration}</td>
	`;
	return container;
})