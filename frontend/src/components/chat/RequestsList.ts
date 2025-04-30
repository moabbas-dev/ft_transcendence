import { ChatItem } from "./ChatItem.js";
import { t } from "../../languages/LanguageController.js";

interface User {
  nickname: string;
  id: number;
  full_name: string;
  status: string;
  avatar_url: string;
}

interface RequestItem {
  user: User;
}

interface RequestsListProps {
  onChatSelect: (user: any) => void;
  getUnreadCount: (userId: number) => number;
  updateActiveChatItem: (username: string, container: HTMLElement) => void;
}

export const RequestsList = (props: RequestsListProps) => {
  const requestsListElement = document.createElement("div");
  requestsListElement.className = "message-requests-list sm:flex flex-col scroll-pr-4 pl-4 flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:white_pongdark] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-ponghover [&::-webkit-scrollbar-track]:rounded [&::-webkit-scrollbar-thumb]:bg-pongdark [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb:hover]:bg-[#2d3748]";
  
  // Initialize with loading state
  requestsListElement.innerHTML = `<div class="loading text-center text-white py-4">${t('loadingRequests')}</div>`;
  
  // Render message requests list
  const renderRequestsList = (requests: RequestItem[]) => {
    // Clear current content
    requestsListElement.innerHTML = "";
    
    if (!requests || requests.length === 0) {
      requestsListElement.innerHTML = '<div class="text-white text-center py-4 opacity-50">No message requests</div>';
      return;
    }
    
    // Add the search box at the top
    const searchBox = document.createElement("div");
    searchBox.className = "search-box mb-4 px-4";
    searchBox.innerHTML = `
      <div class="relative">
        <input type="text" class="w-full bg-black text-pongcyan border border-pongcyan rounded-full py-2 px-4 pl-10 focus:outline-none drop-shadow-[2px_2px_2px_#00f7ff]" placeholder="Search requests...">
        <div class="absolute left-3 top-2.5 text-white">
          <i class="fa-solid fa-search text-pongpink"></i>
        </div>
      </div>
    `;
    requestsListElement.appendChild(searchBox);
    
    // Add section title for online users
    const onlineUsers = requests.filter((item) => item.user && item.user.status === "online");
    if (onlineUsers.length > 0) {
      const onlineTitle = document.createElement("div");
      onlineTitle.className = "text-white text-lg font-medium mt-2 mb-1 drop-shadow-[1px_1px_20px_white]";
      onlineTitle.textContent = "Online";
      requestsListElement.appendChild(onlineTitle);
      
      // Render online users
      onlineUsers.forEach((item) => {
        const user = item.user;
        // console.log(user);
        if (!user) return;
        
        const chatItemElement = ChatItem({
          username: user.nickname,
          userId: user.id,
          fullname: user.full_name,
          status: true,
          avatar_url: user.avatar_url,
          unreadCount: props.getUnreadCount(user.id),
          onChatSelect: (user: any) => {
            props.onChatSelect(user);
            props.updateActiveChatItem(user.nickname, requestsListElement);
          },
        });
        chatItemElement.dataset.username = user.nickname;
        chatItemElement.dataset.userId = user.id.toString();
        requestsListElement.appendChild(chatItemElement);
      });
    }
    
    // Add section title for offline users
    const offlineUsers = requests.filter((item) => item.user && item.user.status === "offline");
    if (offlineUsers.length > 0) {
      const offlineTitle = document.createElement("div");
      offlineTitle.className = "text-white text-lg font-medium mt-4 mb-1 drop-shadow-[1px_1px_20px_white]";
      offlineTitle.textContent = "Offline";
      requestsListElement.appendChild(offlineTitle);
      
      // Render offline users
      offlineUsers.forEach((item) => {
        const user = item.user;
        if (!user) return;
        
        const chatItemElement = ChatItem({
          username: user.nickname,
          userId: user.id,
          fullname: user.full_name,
          status: false,
          avatar_url: user.avatar_url,
          unreadCount: props.getUnreadCount(user.id),
          onChatSelect: (user: any) => {
            props.onChatSelect(user);
            props.updateActiveChatItem(user.nickname, requestsListElement);
          },
        });
        chatItemElement.dataset.username = user.nickname;
        chatItemElement.dataset.userId = user.id.toString();
        requestsListElement.appendChild(chatItemElement);
      });
    }
    
    // Setup search functionality
    const searchInput = searchBox.querySelector("input");
    searchInput?.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      const searchTerm = target.value.toLowerCase();
      
      // Filter requests list based on search term
      const userItems = requestsListElement.querySelectorAll(".user-item");
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
      const sectionTitles = requestsListElement.querySelectorAll(".text-white.text-lg.font-medium");
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
  };
  
  // Update user online status
  const updateUserStatus = (username: string, isOnline: boolean) => {
    const userItems = requestsListElement.querySelectorAll(".user-item");
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
            requestsListElement.querySelectorAll(".text-white.text-lg.font-medium")
          ).find((el) => el.textContent === "Online");
          if (onlineTitle) {
            onlineTitle.after(item);
          }
        } else {
          const offlineTitle = Array.from(
            requestsListElement.querySelectorAll(".text-white.text-lg.font-medium")
          ).find((el) => el.textContent === "Offline");
          if (offlineTitle) {
            offlineTitle.after(item);
          }
        }
      }
    });
  };
  
  // Update unread message count for a chat item
  const updateUnreadCount = (userId: number, count: number) => {
    const userItems = requestsListElement.querySelectorAll(".user-item");
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
              "absolute top-0 right-0 bg-red-600 text-white rounded-full " +
              "text-xs min-w-[20px] h-5 flex items-center justify-center px-1 shadow-[0_0_10px_rgba(255,0,228,0.6)] animate-pulse";
            badge.textContent = count > 9 ? '9+' : count.toString();
            avatarContainer.appendChild(badge);
          }
        }
      }
    });
  };
  
  return {
    element: requestsListElement,
    render: renderRequestsList,
    updateUserStatus,
    updateUnreadCount
  };
};