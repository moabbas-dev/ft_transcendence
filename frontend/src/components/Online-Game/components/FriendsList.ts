import { t } from "../../../languages/LanguageController.js";
import chatService from "../../../utils/chatUtils/chatWebSocketService.js";
import store from "../../../../store/store.js";
import { createComponent } from "../../../utils/StateManager.js";

export interface FriendProps {
  id: string;
  nickname: string;
  full_name?: string;
  status: 'online' | 'offline' | 'in-game';
  avatar_url: string;
}

const Friend = createComponent((props: FriendProps) => {
  const friendElement = document.createElement('div');
  friendElement.className = 'friend-item flex items-center justify-between bg-black/40 p-4 rounded-lg mb-3 border border-gray-800 hover:border-pongcyan transition-all duration-300';

  // Status color
  let statusColor = 'bg-gray-500'; // offline by default
  if (props.status === 'online') statusColor = 'bg-green-500';
  if (props.status === 'in-game') statusColor = 'bg-blue-500';

  // Determine if friend is available for invite
  const isAvailable = props.status === 'online';

  friendElement.innerHTML = `
    <div class="flex items-center gap-3">
      <div class="avatar-container relative">
        <img 
          src="${props.avatar_url}" 
          alt="${props.nickname}" 
          class="w-12 h-12 rounded-full object-cover border-2 border-gray-700"
        >
        <div class="status-indicator absolute bottom-0 right-0 w-3 h-3 ${statusColor} rounded-full border border-gray-900"></div>
      </div>
      <div class="user-info">
        <div class="font-semibold text-white">${props.full_name || props.nickname}</div>
        <div class="text-xs text-gray-400">${props.full_name ? `@${props.nickname}` : props.status}</div>
      </div>
    </div>
    <button 
      class="invite-button px-4 py-2 rounded-md text-sm ${isAvailable
      ? 'bg-pongcyan hover:bg-pongcyan/80 text-white'
      : 'bg-gray-700 text-gray-400 cursor-not-allowed'}"
      ${!isAvailable ? 'disabled' : ''}
    >
      ${t('play.onlineGame.invite')}
    </button>
  `;

  // Add event listener to the invite button if friend is available
  if (isAvailable) {
    const inviteButton = friendElement.querySelector('.invite-button');
    inviteButton?.addEventListener('click', (e) => {
      e.stopPropagation();

      // FIXED: Only send game invite via chat service, not both systems
      if (chatService.isConnected()) {
        chatService.send("game:invite", {
          from: store.userId,
          to: props.id,
          gameType: "1v1"
        });

        // Update button state
        inviteButton.textContent = 'Invite Sent';
        inviteButton.classList.add('bg-gray-600');
        inviteButton.classList.remove('bg-pongcyan', 'hover:bg-pongcyan/80');
        (inviteButton as HTMLButtonElement).disabled = true;
      }
    });
  }

  return friendElement;
});

export function FetchFriendsList() {
  const friendsListContainer = document.createElement('div');
  friendsListContainer.className = 'friends-list w-full max-w-md mx-auto max-h-96 overflow-y-auto px-2 py-4';

  const isRTL = document.documentElement.dir === 'rtl' ||
    document.documentElement.lang === 'ar' ||
    getComputedStyle(document.documentElement).direction === 'rtl';

  const searchContainer = document.createElement('div');
  searchContainer.className = 'search-container mb-4';

  const inputClasses = `w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pongcyan ${isRTL ? 'text-right' : 'text-left'}`;
  const iconClasses = `absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-400`;

  searchContainer.innerHTML = `
    <div class="relative flex justify-between">
      <input 
        type="text" 
        placeholder="${t('play.onlineGame.searchFriends')}" 
        class="${inputClasses}"
        dir="${isRTL ? 'rtl' : 'ltr'}"
      >
      <span class="${iconClasses}">
        <i class="fa-solid fa-search"></i>
      </span>
    </div>
  `;

  friendsListContainer.appendChild(searchContainer);

  const friendsList = document.createElement('div');
  friendsList.className = 'friends-list-wrapper';
  friendsListContainer.appendChild(friendsList);

  // Loading state
  friendsList.innerHTML = `
    <div class="loading flex flex-col items-center justify-center py-6">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pongcyan mb-2"></div>
      <div class="text-gray-400">${t('chat.loadingFriends')}</div>
    </div>
  `;

  // Handle search functionality
  const searchInput = searchContainer.querySelector('input');
  searchInput?.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    const searchValue = target.value.toLowerCase();

    const friendElements = friendsList.querySelectorAll('.friend-item');
    friendElements.forEach(el => {
      const friendName = el.querySelector('.user-info')?.textContent?.toLowerCase() || '';
      if (friendName.includes(searchValue)) {
        (el as HTMLElement).style.display = 'flex';
      } else {
        (el as HTMLElement).style.display = 'none';
      }
    });
  });

  // Fetch friends list
  loadFriendsList();

  async function loadFriendsList() {
    try {
      if (chatService.isConnected()) {
        chatService.send("friends:get", {
          userId: store.userId,
        });
      } else {
        throw new Error("Chat service not connected");
      }
    } catch (error) {
      console.error("Error loading friends list:", error);
      friendsList.innerHTML = `
        <div class="error-message text-center py-6">
          <i class="fa-solid fa-circle-exclamation text-red-500 text-2xl mb-2"></i>
          <div class="text-red-400">${t('chat.errorLoadingFriends')}</div>
          <button class="retry-button mt-3 px-4 py-1 bg-pongcyan text-white rounded-md hover:bg-pongcyan/80">
            ${t('chat.retry')}
          </button>
        </div>
      `;

      const retryButton = friendsList.querySelector('.retry-button');
      retryButton?.addEventListener('click', () => {
        loadFriendsList();
      });
    }
  }

  function handleFriendsReceived(friendsData: FriendProps[]) {
    friendsList.innerHTML = '';

    if (friendsData && friendsData.length > 0) {
      friendsData.forEach(friend => {
        friendsList.appendChild(Friend(friend));
      });
    } else {
      friendsList.innerHTML = `
        <div class="no-friends text-center py-8">
          <i class="fa-solid fa-user-group text-gray-600 text-4xl mb-3"></i>
          <div class="text-gray-400">${t('chat.noFriendsFound')}</div>
        </div>
      `;
    }
  }

  // Set up event listener for friends data
  chatService.on("friends:list", (data) => {
    handleFriendsReceived(data.friends);
  });

  return friendsListContainer;
}