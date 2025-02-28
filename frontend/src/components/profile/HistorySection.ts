import { createComponent } from "../../utils/StateManager.js";

interface HistorySectionProps {
	opponentName: string;
	played: string;
	duration: string;
	resPlayer: number;
	resOpponent: number;
}

export const HistorySection = createComponent((props: HistorySectionProps) => {
	const container = document.createElement("tr");
	const outcome = props.resPlayer > props.resOpponent? 'Win' : props.resPlayer === props.resOpponent? 'Draw':'Lose';
	container.classList.add(props.resPlayer > props.resOpponent ? 'bg-green-300' :
	props.resPlayer == props.resOpponent? 'bg-slate-300' : 'bg-red-300', 'text-black');
	container.innerHTML = `
		<td class="px-3 py-2 lg:px-6 lg:py-4 whitespace-nowrap">${props.opponentName}</td>
		<td class="px-3 py-2 lg:px-6 lg:py-4 whitespace-nowrap">${props.resPlayer} - ${props.resOpponent}</td>
		<td class="px-3 py-2 lg:px-6 lg:py-4 whitespace-nowrap">${outcome}</td>
		<td class="px-3 py-2 lg:px-6 lg:py-4 whitespace-nowrap">${props.played} ago</td>
		<td class="px-3 py-2 lg:px-6 lg:py-4 whitespace-nowrap">${props.duration}</td>
	`;
	return container;
})