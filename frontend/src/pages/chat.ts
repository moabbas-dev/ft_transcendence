import { Chat } from "../components/chat/Chat.js";
import { navigate } from "../router.js";
import chatService from "../utils/chatUtils/chatWebSocketService.js";
import store from "../../store/store.js";
import { t } from "../languages/LanguageController.js";
import { FriendsList } from "../components/chat/FriendsList.js";
import { RequestsList } from "../components/chat/RequestsList.js";

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
                ${t('Friends')}
              </button>
              <button id="requests-tab" class="flex-1 text-white py-2 px-4 rounded-md text-center transition-all">
                ${t('Message Requests')}
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
            <div id="friends-list-content"></div>
          </div>

          <!-- Message Requests Container (Hidden by default) -->
          <div id="requests-container" class="message-requests-container flex-col hidden">
            <div class="text-white px-4 pb-2 flex justify-between items-center">
              <div class="requests-loading-indicator hidden">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              </div>
            </div>
            <div id="requests-list-content"></div>
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
    const friendsListContent = container.querySelector("#friends-list-content") as HTMLElement;
    const requestsListContent = container.querySelector("#requests-list-content") as HTMLElement;
    const chat = container.querySelector(".chat") as HTMLElement;
    const loadingIndicator = container.querySelector(".loading-indicator") as HTMLElement;
    const requestsLoadingIndicator = container.querySelector(".requests-loading-indicator") as HTMLElement;

    // Initialize chat component
    const chatComponent = Chat();
    chat.appendChild(chatComponent);

    // Initialize WebSocket connection
    await initializeWebSocket();

    // Get unread count function
    const getUnreadCount = (userId: number): number => {
      return unreadMessageCounts.get(userId) || 0;
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

    // Initialize friends list component
    const friendsList = FriendsList({
      onChatSelect: (user: any) => {
        (chatComponent as any).setActiveUser(user);
      },
      getUnreadCount,
      updateActiveChatItem
    });
    friendsListContent.appendChild(friendsList.element);

    // Initialize message requests component
    const requestsList = RequestsList({
      onChatSelect: (user: any) => {
        (chatComponent as any).setActiveUser(user);
      },
      getUnreadCount,
      updateActiveChatItem
    });
    requestsListContent.appendChild(requestsList.element);

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
      if (requestsList.element.querySelector(".loading")) {
        loadMessageRequests();
      }
    });

    // Logo click event
    const logoContainer = container.querySelector(".logo") as HTMLElement;
    logoContainer.addEventListener("click", () => {
      navigate("/");
    });

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
        friendsList.render(data.friends);
      });

      // Handle message requests list update
      chatService.on("message:requests", (data: any) => {
        console.log(data);
        requestsList.render(data.requests);
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
            friendsList.updateUnreadCount(userId, count);
            requestsList.updateUnreadCount(userId, count);
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
        const isOnline = data.status === "online";
        friendsList.updateUserStatus(data.nickname, isOnline);
        requestsList.updateUserStatus(data.nickname, isOnline);
      });

      // Handle blocked user confirmation
      chatService.on("user:blocked", () => {
        loadFriendsList(); // Reload friends list to update UI
        loadMessageRequests(); // Reload message requests to update UI
      });

      // Handle unblocked user confirmation
      chatService.on("user:unblocked", () => {
        loadFriendsList(); // Reload friends list to update UI
        loadMessageRequests(); // Reload message requests to update UI
      });

      // Handle user added as friend
      chatService.on("user:friend:added", () => {
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
        // Show loading indicator
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
        friendsList.element.innerHTML = '<div class="text-red-500 text-center py-4">Failed to load friends</div>';
      } finally {
        loadingIndicator.classList.add("hidden");
      }

    }

    // Load message requests
    async function loadMessageRequests() {
      try {
        // Show loading indicator
        requestsLoadingIndicator.classList.remove("hidden");

        // Request message requests from server
        if (chatService.isConnected()) {
          chatService.send("message:requests:get", {
            userId: store.userId,
          });

          chatService.send("messages:unread:get", {
            userId: store.userId
          });
        }
      } catch (error) {
        console.error("Error loading message requests:", error);
        requestsList.element.innerHTML = '<div class="text-red-500 text-center py-4">Failed to load message requests</div>';
      } finally {
        requestsLoadingIndicator.classList.add("hidden");
      }
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
              const userItems = friendsList.element.querySelectorAll(".user-item");
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