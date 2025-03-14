import { Chat } from "../components/chat/Chat.js";
import logoUrl from "/src/assets/ft_transcendencee.png";
import { ChatItem } from "../components/chat/ChatItem.js";
import { navigate } from "../router.js";
import chatService from "../utils/chatWebSocketService.js";
import store from "../../store/store.js";

interface Friend {
    nickname: string;
    id: number;
    full_name: string;
    isOnline: boolean;
}

export default {
    render: async (container: HTMLElement) => {
        container.innerHTML = `
            <div class="flex">
                <div class="flex flex-col gap-4 w-screen sm:w-[30vw] sm:min-w-[300px] h-[100dvh] bg-pongdark">
                    <div class="flex gap-2 text-white px-4 pt-4 text-3xl 2xl:text-4xl items-center">
                        <div class="logo rounded-full size-8 bg-white drop-shadow-[0px_0px_5px_white] hover:cursor-pointer hover:drop-shadow-[1px_1px_20px_white]">
                            <img src="${logoUrl}" class="logo size-8"/>
                        </div>
                        <h1>Neon Chat</h1>
                    </div>
                    <div class="friends-list-container flex flex-col">
                        <div class="text-white px-4 pb-2 flex justify-between items-center">
                            <h2 class="text-xl">Friends</h2>
                            <div class="loading-indicator hidden">
                                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            </div>
                        </div>
                        <div class="friends-list sm:flex flex-col scroll-pr-4 pl-4 flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:white_pongdark]
                        [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2
                        [&::-webkit-scrollbar-track]:bg-ponghover [&::-webkit-scrollbar-track]:rounded
                        [&::-webkit-scrollbar-thumb]:bg-pongdark [&::-webkit-scrollbar-thumb]:rounded
                        [&::-webkit-scrollbar-thumb:hover]:bg-[#2d3748]">
                            <div class="loading text-center text-white py-4">Loading friends...</div>
                        </div>
                    </div>
                </div>
                <div class="chat hidden bg-black sm:block sm:w-[70vw] h-[100dvh]">
                    <!-- Chat will be rendered here -->
                </div>
            </div>
        `;
        
        // Get references to elements
        const friendsList = container.querySelector('.friends-list')!;
        const chat = container.querySelector('.chat')!;
        const loadingIndicator = container.querySelector('.loading-indicator')!;
        
        // Initialize chat component
        const chatComponent = Chat();
        chat.appendChild(chatComponent);
        
        // Initialize WebSocket connection
        await initializeWebSocket();
        
        // Setup event handlers
        setupEventHandlers();
        
        // Get friends list
        await loadFriendsList();
        
        // Back arrow event for mobile view
        container.querySelector('.back_arrow')?.addEventListener('click', () => {
            const chatContainer = document.querySelector('.chat')!;
            chatContainer.classList.add('animate-slideDown');
            chatContainer.classList.remove('animate-slideUp');
        });
        
        // Logo click event
        const logoContainer = container.querySelector('.logo')!;
        logoContainer.addEventListener('click', () => {
            navigate('/');
        });
        
        // Initialize WebSocket connection
        async function initializeWebSocket() {
            try {
                // Get user info from localStorage (assuming auth service stored it there)
                const username = store.nickname;
                const userId = store.userId;
                
                if (!username || !userId) {
                    console.error('User information not found in localStorage');
                    return;
                }
                
                // Show loading indicator
                loadingIndicator.classList.remove('hidden');
                
                // Connect to WebSocket server
                await chatService.connect();
                
                console.log('Connected to chat service');
            } catch (error) {
                console.error('Failed to connect to chat service:', error);
            } finally {
                // Hide loading indicator
                loadingIndicator.classList.add('hidden');
            }
        }
        
        // Setup WebSocket event handlers
        function setupEventHandlers() {
            // Handle friends list update
            chatService.on('friends:list', (data: any) => {
                renderFriendsList(data.friends);
            });
            
            // Handle pending friend requests
            chatService.on('friends:pending', (data: any) => {
                // You could render a separate section for pending requests
                console.log('Pending friend requests:', data.pending);
                renderPendingRequests(data.pending);
            });
            
            // Handle friend request received
            chatService.on('friend:request', (data: any) => {
                // Show notification for new friend request
                showNotification(`New friend request from ${data.firstname} ${data.lastname}`);
                
                // Refresh pending requests
                // chatService.send('friends:get_pending', {});
            });
            
            // Handle friend request accepted
            chatService.on('friend:accepted', (data: any) => {
                // Add the new friend to the list and show notification
                showNotification(`${data.firstname} ${data.lastname} accepted your friend request`);
                loadFriendsList(); // Reload friends list
            });
            
            // Handle user online status changes
            chatService.on('user:status', (data: any) => {
                updateUserStatus(data.username, data.isOnline);
            });
            
            // Handle blocked user confirmation
            chatService.on('user:blocked', (data: any) => {
                showNotification(`You have blocked ${data.blockedUsername}`);
                loadFriendsList(); // Reload friends list to update UI
            });
            
            // Handle unblocked user confirmation
            chatService.on('user:unblocked', (data: any) => {
                showNotification(`You have unblocked ${data.unblockedUsername}`);
                loadFriendsList(); // Reload friends list to update UI
            });
            
            // Handle disconnection
            chatService.on('disconnect', () => {
                console.log('Disconnected from chat service');
                showNotification('Disconnected from chat service. Attempting to reconnect...', 'error');
            });
            
            // Handle reconnection
            chatService.on('reconnect', () => {
                console.log('Reconnected to chat service');
                showNotification('Reconnected to chat service');
                loadFriendsList(); // Reload friends list
            });
        }
        
        // Load friends list
        async function loadFriendsList() {
            try {
                // Show loading state
                friendsList.innerHTML = '<div class="loading text-center text-white py-4">Loading friends...</div>';
                
                // Request friends list from server
                if (chatService.isConnected()) {
                    chatService.send('friends:get', { 
                        userId: store.userId });
                }                    
                    // Also request pending friend requests
                    // chatService.send('friends:get_pending', {});
                // } else {
                //     // For demo purposes, use mock data until your backend works
                //     setTimeout(() => {
                //         const mockFriends = [
                //             { username: 'john_doe', userId: 1, fullname: 'Doe aaaaa', isOnline: true },
                //             { username: 'jane_smith', userId: 2, fullname: 'Smith', isOnline: false },
                //             { username: 'bob_johnson', userId: 3, fullname: 'Johnson', isOnline: true }
                //         ];
                //         renderFriendsList(mockFriends);
                //     }, 1000);
                // }
            } catch (error) {
                console.error('Error loading friends list:', error);
                friendsList.innerHTML = '<div class="text-red-500 text-center py-4">Failed to load friends</div>';
            }
        }
        
        // Render friends list
        function renderFriendsList(friends: Friend[]) {
            // Clear loading state
            friendsList.innerHTML = '';
            
            if (!friends || friends.length === 0) {
                friendsList.innerHTML = '<div class="text-white text-center py-4 opacity-50">No friends yet</div>';
                return;
            }
            
            // Add the search box at the top
            const searchBox = document.createElement('div');
            searchBox.className = 'search-box mb-4 px-4';
            searchBox.innerHTML = `
                <div class="relative">
                    <input type="text" class="w-full bg-ponghover text-white rounded-full py-2 px-4 pl-10 focus:outline-none" placeholder="Search friends...">
                    <div class="absolute left-3 top-2.5 text-white">
                        <i class="fa-solid fa-search"></i>
                    </div>
                </div>
            `;
            friendsList.appendChild(searchBox);
            
            // Add section title for online friends
            const onlineFriends = friends.filter(friend => friend.isOnline);
            if (onlineFriends.length > 0) {
                const onlineTitle = document.createElement('div');
                onlineTitle.className = 'text-white text-lg font-medium mt-2 mb-1';
                onlineTitle.textContent = 'Online';
                friendsList.appendChild(onlineTitle);
                
                // Render online friends
                onlineFriends.forEach(friend => {
                    const chatItemElement = ChatItem({
                        username: friend.nickname,
                        userId: friend.id,
                        fullname: friend.full_name,
                        isFriend: true,
                        isOnline: true,
                        onChatSelect: (user: any) => {
                            (chatComponent as any).setActiveUser(user);
                            updateActiveChatItem(friend.nickname);
                        }
                    });
                    chatItemElement.dataset.username = friend.nickname;
                    friendsList.appendChild(chatItemElement);
                });
            }
            
            // Add section title for offline friends
            const offlineFriends = friends.filter(friend => !friend.isOnline);
            if (offlineFriends.length > 0) {
                const offlineTitle = document.createElement('div');
                offlineTitle.className = 'text-white text-lg font-medium mt-4 mb-1';
                offlineTitle.textContent = 'Offline';
                friendsList.appendChild(offlineTitle);
                
                // Render offline friends
                offlineFriends.forEach(friend => {
                    const chatItemElement = ChatItem({
                        username: friend.nickname,
                        userId: friend.id,
                        fullname: friend.full_name,
                        isFriend: true,
                        isOnline: false,
                        onChatSelect: (user: any) => {
                            (chatComponent as any).setActiveUser(user);
                            updateActiveChatItem(friend.nickname);
                        }
                    });
                    chatItemElement.dataset.username = friend.nickname;
                    friendsList.appendChild(chatItemElement);
                });
            }
            
            // Setup search functionality
            const searchInput = searchBox.querySelector('input');
            searchInput?.addEventListener('input', (e) => {
                const target = e.target as HTMLInputElement;
                const searchTerm = target.value.toLowerCase();
                
                // Filter friends list based on search term
                const userItems = friendsList.querySelectorAll('.user-item');
                userItems.forEach(item => {
                    const nameElement = item.querySelector('.text-white.text-base');
                    if (nameElement) {
                        const name = nameElement.textContent?.toLowerCase() || '';
                        if (name.includes(searchTerm)) {
                            item.classList.remove('hidden');
                        } else {
                            item.classList.add('hidden');
                        }
                    }
                });
                
                // Hide section titles if all items in that section are hidden
                const sectionTitles = friendsList.querySelectorAll('.text-white.text-lg.font-medium');
                sectionTitles.forEach(title => {
                    let nextElement = title.nextElementSibling;
                    let hasVisibleItems = false;
                    
                    // Check if any items in this section are visible
                    while (nextElement && !nextElement.classList.contains('text-white')) {
                        if (nextElement.classList.contains('user-item') && !nextElement.classList.contains('hidden')) {
                            hasVisibleItems = true;
                            break;
                        }
                        nextElement = nextElement.nextElementSibling;
                    }
                    
                    if (hasVisibleItems) {
                        title.classList.remove('hidden');
                    } else {
                        title.classList.add('hidden');
                    }
                });
            });
        }
        
        // Render pending friend requests
        function renderPendingRequests(pending: any[]) {
            if (!pending || pending.length === 0) return;
            
            // Check if pending requests section already exists
            let pendingSection = container.querySelector('.pending-requests');
            
            if (!pendingSection) {
                // Create pending requests section
                pendingSection = document.createElement('div');
                pendingSection.className = 'pending-requests flex flex-col px-4 mt-4';
                
                const pendingTitle = document.createElement('div');
                pendingTitle.className = 'text-white text-xl mb-2';
                pendingTitle.textContent = 'Pending Requests';
                
                pendingSection.appendChild(pendingTitle);
                
                // Add it after the friends list container
                const friendsListContainer = container.querySelector('.friends-list-container');
                if (friendsListContainer) {
                    friendsListContainer.after(pendingSection);
                }
            } else {
                // Clear existing pending requests
                const pendingTitle = pendingSection.querySelector('.text-white.text-xl');
                pendingSection.innerHTML = '';
                if (pendingTitle) pendingSection.appendChild(pendingTitle);
            }
            
            // Add each pending request
            pending.forEach(request => {
                const requestElement = document.createElement('div');
                requestElement.className = 'pending-request flex items-center justify-between bg-ponghover rounded-lg p-2 mb-2';
                requestElement.innerHTML = `
                    <div class="flex items-center gap-2">
                        <div class="bg-white rounded-full w-8 h-8"></div>
                        <div class="text-white">${request.firstname} ${request.lastname}</div>
                    </div>
                    <div class="flex gap-2">
                        <button class="accept-btn bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Accept</button>
                        <button class="decline-btn bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Decline</button>
                    </div>
                `;
                
                // Add event listeners for accept/decline buttons
                const acceptBtn = requestElement.querySelector('.accept-btn');
                acceptBtn?.addEventListener('click', () => {
                    if (chatService.isConnected()) {
                        chatService.acceptFriendRequest(request.username);
                        requestElement.remove();
                        
                        // Check if pending section is now empty
                        const remainingRequests = pendingSection?.querySelectorAll('.pending-request');
                        if (!remainingRequests || remainingRequests.length === 0) {
                            pendingSection?.remove();
                        }
                    }
                });
                
                const declineBtn = requestElement.querySelector('.decline-btn');
                declineBtn?.addEventListener('click', () => {
                    if (chatService.isConnected()) {
                        // Assuming there's a method for declining friend requests
                        chatService.send('friend:decline', {
                            from: request.username,
                            to: localStorage.getItem('username')
                        });
                        requestElement.remove();
                        
                        // Check if pending section is now empty
                        const remainingRequests = pendingSection?.querySelectorAll('.pending-request');
                        if (!remainingRequests || remainingRequests.length === 0) {
                            pendingSection?.remove();
                        }
                    }
                });
                
                pendingSection?.appendChild(requestElement);
            });
        }
        
        // Update user online status
        function updateUserStatus(username: string, isOnline: boolean) {
            const userItems = friendsList.querySelectorAll('.user-item');
            userItems.forEach(item => {
                if ((item as HTMLElement).dataset.username === username) {
                    // Update status indicator
                    const statusIndicator = item.querySelector('.relative');
                    if (statusIndicator) {
                        // Remove existing status indicator
                        const existingIndicator = statusIndicator.querySelector('.absolute');
                        if (existingIndicator) {
                            existingIndicator.remove();
                        }
                        
                        // Add new status indicator if online
                        if (isOnline) {
                            const indicator = document.createElement('div');
                            indicator.className = 'absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-pongdark';
                            statusIndicator.appendChild(indicator);
                        }
                    }
                    
                    // Move the item to the appropriate section (online/offline)
                    if (isOnline) {
                        const onlineTitle = Array.from(friendsList.querySelectorAll('.text-white.text-lg.font-medium')).find(el => el.textContent === 'Online');
                        if (onlineTitle) {
                            onlineTitle.after(item);
                        }
                    } else {
                        const offlineTitle = Array.from(friendsList.querySelectorAll('.text-white.text-lg.font-medium')).find(el => el.textContent === 'Offline');
                        if (offlineTitle) {
                            offlineTitle.after(item);
                        }
                    }
                }
            });
        }
        
        // Update active chat item (highlight selected chat)
        function updateActiveChatItem(username: string) {
            // Remove active class from all items
            const userItems = friendsList.querySelectorAll('.user-item');
            userItems.forEach(item => {
                item.classList.remove('bg-ponghover');
            });
            
            // Add active class to selected item
            userItems.forEach(item => {
                if ((item as HTMLElement).dataset.username === username) {
                    item.classList.add('bg-ponghover');
                }
            });
        }
        
        // Show notification
        function showNotification(message: string, type: 'success' | 'error' = 'success') {
            const notification = document.createElement('div');
            notification.className = `notification fixed top-4 right-4 p-3 rounded shadow-lg z-50 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            // Remove notification after 3 seconds
            setTimeout(() => {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 3000);
        }
        
        // Add 'Find Friends' button below the friends list
        const addFindFriendsButton = () => {
            const container = document.querySelector('.friends-list-container');
            const findFriendsBtn = document.createElement('button');
            findFriendsBtn.className = 'find-friends-btn bg-pongblue text-white py-2 rounded-lg mx-4 mt-auto mb-4 hover:opacity-90';
            findFriendsBtn.textContent = 'Find New Friends';
            
            findFriendsBtn.addEventListener('click', () => {
                showFindFriendsModal();
            });
            
            container?.appendChild(findFriendsBtn);
        };
        
        // Show find friends modal
        function showFindFriendsModal() {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-pongdark rounded-lg p-4 w-[90%] max-w-md">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-white text-xl">Find Friends</h2>
                        <button class="close-btn text-white text-2xl">&times;</button>
                    </div>
                    <div class="relative mb-4">
                        <input type="text" class="search-users w-full bg-ponghover text-white rounded-full py-2 px-4 pl-10 focus:outline-none" placeholder="Search by username...">
                        <div class="absolute left-3 top-2.5 text-white">
                            <i class="fa-solid fa-search"></i>
                        </div>
                    </div>
                    <div class="users-results max-h-[50vh] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:white_pongdark]
                    [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2
                    [&::-webkit-scrollbar-track]:bg-ponghover [&::-webkit-scrollbar-track]:rounded
                    [&::-webkit-scrollbar-thumb]:bg-pongdark [&::-webkit-scrollbar-thumb]:rounded
                    [&::-webkit-scrollbar-thumb:hover]:bg-[#2d3748]">
                        <div class="text-white text-center py-4 opacity-50">Search for users to add</div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Close button event
            const closeBtn = modal.querySelector('.close-btn');
            closeBtn?.addEventListener('click', () => {
                modal.remove();
            });
            
            // Search input event
            const searchInput = modal.querySelector('.search-users') as HTMLInputElement;
            let searchTimeout: number | null = null;
            
            searchInput?.addEventListener('input', () => {
                const resultsContainer = modal.querySelector('.users-results')!;
                const searchTerm = searchInput.value.trim();
                
                // Clear previous timeout
                if (searchTimeout) {
                    window.clearTimeout(searchTimeout);
                }
                
                if (searchTerm.length < 2) {
                    resultsContainer.innerHTML = '<div class="text-white text-center py-4 opacity-50">Enter at least 2 characters</div>';
                    return;
                }
                
                // Add loading indicator
                resultsContainer.innerHTML = '<div class="text-white text-center py-4">Searching...</div>';
                
                // Debounce search
                searchTimeout = window.setTimeout(() => {
                    if (chatService.isConnected()) {
                        // Send search request
                        chatService.send('users:search', { query: searchTerm });
                        
                        // Setup one-time listener for search results
                        const searchResultHandler = (data: any) => {
                            renderSearchResults(data.users, resultsContainer);
                            // Remove the listener after receiving results
                            chatService.off('users:search_results', searchResultHandler);
                        };
                        
                        chatService.on('users:search_results', searchResultHandler);
                    } else {
                        // Mock results for demo
                        setTimeout(() => {
                            const mockResults = [
                                { username: 'alex_garcia', firstname: 'Alex', lastname: 'Garcia', isOnline: true },
                                { username: 'sarah_wilson', firstname: 'Sarah', lastname: 'Wilson', isOnline: false },
                                { username: 'david_lee', firstname: 'David', lastname: 'Lee', isOnline: true }
                            ];
                            renderSearchResults(mockResults, resultsContainer);
                        }, 500);
                    }
                }, 500);
            });
            
            // Function to render search results
            function renderSearchResults(users: any[], container: Element) {
                if (!users || users.length === 0) {
                    container.innerHTML = '<div class="text-white text-center py-4 opacity-50">No users found</div>';
                    return;
                }
                
                container.innerHTML = '';
                
                users.forEach(user => {
                    const userElement = ChatItem({
                        username: user.username,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        isFriend: false,
                        isOnline: user.isOnline,
                        onChatSelect: () => {} // No chat selection for search results
                    });
                    container.appendChild(userElement);
                });
            }
        }
        
        // Add Find Friends button
        addFindFriendsButton();
        
        // Add window resize event listener for mobile responsiveness
        window.addEventListener('resize', () => {
            const chatContainer = document.querySelector('.chat');
            if (window.innerWidth >= 640 && chatContainer) {
                chatContainer.classList.remove('fixed', 'bottom-0', 'left-0', 'w-full', 'animate-slideUp', 'animate-slideDown', 'z-90');
                chatContainer.classList.remove('hidden');
                chatContainer.classList.add('sm:block', 'sm:w-[70vw]');
            }
        });
    }
};