/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   UserFriends.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: afarachi <afarachi@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/22 15:39:14 by afarachi          #+#    #+#             */
/*   Updated: 2025/06/22 15:39:14 by afarachi         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { t } from "../../languages/LanguageController.js";
import { createComponent } from "../../utils/StateManager.js";
import { BlockedUsersSection } from "./BlockedUsersSection.js";
import { FriendsSection } from "./FriendsSection.js";
import { RequestsSection } from "./RequestsSection.js";

export const UserFriends = createComponent(() => {
  const container = document.createElement('div');
  container.className = "size-full flex flex-col gap-2 sm:gap-4";
  container.innerHTML = `
	<div id="tab-nav" class="flex border-b gap-4 justify-center border-gray-200">
		<button id="friends" class="px-2 sm:px-4 py-2 font-medium max-sm:text-sm focus:outline-none">${t("profile.socialTab.friends")}</button>
		<button id="requests" class="px-2 sm:px-4 py-2 font-medium max-sm:text-sm focus:outline-none">${t("profile.socialTab.friendRequests")}</button>
		<button id="blocked" class="px-2 sm:px-4 py-2 font-medium max-sm:text-sm focus:outline-none">${t("profile.socialTab.blockedUsers")}</button>
	</div>
	<div id="main-content" class="flex-1 overflow-y-auto"></div>
  `

  let selectedSection = "friends";
  const tabs = [
    { id: "friends", label: "Friends" },
    { id: "requests", label: "Friend Requests" },
    { id: "blocked", label: "Blocked Users" }
  ];

  const tabNav = container.querySelector('#tab-nav')!;
  tabNav.childNodes.forEach((tab) => {
	if (tab instanceof HTMLElement)
		tab.addEventListener('click', () => setActiveSection(tab.id));
  })

  const mainContent = container.querySelector('#main-content')!;
  
  const friendsSection = FriendsSection();
  const requestsSection = RequestsSection();
  const blockedSection = BlockedUsersSection();
  
  function setActiveSection(sectionId: string) {
    selectedSection = sectionId;

    Array.from(tabNav.children).forEach((tab, index) => {
      if (tabs[index].id === sectionId) {
        tab.className += " border-b-2 border-pongcyan text-pongcyan focus:outline-none";
      } else {
        tab.className = "px-2 sm:px-4 py-2 font-medium max-sm:text-sm text-gray-500 hover:text-gray-700 focus:outline-none";
      }
    });

    mainContent.innerHTML = '';
    switch (sectionId) {
      case "friends":
        mainContent.appendChild(friendsSection);
        break;
      case "requests":
        mainContent.appendChild(requestsSection);
        break;
      case "blocked":
        mainContent.appendChild(blockedSection);
        break;
    }
  }
  
  setActiveSection(selectedSection);
  
  return container;
});
