// import { t } from "../../languages/LanguageController.js";
// import { createComponent } from "../../utils/StateManager.js";
// import { Profile } from "./UserProfile.js";

// interface HistorySectionProps {
// 	opponentName: string;
// 	played: string;
// 	duration: string;
// 	// resPlayer: number;
// 	// resOpponent: number;
// 	outcome: string;
// 	result: string;
// 	opponentId?: number;
// 	trophies: number | null;
// }

// export const HistorySection = createComponent((props: HistorySectionProps) => {
// 	const container = document.createElement("tr");
// 	const finalOutcome = props.outcome === "win" ? t('profile.historyTab.win') : props.outcome === "draw" ? t('profile.historyTab.draw') : t('profile.historyTab.lose');
// 	container.classList.add(props.outcome === "win" ? 'bg-green-300' :
// 	props.outcome === "draw" ? 'bg-slate-300' : 'bg-red-300', 'text-black');
// 	const trophiesCell = props.trophies ? `<td class="px-3 py-2 lg:px-6 lg:py-4 text-center whitespace-nowrap">${props.trophies > 0 ? "+": ""}${props.trophies}</td>` : ``;
// 	container.innerHTML = `
// 		<td class="px-3 py-2 lg:px-6 lg:py-4 text-center whitespace-nowrap">
// 			<a class="opponent-link cursor-pointer text-blue-600 hover:text-blue-800 hover:underline font-medium">
// 				${props.opponentName}
// 			</a>
// 		</td>
// 		<td class="px-3 py-2 lg:px-6 lg:py-4 text-center whitespace-nowrap">${props.result}</td>
// 		<td class="px-3 py-2 lg:px-6 lg:py-4 text-center whitespace-nowrap">${finalOutcome}</td>
// 		${trophiesCell}
// 		<td class="px-3 py-2 lg:px-6 lg:py-4 text-center whitespace-nowrap">${props.played} ago</td>
// 		<td class="px-3 py-2 lg:px-6 lg:py-4 text-center whitespace-nowrap">${props.duration}</td>
// 	`;

// 	// Add click event listener to the opponent name
// 	const opponentLink = container.querySelector('.opponent-link');
// 	opponentLink?.addEventListener('click', (e) => {
// 		e.preventDefault();
		
// 		// Create and show the Profile component
// 		const profileComponent = Profile({ uName: props.opponentName });
// 		document.body.appendChild(profileComponent);
// 	});

// 	return container;
// });


import { t } from "../../languages/LanguageController.js";
import { createComponent } from "../../utils/StateManager.js";
import { Profile } from "./UserProfile.js";

interface HistorySectionProps {
	opponentName: string;
	played: string; // e.g., "1 day", "2 hours", "3 minutes"
	duration: string;
	outcome: string;
	result: string;
	opponentId?: number;
	trophies: number | null;
}

// Helper function to translate time strings
function translateTimeAgo(timeString: string): string {
	// Parse the time string (e.g., "1 day", "2 hours", "3 minutes")
	const match = timeString.match(/(\d+)\s+(\w+)/);
	if (!match) return timeString;
	
	const [, number, unit] = match;
	const num = parseInt(number);
	
	// Create translation key based on unit and number
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
	
	// Get the translated unit
	const translatedUnit = t(unitKey);
	
	// Build the final string manually since t() doesn't support parameters
	const agoText = t('time.ago');
	
	// Replace placeholders manually
	return agoText.replace('{number}', num.toString()).replace('{unit}', translatedUnit);
}

// Helper function to translate duration strings (e.g., "10 secs" -> "10 ثواني")
function translateDuration(durationString: string): string {
	// Parse the duration string (e.g., "10 secs", "2 mins", "1 hr")
	const match = durationString.match(/(\d+)\s+(\w+)/);
	if (!match) return durationString;
	
	const [, number, unit] = match;
	const num = parseInt(number);
	
	// Create translation key based on unit and number
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
	
	// Get the translated unit
	const translatedUnit = t(unitKey);
	
	// For duration, just return "number unit" (e.g., "10 ثواني")
	return `${num} ${translatedUnit}`;
}

export const HistorySection = createComponent((props: HistorySectionProps) => {
	const container = document.createElement("tr");
	const finalOutcome = props.outcome === "win" ? t('profile.historyTab.win') : props.outcome === "draw" ? t('profile.historyTab.draw') : t('profile.historyTab.lose');
	container.classList.add(props.outcome === "win" ? 'bg-green-300' :
	props.outcome === "draw" ? 'bg-slate-300' : 'bg-red-300', 'text-black');
	const trophiesCell = props.trophies ? `<td class="px-3 py-2 lg:px-6 lg:py-4 text-center whitespace-nowrap">${props.trophies > 0 ? "+": ""}${props.trophies}</td>` : ``;
	
	// Translate the time string and duration
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