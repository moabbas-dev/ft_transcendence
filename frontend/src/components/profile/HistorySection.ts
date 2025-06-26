import { t } from "../../languages/LanguageController.js";
import { createComponent } from "../../utils/StateManager.js";
import { Profile } from "./UserProfile.js";

interface HistorySectionProps {
	opponentName: string;
	played: string;
	duration: string;
	outcome: string;
	result: string;
	opponentId?: number;
	trophies: number | null;
}

function translateTimeAgo(timeString: string): string {
	const match = timeString.match(/(\d+)\s+(\w+)/);
	if (!match) return timeString;
	
	const [, number, unit] = match;
	const num = parseInt(number);
	
	let unitKey: string;
	switch (unit.toLowerCase()) {
		case 'second':
		case 'seconds':
		case 'sec':
		case 'secs':
			unitKey = num === 1 ? 'time.second' : 'time.seconds';
			break;
		case 'minute':
		case 'minutes':
		case 'min':
		case 'mins':
			unitKey = num === 1 ? 'time.minute' : 'time.minutes';
			break;
		case 'hour':
		case 'hours':
		case 'hr':
		case 'hrs':
			unitKey = num === 1 ? 'time.hour' : 'time.hours';
			break;
		case 'day':
		case 'days':
			unitKey = num === 1 ? 'time.day' : 'time.days';
			break;
		case 'week':
		case 'weeks':
			unitKey = num === 1 ? 'time.week' : 'time.weeks';
			break;
		case 'month':
		case 'months':
			unitKey = num === 1 ? 'time.month' : 'time.months';
			break;
		case 'year':
		case 'years':
			unitKey = num === 1 ? 'time.year' : 'time.years';
			break;
		default:
			return timeString;
	}
	
	const translatedUnit = t(unitKey);
	
	const agoText = t('time.ago');
	
	return agoText.replace('{number}', num.toString()).replace('{unit}', translatedUnit);
}

function translateDuration(durationString: string): string {
	const match = durationString.match(/(\d+)\s+(\w+)/);
	if (!match) return durationString;
	
	const [, number, unit] = match;
	const num = parseInt(number);
	
	let unitKey: string;
	switch (unit.toLowerCase()) {
		case 'second':
		case 'seconds':
		case 'sec':
		case 'secs':
			unitKey = num === 1 ? 'time.second' : 'time.seconds';
			break;
		case 'minute':
		case 'minutes':
		case 'min':
		case 'mins':
			unitKey = num === 1 ? 'time.minute' : 'time.minutes';
			break;
		case 'hour':
		case 'hours':
		case 'hr':
		case 'hrs':
			unitKey = num === 1 ? 'time.hour' : 'time.hours';
			break;
		case 'day':
		case 'days':
			unitKey = num === 1 ? 'time.day' : 'time.days';
			break;
		case 'week':
		case 'weeks':
			unitKey = num === 1 ? 'time.week' : 'time.weeks';
			break;
		case 'month':
		case 'months':
			unitKey = num === 1 ? 'time.month' : 'time.months';
			break;
		case 'year':
		case 'years':
			unitKey = num === 1 ? 'time.year' : 'time.years';
			break;
		default:
			return durationString;
	}
	
	const translatedUnit = t(unitKey);
	
	return `${num} ${translatedUnit}`;
}

export const HistorySection = createComponent((props: HistorySectionProps) => {
	const container = document.createElement("tr");
	const finalOutcome = props.outcome === "win" ? t('profile.historyTab.win') : props.outcome === "draw" ? t('profile.historyTab.draw') : t('profile.historyTab.lose');
	container.classList.add(props.outcome === "win" ? 'bg-green-300' :
	props.outcome === "draw" ? 'bg-slate-300' : 'bg-red-300', 'text-black');
	const trophiesCell = props.trophies ? `<td class="px-3 py-2 lg:px-6 lg:py-4 text-center whitespace-nowrap">${props.trophies > 0 ? "+": ""}${props.trophies}</td>` : ``;
	
	const playedAt = translateTimeAgo(props.played);
	const translatedDuration = translateDuration(props.duration);
	
	container.innerHTML = `
		<td class="px-3 py-2 lg:px-6 lg:py-4 text-center whitespace-nowrap">
			<a class="opponent-link cursor-pointer text-blue-600 hover:text-blue-800 hover:underline font-medium">
				${props.opponentName}
			</a>
		</td>
		<td class="px-3 py-2 lg:px-6 lg:py-4 text-center whitespace-nowrap">${props.result}</td>
		<td class="px-3 py-2 lg:px-6 lg:py-4 text-center whitespace-nowrap">${finalOutcome}</td>
		${trophiesCell}
		<td class="px-3 py-2 lg:px-6 lg:py-4 text-center whitespace-nowrap">${playedAt}</td>
		<td class="px-3 py-2 lg:px-6 lg:py-4 text-center whitespace-nowrap">${translatedDuration}</td>
	`;

	const opponentLink = container.querySelector('.opponent-link');
	opponentLink?.addEventListener('click', (e) => {
		e.preventDefault();
		
		const profileComponent = Profile({ uName: props.opponentName });
		document.body.appendChild(profileComponent);
	});

	return container;
});