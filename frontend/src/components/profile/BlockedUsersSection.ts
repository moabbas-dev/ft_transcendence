/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   BlockedUsersSection.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: afarachi <afarachi@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/22 15:33:53 by afarachi          #+#    #+#             */
/*   Updated: 2025/06/22 15:33:53 by afarachi         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import store from "../../../store/store.js";
import { t } from "../../languages/LanguageController.js";
import { createComponent } from "../../utils/StateManager.js";
import chatService from "../../utils/chatUtils/chatWebSocketService.js";


interface BlockedUserProps {
	id: number;
	username: string;
	blockedOn: string;
	avatar: string;
}

interface BlockedUserResponse {
	id: number;
	nickname: string;
	blocked_at?: string;
	avatar_url?: string;
  }


  interface BlockedUsersListResponse {
	blockedUsers: BlockedUserResponse[];
  }

const BlockedUser = createComponent((props: BlockedUserProps) => {
	const blockedUsersItem = document.createElement('div');
	blockedUsersItem.className = "flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm";
	blockedUsersItem.innerHTML = `
    <img alt="${props.username}" src="${props.avatar || 'http://placehold.co/40x40'}" class="size-10 rounded-full"/>
    <div>
      <p class="font-medium">${props.username}</p>
      <span class="text-sm text-gray-500">${t("profile.socialTab.blockedOn")} ${props.blockedOn}</span>
    </div>
    <div class="flex flex-1 justify-end gap-2">
      <button id="unblock-${props.id}" class="px-3 py-1 bg-pongcyan text-white text-sm rounded hover:bg-opacity-80">
        ${t("profile.socialTab.unblock")}
      </button>
    </div>
  `;


  const unblockBtn = blockedUsersItem.querySelector(`#unblock-${props.id}`)!;
  unblockBtn.addEventListener('click', () => {
    const currentUserId = store.userId;
    
    chatService.send('user:unblock', {
      from: currentUserId,
      unblocked: props.id
    });
    
    blockedUsersItem.remove();
  });
  
  return blockedUsersItem;
});

export const BlockedUsersSection = createComponent(() => {
	const section = document.createElement('div');
	section.className = "flex flex-col gap-4";
	section.innerHTML = `
	  <div id="blocked-users-list" class="flex flex-col gap-2"></div>
	`;
	
	const blockedUsersList = section.querySelector('#blocked-users-list')!;
	
	const loadBlockedUsers = () => {
	  blockedUsersList.innerHTML = '';
	  
	  const currentUserId = store.userId;
	  
	  chatService.send('users:blocked_list', { userId: currentUserId });
	};
	
	chatService.on('users:blocked_list', (data: BlockedUsersListResponse) => {
	  const { blockedUsers } = data;

	  console.log(blockedUsers);
	  
	  if (blockedUsers && blockedUsers.length > 0) {
		blockedUsers.forEach((user: BlockedUserResponse) => {
		  const blockedDate = new Date(user.blocked_at || Date.now()).toLocaleDateString();
		  
		  blockedUsersList.appendChild(BlockedUser({
			id: user.id,
			username: user.nickname,
			blockedOn: blockedDate,
			avatar: user.avatar_url || 'http://placehold.co/40x40'
		  }));
		});
	  } else {
		blockedUsersList.innerHTML = `<p class="text-gray-500 p-3">${t("profile.socialTab.noBlocks")}</p>`;
	  }
	});
	
	chatService.on('user:unblocked', (data: { username: string }) => {
	  loadBlockedUsers();
	});
	
	chatService.on('error', (data: { message: string, details?: string }) => {
	  console.error('Socket error:', data.message);
	});
	
	loadBlockedUsers();
	
	return section;
  });