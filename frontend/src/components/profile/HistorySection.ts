import { t } from "../../languages/LanguageController.js";
import { createComponent } from "../../utils/StateManager.js";
import { Profile } from "./UserProfile.js";

interface HistorySectionProps {
	opponentName: string;
	played: string;
	duration: string;
	// resPlayer: number;
	// resOpponent: number;
	outcome: string;
	result: string;
	opponentId?: number;
	trophies: number | null;
}

export const HistorySection = createComponent((props: HistorySectionProps) => {
	const container = document.createElement("tr");
	const finalOutcome = props.outcome === "win" ? t('profile.historyTab.win') : props.outcome === "draw" ? t('profile.historyTab.draw') : t('profile.historyTab.lose');
	container.classList.add(props.outcome === "win" ? 'bg-green-300' :
	props.outcome === "draw" ? 'bg-slate-300' : 'bg-red-300', 'text-black');
	const trophiesCell = props.trophies ? `<td class="px-3 py-2 lg:px-6 lg:py-4 text-center whitespace-nowrap">${props.trophies > 0 ? "+": ""}${props.trophies}</td>` : ``;
	container.innerHTML = `
		<td class="px-3 py-2 lg:px-6 lg:py-4 text-center whitespace-nowrap">
			<a class="opponent-link cursor-pointer text-blue-600 hover:text-blue-800 hover:underline font-medium">
				${props.opponentName}
			</a>
		</td>
		<td class="px-3 py-2 lg:px-6 lg:py-4 text-center whitespace-nowrap">${props.result}</td>
		<td class="px-3 py-2 lg:px-6 lg:py-4 text-center whitespace-nowrap">${finalOutcome}</td>
		${trophiesCell}
		<td class="px-3 py-2 lg:px-6 lg:py-4 text-center whitespace-nowrap">${props.played} ago</td>
		<td class="px-3 py-2 lg:px-6 lg:py-4 text-center whitespace-nowrap">${props.duration}</td>
	`;

	// Add click event listener to the opponent name
	const opponentLink = container.querySelector('.opponent-link');
	opponentLink?.addEventListener('click', (e) => {
		e.preventDefault();
		
		// Create and show the Profile component
		const profileComponent = Profile({ uName: props.opponentName });
		document.body.appendChild(profileComponent);
	});

	return container;
});