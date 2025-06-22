/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   RequestsSection.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: afarachi <afarachi@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/22 15:38:10 by afarachi          #+#    #+#             */
/*   Updated: 2025/06/22 15:38:10 by afarachi         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { createComponent } from "../../utils/StateManager.js";
import chatService from "../../utils/chatUtils/chatWebSocketService.js";
import store from "../../../store/store.js";
import { t } from "../../languages/LanguageController.js";

let requests: RequestProps[] = [];

interface RequestProps {
	nickname: string;
	timeSent: string;
	avatar: string;
	userId: number;
	fromUser: number;
}

const Request = createComponent((props: RequestProps) => {
	const requestItem = document.createElement('div');
	console.log("lala", props.nickname);
	console.log(requests);
	requestItem.className = "flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm";
	requestItem.innerHTML = `
		<img alt="${props.nickname}" src="${props.avatar}" class="size-10 rounded-full"/>
		<div>
			<p class="font-medium">${props.nickname}</p>
			<span class="text-sm text-gray-500">${props.timeSent}</span>
		</div>
		<div class="flex flex-1 justify-end gap-2">
			<button id="accept" class="px-3 py-1 bg-pongcyan text-white text-sm rounded hover:opacity-80">
				${t("profile.socialTab.accept")}
			</button>
			<button id="decline" class="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300">
				${t("profile.socialTab.decline")}
			</button>
		</div>
	`;

	const acceptBtn = requestItem.querySelector('#accept')!;
	acceptBtn.addEventListener('click', () => {
		chatService.send('friend:accept', {
			from: props.fromUser,
			to: store.userId
		});
		
		requestItem.remove();
		
		requests = requests.filter(req => req.fromUser !== props.fromUser);
		console.log(requests);
		
		const requestsList = document.querySelector('#requests-list');
		if (requestsList && requests.length === 0) {
			requestsList.innerHTML = `<p class="text-gray-500 text-sm">${t("profile.socialTab.noPendingReq")}</p>`;
		}
	});

	const declineBtn = requestItem.querySelector('#decline')!;
	declineBtn.addEventListener('click', () => {
		chatService.send('friend:decline', {
			from: props.fromUser,
			to: store.userId
		});
		
		requestItem.remove();
		
		requests = requests.filter(req => req.fromUser !== props.fromUser);
		
		const requestsList = document.querySelector('#requests-list');
		if (requestsList && requests.length === 0) {
			requestsList.innerHTML = `<p class="text-gray-500 text-sm">${t("profile.socialTab.noPendingReq")}</p>`;
		}
	});

	return requestItem;
});

export const RequestsSection = createComponent(() => {
	const section = document.createElement('div');
	section.className = "flex flex-col gap-4 requests-section";
	section.innerHTML = `
		<div id="requests-list" class="flex flex-col gap-2">
			<div class="loading text-gray-500 text-sm">${t("profile.socialTab.loadingFriendReq")}</div>
		</div>
	`;
	
	const requestsList = section.querySelector('#requests-list')!;
	
	chatService.on("friends:pending", (data) => {
		const reqs = data.pending;
		console.log(reqs);
		requests = data.pending.map((req: any) => ({
			nickname: req.nickname,
			timeSent: formatTimeSent(req.created_at || Date.now()),
			avatar: req.avatar_url || "http://placehold.co/40x40",
			userId: store.userId,
			fromUser: req.from_user || req.id
		}));
		
		renderRequests();
	});
	
	function renderRequests() {
		requestsList.innerHTML = '';
		
		if (requests.length === 0) {
			requestsList.innerHTML = `<p class="text-gray-500 text-sm">${t("profile.socialTab.noPendingReq")}</p>`;
			return;
		}

		requests.forEach(request => {
			console.log(request);
			requestsList.appendChild(Request({
				nickname: request.nickname,
				timeSent: request.timeSent,
				avatar: request.avatar,
				userId: request.userId,
				fromUser: request.fromUser
			}));
		});
	}
	
	setTimeout(() => {
		if (chatService.isConnected()) {
			chatService.send('friends:get_pending', {
				userId: store.userId
			});
		} else {
			const checkConnectionInterval = setInterval(() => {
				if (chatService.isConnected()) {
					chatService.send('friends:get_pending', {
						userId: store.userId
					});
					clearInterval(checkConnectionInterval);
				}
			}, 1000);
			
			setTimeout(() => clearInterval(checkConnectionInterval), 10000);
		}
	}, 500);
	
	return section;
});

function formatTimeSent(timestamp: number): string {
	const now = new Date();
	const date = new Date(timestamp);
	const diffMs = now.getTime() - date.getTime();
	const diffSec = Math.round(diffMs / 1000);
	const diffMin = Math.round(diffSec / 60);
	const diffHour = Math.round(diffMin / 60);
	const diffDay = Math.round(diffHour / 24);
	
	if (diffSec < 60) return `${diffSec} seconds ago`;
	if (diffMin < 60) return `${diffMin} minutes ago`;
	if (diffHour < 24) return `${diffHour} hours ago`;
	if (diffDay < 7) return `${diffDay} days ago`;
	
	return date.toLocaleDateString();
}