import store from "../../../store/store.js";
import { t } from "../../languages/LanguageController.js";
import chatService from "../../utils/chatWebSocketService.js";
import { createComponent } from "../../utils/StateManager.js";

interface FriendProps {
	nickname: string;
	status: string;
	avatar: string;
}

const Friend = createComponent((props: FriendProps) => {
	const frientItem = document.createElement('div');
	frientItem.className = "flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50";
	frientItem.innerHTML = `
		<img alt="" src="${props.avatar}" class="size-10 rounded-full"/>
		<div>
			<p class="font-medium">${props.nickname}</p>
			<span class="text-sm text-gray-500">${props.status}</span>
		</div>
		<div class="flex flex-1 justify-end gap-2">
			<button class="size-[32px] p-1.5 grid place-content-center bg-pongblue text-white rounded-full hover:opacity-80">
				<i class="fa-regular fa-comment-dots"></i>
			</button>
			<button class="size-[32px] p-1.5 grid place-content-center bg-pongblue rounded-full hover:bg-gray-200">
                <i class="fas fa-times text-2xl cursor-pointer first-line:text-red-600" id="close-button"></i>
			</button>
		</div>
	`
	return frientItem
})

export const FriendsSection = createComponent(() => {
    const section = document.createElement('div');
    section.className = "flex flex-col gap-4";
	section.innerHTML = `
		<div id="search-container" class="flex items-center gap-4 px-4 rounded-lg bg-gray-200 focus-within:bg-gray-100 focus-within:shadow-sm focus-within:shadow-pongblue focus-within:border focus-within:border-pongblue">
			<i class="fa-solid fa-magnifying-glass"></i>
			<input 
				id="friends-search"
				type="text"
				placeholder="Search friends..."
				class="w-full flex-1 p-2 rounded-lg bg-gray-200 focus:bg-gray-100"
			/>
		</div>
		<div id="friends-list" class="flex flex-col gap-2"></div>
	`
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
                '<div class="text-red-500 text-center py-4">Failed to load friends</div>';
        }
    }
    
    // Handle friends data received from server
    function handleFriendsReceived(friendsData: FriendProps[]) {
        // Clear the loading state
        friendsList.innerHTML = '';
        
        if (friendsData && friendsData.length > 0) {
            // Render each friend
            friendsData.forEach(friend => {
                friendsList.appendChild(Friend({
					nickname: friend.nickname,
					status: friend.status,
					avatar: friend.avatar
				}
			));
            });
        } else {
            // No friends found
            friendsList.innerHTML = 
                `<div class="text-gray-500 text-center py-4">${t('chat.noFriendsFound') || 'No friends found'}</div>`;
        }
    }
    
    // Set up event listener for friends data
    chatService.on("friends:list", (data) => {
        handleFriendsReceived(data.friends);
		// console.log(data.friends);
    });
    
    // Initialize by loading friends
    loadFriendsList();
    
    // Handle search functionality
    const searchInput = section.querySelector('#friends-search') as HTMLInputElement;
    searchInput.addEventListener('input', (e) => {
        const searchTerm = (e.target as HTMLInputElement).value.toLowerCase();
        const friendElements = friendsList.querySelectorAll('div');
        
        friendElements.forEach(element => {
            const username = element.querySelector('p')?.textContent?.toLowerCase() || '';
            if (username.includes(searchTerm)) {
                element.style.display = 'flex';
            } else {
                element.style.display = 'none';
            }
        });
    });
    
    return section;
})
