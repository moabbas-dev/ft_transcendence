import { Chat } from "../components/chat/Chat.js";
import { ChatItem } from "../components/chat/ChatItem.js";
import { navigate } from "../router.js";
import chatService from "../utils/chatUtils/chatWebSocketService.js";
import store from "../../store/store.js";
import { t } from "../languages/LanguageController.js";

interface USER {
  nickname: string;
  id: number;
  full_name: string;
  status: string;
}

export default {
  render: async (container: HTMLElement) => {
    container.innerHTML = `
      <div class="flex">
        <div class="flex flex-col gap-4 w-screen sm:w-[30vw] sm:min-w-[300px] h-[100dvh] bg-pongdark relative">
          <div class="flex gap-2 text-white px-4 pt-2 text-3xl 2xl:text-4xl items-center w-full relative">
            <div class="flex gap-2 text-white w-full text-3xl 2xl:text-4xl items-center justify-center">
              <div class="logo flex flex-col items-center text-center font-bold text-white text-3xl transition-all duration-300 hover:drop-shadow-[0_0_25px_#a855f7]">
                <span class="text-purple-500 drop-shadow-[0_0_10px_#a855f7] transition-all duration-300 hover:drop-shadow-[0_0_20px_#a855f7]">
                  ft_transcendence
                </span>
                <h1 class="text-gray-300 text-xl transition-all duration-300 hover:text-white">
                  Neon Chat
                </h1>
              </div>
            </div>
            
            <div class="absolute bottom-0 left-0 w-full h-[2px] bg-purple-500 shadow-[0_0_10px_#a855f7] transition-all duration-300 hover:shadow-[0_0_20px_#a855f7]"></div>
          </div>

          <!-- Toggle buttons for Friends and Message Requests -->
          <div class="flex justify-center px-4 pb-2">
            <div class="flex bg-ponghover rounded-lg p-1 w-full">
              <button id="friends-tab" class="flex-1 text-white py-2 px-4 rounded-md bg-purple-500 text-center transition-all">
                ${t('chat.friends')}
              </button>
              <button id="requests-tab" class="flex-1 text-white py-2 px-4 rounded-md text-center transition-all">
                ${t('chat.messageRequests')}
              </button>
            </div>
          </div>

          <!-- Friends List Container -->
          <div id="friends-container" class="friends-list-container flex flex-col">
            <div class="text-white px-4 pb-2 flex justify-between items-center">
              <div class="loading-indicator hidden">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              </div>
            </div>
            
            <div class="friends-list sm:flex flex-col scroll-pr-4 pl-4 flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:white_pongdark]
                [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2
                [&::-webkit-scrollbar-track]:bg-ponghover [&::-webkit-scrollbar-track]:rounded
                [&::-webkit-scrollbar-thumb]:bg-pongdark [&::-webkit-scrollbar-thumb]:rounded
                [&::-webkit-scrollbar-thumb:hover]:bg-[#2d3748]">
              <div class="loading text-center text-white py-4">${t('loadingFriends')}</div>
            </div>
          </div>

          <!-- Message Requests Container (Hidden by default) -->
          <div id="requests-container" class="message-requests-container flex-col hidden">
            <div class="text-white px-4 pb-2 flex justify-between items-center">
              <div class="requests-loading-indicator hidden">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              </div>
            </div>
            
            <div class="message-requests-list sm:flex flex-col scroll-pr-4 pl-4 flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:white_pongdark]
                [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2
                [&::-webkit-scrollbar-track]:bg-ponghover [&::-webkit-scrollbar-track]:rounded
                [&::-webkit-scrollbar-thumb]:bg-pongdark [&::-webkit-scrollbar-thumb]:rounded
                [&::-webkit-scrollbar-thumb:hover]:bg-[#2d3748]">
              <div class="loading text-center text-white py-4">${t('loadingRequests')}</div>
            </div>
          </div>
        </div>

        <div class="chat hidden bg-black sm:block sm:w-[70vw] h-[100dvh]">
          <!-- Chat will be rendered here -->
        </div>
      </div>
    `;

    // Track unread message counts
    let unreadMessageCounts = new Map<number, number>();

    // Get references to elements
    const friendsTab = container.querySelector("#friends-tab") as HTMLButtonElement;
    const requestsTab = container.querySelector("#requests-tab") as HTMLButtonElement;
    const friendsContainer = container.querySelector("#friends-container") as HTMLElement;
    const requestsContainer = container.querySelector("#requests-container") as HTMLElement;
    const friendsList = container.querySelector(".friends-list") as HTMLElement;
    const requestsList = container.querySelector(".message-requests-list") as HTMLElement;
    const chat = container.querySelector(".chat") as HTMLElement;
    const loadingIndicator = container.querySelector(".loading-indicator") as HTMLElement;
    const requestsLoadingIndicator = container.querySelector(".requests-loading-indicator") as HTMLElement;

    // Initialize chat component
    const chatComponent = Chat();
    chat.appendChild(chatComponent);

    // Initialize WebSocket connection
    await initializeWebSocket();

    // Setup event handlers
    setupEventHandlers();

    // Get friends list
    await loadFriendsList();

    // Set up tab switching
    friendsTab.addEventListener("click", () => {
      friendsTab.classList.add("bg-purple-500");
      requestsTab.classList.remove("bg-purple-500");
      friendsContainer.classList.remove("hidden");
      friendsContainer.classList.add("flex");
      requestsContainer.classList.add("hidden");
      requestsContainer.classList.remove("flex");
    });

    requestsTab.addEventListener("click", () => {
      requestsTab.classList.add("bg-purple-500");
      friendsTab.classList.remove("bg-purple-500");
      requestsContainer.classList.remove("hidden");
      requestsContainer.classList.add("flex");
      friendsContainer.classList.add("hidden");
      friendsContainer.classList.remove("flex");

      // Load message requests if they haven't been loaded yet
      if (requestsList.querySelector(".loading")) {
        loadMessageRequests();
      }
    });

    // Logo click event
    const logoContainer = container.querySelector(".logo") as HTMLElement;
    logoContainer.addEventListener("click", () => {
      navigate("/");
    });

    // Get unread count
    const getUnreadCount = (userId: number): number => {
      return unreadMessageCounts.get(userId) || 0;
    };

    // Update chat item unread count
    function updateChatItemUnreadCount(userId: number, count: number, container: HTMLElement, usersRequest: HTMLElement) {
      const userItems = container.querySelectorAll(".user-item");
      userItems.forEach((item) => {
        if ((item as HTMLElement).dataset.userId === userId.toString()) {
          const avatarContainer = item.querySelector(".avatar-container");
          if (avatarContainer) {
            // Remove existing unread count badge if any
            const existingBadge = avatarContainer.querySelector("div.absolute.top-0.right-0");
            if (existingBadge) {
              existingBadge.remove();
            }

            // Add new badge if count > 0
            if (count > 0) {
              const badge = document.createElement("div");
              badge.className =
                "absolute top-0 right-0 bg-red-500 text-white rounded-full " +
                "text-xs min-w-[20px] h-5 flex items-center justify-center px-1";
              badge.textContent = count > 9 ? '9+' : count.toString();
              avatarContainer.appendChild(badge);
            }
          }
        }
      });

      const userItemss = usersRequest.querySelectorAll(".user-item");
      userItemss.forEach((item) => {
        if ((item as HTMLElement).dataset.userId === userId.toString()) {
          const avatarContainer = item.querySelector(".avatar-container");
          if (avatarContainer) {
            // Remove existing unread count badge if any
            const existingBadge = avatarContainer.querySelector("div.absolute.top-0.right-0");
            if (existingBadge) {
              existingBadge.remove();
            }

            // Add new badge if count > 0
            if (count > 0) {
              const badge = document.createElement("div");
              badge.className =
                "absolute top-0 right-0 bg-red-500 text-white rounded-full " +
                "text-xs min-w-[20px] h-5 flex items-center justify-center px-1";
              badge.textContent = count > 9 ? '9+' : count.toString();
              avatarContainer.appendChild(badge);
            }
          }
        }
      });
    }

    // Initialize WebSocket connection
    async function initializeWebSocket() {
      try {
        const username = store.nickname;
        const userId = store.userId;

        if (!username || !userId) {
          console.error("User information not found in localStorage");
          return;
        }

        // Show loading indicator
        loadingIndicator.classList.remove("hidden");

        // Connect to WebSocket server
        await chatService.connect();

        console.log("Connected to chat service");
      } catch (error) {
        console.error("Failed to connect to chat service:", error);
      } finally {
        // Hide loading indicator
        loadingIndicator.classList.add("hidden");
      }
    }

    // Setup WebSocket event handlers
    function setupEventHandlers() {
      // Handle friends list update
      chatService.on("friends:list", (data: any) => {
        console.log(data);
        renderFriendsList(data.friends);
      });

      // Handle message requests list update
      chatService.on("message:requests", (data: any) => {
        console.log(data);
        renderMessageRequestsList(data.requests);
      });

      // Handle unread message counts
      chatService.on("messages:unread", (data: any) => {
        if (data && data.unreadCounts) {
          // Convert the data to a Map
          unreadMessageCounts = new Map(
            Object.entries(data.unreadCounts).map(([key, value]) => [parseInt(key), value as number])
          );

          // Update all chat items with new counts
          unreadMessageCounts.forEach((count, userId) => {
            updateChatItemUnreadCount(userId, count, friendsList, requestsList);
          });
        }
      });

      chatService.on("message:received", (data: any) => {
        // If the message is for a user we're not currently chatting with, update the unread count
        if (data && data.message) {
          const currentActiveChatId = chatComponent.getCurrentActiveChatId?.() || null;

          // If this message is not for the currently open chat
          if (currentActiveChatId !== data.message.from) {
            // Request updated unread counts
            chatService.send("messages:unread:get", {
              userId: store.userId
            });
          }
        }
      });

      // Handle user online status changes
      chatService.on("user:status", (data: any) => {
        updateUserStatus(data.nickname, data.status);
      });

      // Handle blocked user confirmation
      chatService.on("user:blocked", (data: any) => {
        loadFriendsList(); // Reload friends list to update UI
        loadMessageRequests(); // Reload message requests to update UI
      });

      // Handle unblocked user confirmation
      chatService.on("user:unblocked", (data: any) => {
        loadFriendsList(); // Reload friends list to update UI
        loadMessageRequests(); // Reload message requests to update UI
      });

      // Handle user added as friend
      chatService.on("user:friend:added", (data: any) => {
        loadFriendsList(); // Reload friends list
        loadMessageRequests(); // Reload message requests
      });

      // Handle disconnection
      chatService.on("disconnect", () => {
        console.log("Disconnected from chat service");
      });

      // Handle reconnection
      chatService.on("reconnect", () => {
        console.log("Reconnected to chat service");
        loadFriendsList(); // Reload friends list
        loadMessageRequests(); // Reload message requests
      });
    }

    // Load friends list
    async function loadFriendsList() {
      try {
        // Show loading state
        friendsList.innerHTML = `<div class="loading text-center text-white py-4">${t('chat.loadingFriends')}</div>`;
        loadingIndicator.classList.remove("hidden");

        // Request friends list from server
        if (chatService.isConnected()) {
          chatService.send("friends:get", {
            userId: store.userId,
          });

          // Request unread message counts
          chatService.send("messages:unread:get", {
            userId: store.userId
          });
        }
      } catch (error) {
        console.error("Error loading friends list:", error);
        friendsList.innerHTML = '<div class="text-red-500 text-center py-4">Failed to load friends</div>';
      } finally {
        loadingIndicator.classList.add("hidden");
      }
    }

    // Load message requests
    async function loadMessageRequests() {
      try {
        // Show loading state
        requestsList.innerHTML = `<div class="loading text-center text-white py-4">${t('chat.loadingRequests')}</div>`;
        requestsLoadingIndicator.classList.remove("hidden");

        // Request message requests from server
        if (chatService.isConnected()) {
          chatService.send("message:requests:get", {
            userId: store.userId,
          });

          // Request unread request counts
          // chatService.send("messages:requests:unread:get", {
          //   userId: store.userId
          // });
        }
      } catch (error) {
        console.error("Error loading message requests:", error);
        requestsList.innerHTML = '<div class="text-red-500 text-center py-4">Failed to load message requests</div>';
      } finally {
        requestsLoadingIndicator.classList.add("hidden");
      }
    }

    // Render friends list
    function renderFriendsList(friends: USER[]) {
      // Clear loading state
      friendsList.innerHTML = "";

      if (!friends || friends.length === 0) {
        friendsList.innerHTML = '<div class="text-white text-center py-4 opacity-50">No friends yet</div>';
        return;
      }

      // Add the search box at the top
      const searchBox = document.createElement("div");
      searchBox.className = "search-box mb-4 px-4";
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
      const onlineFriends = friends.filter(friend => friend.status === "online");
      if (onlineFriends.length > 0) {
        const onlineTitle = document.createElement("div");
        onlineTitle.className = "text-white text-lg font-medium mt-2 mb-1 drop-shadow-[1px_1px_20px_white]";
        onlineTitle.textContent = "Online";
        friendsList.appendChild(onlineTitle);

        // Render online friends
        onlineFriends.forEach((friend) => {
          const chatItemElement = ChatItem({
            username: friend.nickname,
            userId: friend.id,
            fullname: friend.full_name,
            status: true,
            unreadCount: getUnreadCount(friend.id),
            onChatSelect: (user: any) => {
              (chatComponent as any).setActiveUser(user);
              updateActiveChatItem(friend.nickname, friendsList);
            },
          });
          chatItemElement.dataset.username = friend.nickname;
          chatItemElement.dataset.userId = friend.id.toString();
          friendsList.appendChild(chatItemElement);
        });
      }

      // Add section title for offline friends
      const offlineFriends = friends.filter(friend => friend.status === "offline");
      if (offlineFriends.length > 0) {
        const offlineTitle = document.createElement("div");
        offlineTitle.className = "text-white text-lg font-medium mt-4 mb-1 drop-shadow-[1px_1px_20px_white]";
        offlineTitle.textContent = "Offline";
        friendsList.appendChild(offlineTitle);

        // Render offline friends
        offlineFriends.forEach((friend) => {
          const chatItemElement = ChatItem({
            username: friend.nickname,
            userId: friend.id,
            fullname: friend.full_name,
            status: false,
            unreadCount: getUnreadCount(friend.id),
            onChatSelect: (user: any) => {
              (chatComponent as any).setActiveUser(user);
              updateActiveChatItem(friend.nickname, friendsList);
            },
          });
          chatItemElement.dataset.username = friend.nickname;
          chatItemElement.dataset.userId = friend.id.toString();
          friendsList.appendChild(chatItemElement);
        });
      }

      // Setup search functionality
      const searchInput = searchBox.querySelector("input");
      searchInput?.addEventListener("input", (e) => {
        const target = e.target as HTMLInputElement;
        const searchTerm = target.value.toLowerCase();

        // Filter friends list based on search term
        const userItems = friendsList.querySelectorAll(".user-item");
        userItems.forEach((item) => {
          const nameElement = item.querySelector(".user-info");
          if (nameElement) {
            const name = nameElement.textContent?.toLowerCase() || "";
            if (name.includes(searchTerm)) {
              item.classList.remove("hidden");
            } else {
              item.classList.add("hidden");
            }
          }
        });

        // Hide section titles if all items in that section are hidden
        const sectionTitles = friendsList.querySelectorAll(".text-white.text-lg.font-medium");
        sectionTitles.forEach((title) => {
          let nextElement = title.nextElementSibling;
          let hasVisibleItems = false;

          // Check if any items in this section are visible
          while (nextElement && !nextElement.classList.contains("text-white")) {
            if (nextElement.classList.contains("user-item") && !nextElement.classList.contains("hidden")) {
              hasVisibleItems = true;
              break;
            }
            nextElement = nextElement.nextElementSibling;
          }

          if (hasVisibleItems) {
            title.classList.remove("hidden");
          } else {
            title.classList.add("hidden");
          }
        });
      });
    }

    // Render message requests list
    function renderMessageRequestsList(data: USER[]) {
      console.log(data);
      // Clear loading state
      requestsList.innerHTML = "";

      // Extract the requests array from the data
      const requests = data || [];

      if (!requests || requests.length === 0) {
        requestsList.innerHTML = '<div class="text-white text-center py-4 opacity-50">No message requests</div>';
        return;
      }

      // Add the search box at the top
      const searchBox = document.createElement("div");
      searchBox.className = "search-box mb-4 px-4";
      searchBox.innerHTML = `
    <div class="relative">
      <input type="text" class="w-full bg-ponghover text-white rounded-full py-2 px-4 pl-10 focus:outline-none" placeholder="Search requests...">
      <div class="absolute left-3 top-2.5 text-white">
        <i class="fa-solid fa-search"></i>
      </div>
    </div>
  `;
      requestsList.appendChild(searchBox);

      // Add section title for online users
      const onlineUsers = requests.filter((item: any) => item.user && item.user.status === "online");
      if (onlineUsers.length > 0) {
        const onlineTitle = document.createElement("div");
        onlineTitle.className = "text-white text-lg font-medium mt-2 mb-1 drop-shadow-[1px_1px_20px_white]";
        onlineTitle.textContent = "Online";
        requestsList.appendChild(onlineTitle);

        // Render online users
        onlineUsers.forEach((item: any) => {
          const user = item.user;
          console.log(user);
          if (!user) return;

          const chatItemElement = ChatItem({
            username: user.nickname,
            userId: user.id,
            fullname: user.full_name,
            status: true,
            unreadCount: getUnreadCount(user.id),
            onChatSelect: (user: any) => {
              (chatComponent as any).setActiveUser(user);
              updateActiveChatItem(user.nickname, requestsList);
            },
          });
          chatItemElement.dataset.username = user.nickname;
          chatItemElement.dataset.userId = user.id.toString();
          requestsList.appendChild(chatItemElement);
        });
      }

      // Add section title for offline users
      const offlineUsers = requests.filter((item: any) => item.user && item.user.status === "offline");
      if (offlineUsers.length > 0) {
        const offlineTitle = document.createElement("div");
        offlineTitle.className = "text-white text-lg font-medium mt-4 mb-1 drop-shadow-[1px_1px_20px_white]";
        offlineTitle.textContent = "Offline";
        requestsList.appendChild(offlineTitle);

        // Render offline users
        offlineUsers.forEach((item: any) => {
          const user = item.user;
          console.log(user);
          if (!user) return;

          const chatItemElement = ChatItem({
            username: user.nickname,
            userId: user.id,
            fullname: user.full_name,
            status: false,
            unreadCount: getUnreadCount(user.id),
            onChatSelect: (user: any) => {
              (chatComponent as any).setActiveUser(user);
              updateActiveChatItem(user.nickname, requestsList);
            },
          });
          chatItemElement.dataset.username = user.nickname;
          chatItemElement.dataset.userId = user.id.toString();
          requestsList.appendChild(chatItemElement);
        });
      }

      // Setup search functionality
      const searchInput = searchBox.querySelector("input");
      searchInput?.addEventListener("input", (e) => {
        const target = e.target as HTMLInputElement;
        const searchTerm = target.value.toLowerCase();

        // Filter requests list based on search term
        const userItems = requestsList.querySelectorAll(".user-item");
        userItems.forEach((item) => {
          const nameElement = item.querySelector(".user-info");
          if (nameElement) {
            const name = nameElement.textContent?.toLowerCase() || "";
            if (name.includes(searchTerm)) {
              item.classList.remove("hidden");
            } else {
              item.classList.add("hidden");
            }
          }
        });

        // Hide section titles if all items in that section are hidden
        const sectionTitles = requestsList.querySelectorAll(".text-white.text-lg.font-medium");
        sectionTitles.forEach((title) => {
          let nextElement = title.nextElementSibling;
          let hasVisibleItems = false;

          // Check if any items in this section are visible
          while (nextElement && !nextElement.classList.contains("text-white")) {
            if (nextElement.classList.contains("user-item") && !nextElement.classList.contains("hidden")) {
              hasVisibleItems = true;
              break;
            }
            nextElement = nextElement.nextElementSibling;
          }

          if (hasVisibleItems) {
            title.classList.remove("hidden");
          } else {
            title.classList.add("hidden");
          }
        });
      });
    }

    // Update user online status
    function updateUserStatus(username: string, isOnline: boolean) {
      // Update in friends list
      updateUserStatusInContainer(username, isOnline, friendsList);

      // Update in requests list
      updateUserStatusInContainer(username, isOnline, requestsList);
    }

    // Helper function to update user status in a container
    function updateUserStatusInContainer(username: string, isOnline: boolean, container: HTMLElement) {
      const userItems = container.querySelectorAll(".user-item");
      userItems.forEach((item) => {
        if ((item as HTMLElement).dataset.username === username) {
          // Update status indicator
          const statusIndicator = item.querySelector(".relative");
          if (statusIndicator) {
            // Remove existing status indicator
            const existingIndicator = statusIndicator.querySelector(".absolute");
            if (existingIndicator) {
              existingIndicator.remove();
            }

            // Add new status indicator if online
            if (isOnline) {
              const indicator = document.createElement("div");
              indicator.className = "absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-pongdark";
              statusIndicator.appendChild(indicator);
            }
          }

          // Move the item to the appropriate section (online/offline)
          if (isOnline) {
            const onlineTitle = Array.from(
              container.querySelectorAll(".text-white.text-lg.font-medium")
            ).find((el) => el.textContent === "Online");
            if (onlineTitle) {
              onlineTitle.after(item);
            }
          } else {
            const offlineTitle = Array.from(
              container.querySelectorAll(".text-white.text-lg.font-medium")
            ).find((el) => el.textContent === "Offline");
            if (offlineTitle) {
              offlineTitle.after(item);
            }
          }
        }
      });
    };

    // Update active chat item (highlight selected chat)
    function updateActiveChatItem(username: string, container: HTMLElement) {
      // Remove active class from all items in both containers
      const allUserItems = document.querySelectorAll(".user-item");
      allUserItems.forEach((item) => {
        item.classList.remove("bg-ponghover");
      });

      // Add active class to selected item
      const userItems = container.querySelectorAll(".user-item");
      userItems.forEach((item) => {
        if ((item as HTMLElement).dataset.username === username) {
          item.classList.add("bg-ponghover");
        }
      });
    }

    // Add window resize event listener for mobile responsiveness
    window.addEventListener("resize", () => {
      const chatContainer = document.querySelector(".chat");
      if (window.innerWidth >= 640 && chatContainer) {
        chatContainer.classList.remove(
          "fixed",
          "bottom-0",
          "left-0",
          "w-full",
          "animate-slideUp",
          "animate-slideDown",
          "z-90"
        );
        chatContainer.classList.remove("hidden");
        chatContainer.classList.add("sm:block", "sm:w-[70vw]");
      }
    });

    // Handle opening stored chat if needed
    setTimeout(() => {
      const openChatWithUserData = localStorage.getItem('openChatWithUser');
      if (openChatWithUserData) {
        try {
          const userData = JSON.parse(openChatWithUserData);

          // Make sure this is a recent request (within the last minute)
          if (Date.now() - userData.timestamp < 60000) {
            // Remove the stored data to prevent reopening on refresh
            localStorage.removeItem('openChatWithUser');

            // navigate(`chat/${userData.username}`);
            // Find the chat component that's already initialized
            if (typeof (chatComponent as any).setActiveUser === 'function') {
              console.log(userData);
              // Open chat with the user
              const formattedUserData = {
                nickname: userData.username || userData.nickname,
                id: userData.userId,
                full_name: userData.fullname
              };
              (chatComponent as any).setActiveUser(formattedUserData);

              // Find and highlight the user in the friends list
              const userItems = friendsList.querySelectorAll(".user-item");
              userItems.forEach((item) => {
                // Remove active class from all items
                item.classList.remove("bg-ponghover");

                // Add active class to the selected user
                if ((item as HTMLElement).dataset.username === userData.username) {
                  item.classList.add("bg-ponghover");
                }
              });

              // For mobile: make sure chat is visible
              if (window.innerWidth < 640) {
                chat.classList.remove("hidden");
                chat.classList.add("fixed", "bottom-0", "left-0", "w-full", "z-90", "animate-slideUp");
              }
            }
          }
        } catch (error) {
          console.error("Error processing stored chat user data:", error);
        }
      }
    }, 500);
  },
};
