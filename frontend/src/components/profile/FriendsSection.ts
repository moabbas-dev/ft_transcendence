import store from "../../../store/store.js";
import { t } from "../../languages/LanguageController.js";
import chatService from "../../utils/chatUtils/chatWebSocketService.js";
import { createComponent } from "../../utils/StateManager.js";

export interface FriendProps {
  nickname: string;
  status: string;
  avatar_url: string;
  id: number;
}

export const Friend = createComponent((props: FriendProps) => {
  const friendItem = document.createElement('div');
  friendItem.className = "flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50";
  friendItem.dataset.friendId = props.id.toString(); // Store the friend ID in a data attribute
  friendItem.innerHTML = `
    <img alt="" src="${props.avatar_url}" class="size-10 rounded-full"/>
    <div>
      <p class="font-medium">${props.nickname}</p>
      <span class="text-sm text-gray-500">${props.status}</span>
    </div>
    <div class="flex flex-1 justify-end gap-2">
      <button class="size-[32px] p-1.5 grid place-content-center bg-pongcyan rounded-full hover:bg-gray-200 remove-friend-button">
        <i class="fas fa-times text-2xl cursor-pointer text-red-600"></i>
      </button>
    </div>
  `;

  // Add click event for the remove button
  const removeButton = friendItem.querySelector('.remove-friend-button');
  removeButton?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Confirm before removing
    if (confirm(t('profile.socialTab.confirmRemoveFriend'))) {
      chatService.removeFriend(props.id);
    }
  });

  return friendItem;
});

export const FriendsSection = createComponent(() => {
  const section = document.createElement('div');
  section.className = "flex flex-col gap-4";
  section.innerHTML = `
    <div id="search-container" class="flex items-center gap-4 px-4 rounded-lg bg-gray-200 focus-within:bg-gray-100 focus-within:shadow-sm focus-within:shadow-pongcyan focus-within:border focus-within:border-pongcyan">
      <i class="fa-solid fa-magnifying-glass"></i>
      <input 
        id="friends-search"
        type="text"
        placeholder="${t('profile.socialTab.search')}"
        class="w-full flex-1 p-2 rounded-lg bg-gray-200 focus:bg-gray-100 focus:outline-none"
      />
    </div>
    <div id="friends-list" class="flex flex-col gap-2"></div>
  `;
  
  const friendsList = section.querySelector('#friends-list')!;
  
  async function loadFriendsList() {
    try {
      // Show loading state
      friendsList.innerHTML = 
        `<div class="loading text-center text-gray-500 py-4">${t('chat.loadingFriends')}</div>`;
      
      // Request friends list from server
      if (chatService.isConnected()) {
        chatService.send("friends:get", {
          userId: store.userId,
        });
      } else {
        throw new Error("Chat service not connected");
      }
    } catch (error) {
      console.error("Error loading friends list:", error);
      friendsList.innerHTML = 
        `<div class="text-red-500 text-center py-4">${"profile.socialTab.failedToLoad"}</div>`;
    }
  }
  
  // Handle friends data received from server
  function handleFriendsReceived(friendsData: FriendProps[]) {
    // Clear the loading state
    friendsList.innerHTML = '';
    
    if (friendsData && friendsData.length > 0) {
      // Render each friend
      friendsData.forEach(friend => {
        var status;
        switch (friend.status) {
          case 'online':
          {
              status = t("statusOn");
              break;
          }
          case 'offline':
          {
              status = t("statusOf");
              break;
          }
          default:
              break;
        }
        friendsList.appendChild(Friend({
          nickname: friend.nickname,
          status: status,
          avatar_url: friend.avatar_url,
          id: friend.id
        }));
      });
    } else {
      // No friends found
      friendsList.innerHTML = 
        `<div class="text-gray-500 text-center py-4">${t('profile.socialTab.noFriends')}</div>`;
    }
  }
  
  // Set up event listener for friends data
  chatService.on("friends:list", (data) => {
    handleFriendsReceived(data.friends);
  });
  
  // Set up event listener for friend removal response
  chatService.on("friend:removed", (data) => {
    if (data.success) {
      // Find and remove the friend element from the DOM
      const friendElement = friendsList.querySelector(`[data-friend-id="${data.friendId}"]`);
      if (friendElement) {
        friendElement.remove();
      }
      
      // Display a success message (optional)
      const successMessage = document.createElement('div');
      successMessage.className = "bg-green-100 text-green-800 p-2 rounded text-center";
      successMessage.textContent = t('profile.socialTab.friendRemoved');
      
      // Insert the message at the top of the friends list
      if (friendsList.firstChild) {
        friendsList.insertBefore(successMessage, friendsList.firstChild);
      } else {
        friendsList.appendChild(successMessage);
      }
      
      // Remove the message after a few seconds
      setTimeout(() => {
        successMessage.remove();
        
        // Check if there are no friends left
        if (friendsList.children.length === 0) {
          friendsList.innerHTML = 
            `<div class="text-gray-500 text-center py-4">${t('profile.socialTab.noFriends')}</div>`;
        }
      }, 3000);
    }
  });
  
  // Initialize by loading friends
  loadFriendsList();
  
  // Handle search functionality
  const searchInput = section.querySelector('#friends-search') as HTMLInputElement;
  searchInput.addEventListener('input', (e) => {
    const searchTerm = (e.target as HTMLInputElement).value.toLowerCase();
    const friendElements = friendsList.querySelectorAll('[data-friend-id]');
    
    friendElements.forEach(element => {
      const friendElement = element as HTMLElement;
      const username = element.querySelector('p')?.textContent?.toLowerCase() || '';
      if (username.includes(searchTerm)) {
        friendElement.style.display = 'flex';
      } else {
        friendElement.style.display = 'none';
      }
    });
  });
  
  return section;
});