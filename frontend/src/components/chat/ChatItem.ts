import store from "../../../store/store.js";
import { createComponent } from "../../utils/StateManager.js";
import chatService from "../../utils/chatWebSocketService.js";

interface ChatItemProps {
    username: string,
    userId: number,
    fullname: string,
    isFriend: boolean,
    isOnline?: boolean,
    onChatSelect?: (user: { nickname: string, id: number, full_name: string }) => void
}

export const ChatItem = createComponent((props: ChatItemProps) => {
    const chatItem = document.createElement('div');
    chatItem.className = 'user-item flex items-center justify-between gap-3 py-3 hover:bg-ponghover hover:cursor-pointer border-b rounded-sm';
    
    const render = () => {
        chatItem.innerHTML = `
            <div class="flex items-center gap-2">
                <div class="relative">
                    <div class="bg-white rounded-full w-10 h-10 2xl:w-14 2xl:h-14"></div>
                    ${props.isOnline ? 
                        `<div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-pongdark"></div>` : 
                        ''
                    }
                </div>
                <div class="text-white text-base sm:text-lg 2xl:text-xl">${props.fullname} - ${props.username}</div>
            </div>
            ${!props.isFriend ? `
            <div class="add-friend transition-all text-white mr-4 hover:bg-slate-700 w-fit h-fit rounded-lg">
                <i title="Add Friend" class="fa-solid fa-user-plus p-2 text-lg hover:text-pongblue"></i>
            </div>
            ` : ''}
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
                    addFriend.innerHTML = `<i title="Pending..." class="fa-solid fa-user-clock p-2 text-lg hover:text-pongblue"></i>`;
                }
            });
        }
        
        // Chat item click (select this chat)
        chatItem.addEventListener('click', () => {
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