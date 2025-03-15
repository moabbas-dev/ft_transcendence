import { createComponent } from "../../utils/StateManager.js";
import chatService from "../../utils/chatWebSocketService.js";

interface ChatItemProps {
    username: string,
    userId: number,
    fullname: string,
    isFriend: boolean,
    status: string,
    onChatSelect?: (user: { nickname: string, id: number, full_name: string }) => void
}

export const ChatItem = createComponent((props: ChatItemProps) => {
    const chatItem = document.createElement('div');
    chatItem.className = 'user-item flex items-center p-3 rounded-lg transition-all duration-200 hover:bg-ponghover hover:cursor-pointer hover:shadow-md border-b';
    
    // Set additional styles based on status
    if (props.status)
        chatItem.classList.add('border-l-4', 'border-l-green-500');
    else
        chatItem.classList.add('border-l-4', 'border-l-red-500');
    
    
    const render = () => {
        chatItem.innerHTML = `
            <div class="flex items-center gap-3 flex-1">
                <div class="avatar-container relative">
                    <div class="avatar h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold text-gray-700">
                        ${props.fullname.charAt(0).toUpperCase()}
                    </div>
                    ${props.status ? 
                        `<span class="status-indicator absolute bottom-0 right-0 h-3 w-3 rounded-full ${
                            props.status ? 'bg-green-500' : 'bg-gray-400'
                        } border border-white"></span>` : 
                        ``
                    }
                </div>
                
                <div class="user-info flex flex-col">
                    <span class="font-medium text-white">${props.fullname}</span>
                    <span class="text-sm text-gray-400">@${props.username}</span>
                </div>
            </div>
            
            ${!props.isFriend ? `
            <div class="add-friend-container">
                <button class="add-friend p-2 rounded-full hover:bg-gray-100">
                    <i class="fas fa-user-plus text-blue-500"></i>
                </button>
            </div>
            ` : ``}
        `;
        
        attachEventListeners();
    };
    
    const attachEventListeners = () => {
        // Add friend button click
        const addFriend = chatItem.querySelector('.add-friend');
        if (addFriend) {
            addFriend.addEventListener('click', (e) => {
                e.stopPropagation();
                
                if (addFriend.firstChild instanceof Element && 
                    addFriend.firstChild.classList.contains('fa-user-clock')) {
                    return;
                }
                
                console.log('Add Friend Clicked');
                
                // Send friend request via WebSocket
                if (chatService.isConnected()) {
                    chatService.sendFriendRequest(props.username);
                    
                    // Update UI to show pending status
                    addFriend.firstChild?.remove();
                    addFriend.innerHTML = `<i class="fas fa-user-clock text-yellow-500"></i>`;
                    addFriend.classList.add('bg-yellow-100');
                    
                    // Add a subtle animation to indicate the request is pending
                    addFriend.classList.add('animate-pulse');
                }
            });
        }
        
        // Chat item click (select this chat)
        chatItem.addEventListener('click', () => {
            // Highlight the selected chat
            document.querySelectorAll('.user-item').forEach(item => {
                item.classList.remove('bg-ponghover', 'shadow-md');
            });
            chatItem.classList.add('bg-ponghover', 'shadow-md');
            
            // Call the onChatSelect callback with user info
            if (props.onChatSelect) {
                props.onChatSelect({
                    nickname: props.username,
                    id: props.userId,
                    full_name: props.fullname
                });
            }
            
            // Mobile view handling
            if (window.innerWidth < 640) {
                const chatContainer = document.querySelector('.chat');
                if (chatContainer) {
                    chatContainer.classList.remove('hidden');
                    chatContainer.classList.add('fixed', 'bottom-0', 'left-0', 'w-full', 'h-[100dvh]', 'animate-slideUp', 'z-90');
                    chatContainer.classList.remove('animate-slideDown');
                }
            }
        });
    };
    
    // Initial render
    render();
    
    return chatItem;
});