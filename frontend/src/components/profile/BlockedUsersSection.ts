import store from "../../../store/store.js";
import { createComponent } from "../../utils/StateManager.js";
import { chatService } from "../../utils/chatUtils/chatWebSocketService.js";


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
	avatar?: string;
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
      <span class="text-sm text-gray-500">Blocked on ${props.blockedOn}</span>
    </div>
    <div class="flex flex-1 justify-end gap-2">
      <button id="unblock-${props.id}" class="px-3 py-1 bg-pongcyan text-white text-sm rounded hover:bg-opacity-80">
        Unblock
      </button>
    </div>
  `;


  const unblockBtn = blockedUsersItem.querySelector(`#unblock-${props.id}`)!;
  unblockBtn.addEventListener('click', () => {
    // Get current user ID from local storage or state
    const currentUserId = parseInt(localStorage.getItem('userId') || '0');
    
    // Send unblock request via WebSocket
    chatService.send('user:unblock', {
      from: currentUserId,
      unblocked: props.id
    });
    
    // Remove this item from the list (optional - could wait for server confirmation)
    blockedUsersItem.remove();
  });
  
  return blockedUsersItem;
});

export const BlockedUsersSection = createComponent(() => {
	const section = document.createElement('div');
	section.className = "flex flex-col gap-4";
	section.innerHTML = `
	  <h3 class="font-medium text-lg">Blocked Users</h3>
	  <div id="blocked-users-list" class="flex flex-col gap-2"></div>
	`;
	
	const blockedUsersList = section.querySelector('#blocked-users-list')!;
	
	// Function to load blocked users
	const loadBlockedUsers = () => {
	  // Clear existing users
	  blockedUsersList.innerHTML = '';
	  
	  // Get current user ID from local storage or state
	  const currentUserId = store.userId;
	  
	  // Request blocked users list
	  chatService.send('users:blocked_list', { userId: currentUserId });
	};
	
	// Listen for blocked users list response
	chatService.on('users:blocked_list', (data: BlockedUsersListResponse) => {
	  const { blockedUsers } = data;
	  
	  if (blockedUsers && blockedUsers.length > 0) {
		blockedUsers.forEach((user: BlockedUserResponse) => {
		  // Format date - you might want to use a better date formatter
		  const blockedDate = new Date(user.blocked_at || Date.now()).toLocaleDateString();
		  
		  blockedUsersList.appendChild(BlockedUser({
			id: user.id,
			username: user.nickname,
			blockedOn: blockedDate,
			avatar: user.avatar || 'http://placehold.co/40x40'
		  }));
		});
	  } else {
		// Show a message when no blocked users
		blockedUsersList.innerHTML = '<p class="text-gray-500 p-3">You haven\'t blocked any users.</p>';
	  }
	});
	
	// Listen for unblock confirmation
	chatService.on('user:unblocked', (data: { username: string }) => {
	  // Reload the list when a user is successfully unblocked
	  loadBlockedUsers();
	});
	
	// Listen for errors
	chatService.on('error', (data: { message: string, details?: string }) => {
	  console.error('Socket error:', data.message);
	  // You might want to show this error to the user
	});
	
	// Initial load
	loadBlockedUsers();
	
	return section;
  });