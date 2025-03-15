import store from "../../../store/store.js";
import { createComponent } from "../../utils/StateManager.js";
import chatService from "../../utils/chatWebSocketService.js";

interface Message {
  id: number;
  from: string;
  content: string;
  timestamp: number;
}

export const Chat = createComponent(
  (props: {
    activeUser?: { nickname: string; id: number; full_name: string };
  }) => {
    const container = document.createElement("div");
    let activeUser = props.activeUser;
    let messages: Message[] = [];
    let roomId: string | null = null;

    // Create the chat UI
    const renderChat = () => {
      container.innerHTML = `
            <div class="flex flex-col bg-pongblue bg-custom-gradient justify-between px-1 sm:px-2 h-screen z-20 gap-2">
                <header class="flex rounded-full mt-2 h-fit items-center justify-between py-3 px-2 bg-white">
                    <div class="flex">
                        <div class="back_arrow sm:hidden text-black text-3xl flex items-center justify-center hover:cursor-pointer hover:opacity-80">
                            <i class='bx bx-left-arrow-alt'></i>
                        </div>
                        <div class="flex items-center justify-center gap-1 sm:gap-2">
                            <div class="friend_icon w-10 h-10 2xl:w-12 2xl:h-12 bg-black rounded-full"></div>
                            <div>
                                <p class="friend_name text-base sm:text-xl">${
                                  activeUser
                                    ? `${activeUser.full_name} - ${activeUser.nickname}`
                                    : "Select a chat"
                                }</p>
                            </div>
                        </div>
                    </div>
                    ${
                      activeUser
                        ? `
                    <div class="flex items-center gap-2 justify-center">
                        <button type="button" class="block-btn text-base sm:text-lg text-white bg-pongdark rounded-full px-3 py-1 hover:opacity-80">Block</button>
                        <button type="button" class="invite-btn text-base sm:text-lg text-white bg-pongblue rounded-full px-3 py-1 hover:opacity-80">Invite</button>
                    </div>
                    `
                        : ""
                    }
                </header>
                <section id="message-container" class="chat_core overflow-y-auto [scrollbar-width:thin] [scrollbar-color:white_pongdark]
                [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2
                [&::-webkit-scrollbar-track]:bg-ponghover [&::-webkit-scrollbar-track]:rounded
                [&::-webkit-scrollbar-thumb]:bg-pongdark [&::-webkit-scrollbar-thumb]:rounded
                [&::-webkit-scrollbar-thumb:hover]:bg-[#2d3748] h-fit flex-1 flex flex-col-reverse gap-0.5">
                    ${renderMessages()}
                </section>
                ${
                  activeUser
                    ? `
                <div class="message-input-container flex items-center h-fit bg-pongdark gap-2 w-full rounded-full px-3 mb-16 sm:mb-4">
                    <div class="flex items-center w-full px-2 py-2">
                        <div 
                            id="message-input" 
                            contenteditable="true"
                            role="textbox"
                            class="[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-[#a0aec0] [&:empty]:before:pointer-events-none focus:outline-none bg-pongdark text-lg text-white flex-1 max-h-[4.75rem] overflow-y-auto whitespace-pre-wrap [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-pongdark [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:my-2"
                            autocorrect="off"
                            autocapitalize="off"
                            spellcheck="false"
                            data-placeholder="Type your message..."
                        ></div>
                        <div 
                            id="send-button" 
                            class="flex items-center justify-center hover:cursor-pointer hover:opacity-80 max-sm:bg-slate-400 hover:bg-slate-400 rounded-full w-10 h-10 text-2xl text-white bg-pongdark transition-all duration-300 -mr-2"
                        >
                            <i class='bx bx-send'></i>
                        </div>
                    </div>
                </div>
                `
                    : ""
                }
            </div>
        `;

      // Add event listeners after the HTML is rendered
      if (activeUser) {
        setupEventListeners();
      }

      container.querySelector(".back_arrow")?.addEventListener("click", () => {
        const chatContainer = document.querySelector(".chat")!;
        chatContainer.classList.add("animate-slideDown");
        chatContainer.classList.remove("animate-slideUp");
      });
    };

    // Render messages in the chat
    const renderMessages = () => {
      if (!messages.length) {
        return `<div class="text-white text-center py-4 opacity-50">No messages yet</div>`;
      }

      const currentUserId = store.userId;

      // Group messages by date
      const messagesByDate = messages.reduce((acc, message) => {
        const date = new Date(message.timestamp).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
        });

        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(message);
        return acc;
      }, {} as Record<string, Message[]>);

      return Object.entries(messagesByDate)
        .map(([date, dateMessages]) => {
          return `
            <div class="flex justify-center items-center w-full bg-slate-500 bg-opacity-30 my-2 py-1 rounded-md">
                <div class="date-header text-center bg-ponghover text-white rounded-md px-2 py-1">
                    ${date}
                </div>
            </div>
            ${dateMessages
              .map((message) => {
                const isCurrentUser = message.from === currentUserId;
                const messageTime = new Date(
                  message.timestamp
                ).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                });

                return `
                    <div class="flex w-full ${
                      isCurrentUser ? "justify-end" : "justify-start"
                    }">
                        <div class="
                            flex flex-col justify-center pt-1 px-2 rounded-lg
                            max-w-[250px] md:max-w-sm break-words 2xl:max-w-xl
                            text-white [direction:ltr] min-w-0 text-[17px] text-left
                            ${
                              isCurrentUser
                                ? "bg-blue-900 mr-1"
                                : "bg-pongdark ml-1"
                            }
                        ">
                            <div class="message-content break-words">
                                ${message.content}
                            </div>
                            <span class="text-xs text-gray-400">${messageTime}</span>
                        </div>
                    </div>
                `;
              })
              .join("")}
        `;
        })
        .join("");
    };

    // Setup event listeners for the chat
    const setupEventListeners = () => {
      const sendButton = container.querySelector("#send-button");
      const messageInput = container.querySelector(
        "#message-input"
      ) as HTMLDivElement;
      const blockButton = container.querySelector(".block-btn");

      // Handle send message button click
      sendButton?.addEventListener("click", () => {
        sendMessage();
      });

      // Handle enter key press
      messageInput?.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }

        // Send typing indicator
        if (activeUser && chatService.isConnected()) {
          chatService.sendTypingIndicator(activeUser.nickname);
        }
      });

      // Handle block button
      blockButton?.addEventListener("click", () => {
        if (activeUser && chatService.isConnected()) {
          chatService.blockUser(activeUser.nickname);
          // You might want to update the UI to reflect the blocked status
          alert(`${activeUser.full_name} has been blocked`);
        }
      });
    };

    const sendMessage = () => {
        const messageInput = container.querySelector('#message-input') as HTMLDivElement;
        const content = messageInput.innerText.trim();
        
        if (!content || !activeUser || !chatService.isConnected()) return;
    
        // Get current user from store/localStorage
        const currentUser = store.userId; // Or localStorage.getItem('userId')
        const currentUsername = store.nickname; // Or localStorage.getItem('username')
    
        if (!currentUser || !currentUsername) {
            console.error('Current user not found');
            return;
        }
    
        // Create proper message payload
        const newMessage = {
            from: currentUser, // User ID
            to: activeUser.id, // Recipient ID
            content,
            timestamp: Date.now()
        };
    
        // Send via WebSocket
        chatService.send('message:private', newMessage);
    
        // Clear input
        messageInput.innerText = '';
    };

    // Set the active user for chat
    const setActiveUser = (user: {
      nickname: string;
      id: number;
      full_name: string;
    }) => {
      activeUser = user;

      // Create room ID (combination of both usernames sorted alphabetically)
      const currentUsername = localStorage.getItem("username");
      if (currentUsername) {
        roomId = [currentUsername, user.nickname].sort().join("-");

        // Get message history for this room
        if (chatService.isConnected()) {
          chatService.getMessageHistory(roomId);
        }
      }

      renderChat();
    };

    // Initialize WebSocket event listeners
    const initWebSocketEvents = () => {

            // Listen for sent/received messages
    const handleNewMessage = (data: { roomId: string; message: any }) => {
        if (data.roomId === roomId) {
            messages = [data.message, ...messages]; // Add to beginning
            renderChat();
            
            // Auto-scroll to bottom
            const container = document.getElementById('message-container');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }
    };

    chatService.on('message:received', handleNewMessage);
    chatService.on('message:sent', handleNewMessage);


      // Listen for received messages
      chatService.on("message:received", (data: any) => {
        const { message, roomId: msgRoomId } = data;

        // Only add message if it's for the current room
        if (msgRoomId === roomId) {
          messages.unshift(message);
          renderChat();
        }
      });

      // Listen for sent message confirmations
      chatService.on("message:sent", (data: any) => {
        const { message, roomId: msgRoomId } = data;

        // Only add message if it's for the current room
        if (msgRoomId === roomId) {
          messages.unshift(message);
          renderChat();
        }
      });

      // Listen for message history
      chatService.on("messages:history", (data) => {
        const { messages: historyMessages, roomId: msgRoomId } = data;

        // Only set messages if it's for the current room
        if (msgRoomId === roomId) {
          messages = historyMessages.reverse(); // Most recent first
          renderChat();
        }
      });

      // Listen for typing indicators
      chatService.on("user:typing", (data) => {
        const { username } = data;

        // Only show typing indicator if it's from the active chat user
        if (activeUser && username === activeUser.nickname) {
          // Add typing indicator to the UI
          const typingIndicator = document.createElement("div");
          typingIndicator.className =
            "typing-indicator text-white text-sm opacity-70 self-start ml-4";
          typingIndicator.textContent = "Typing...";

          // Remove any existing typing indicator
          container.querySelector(".typing-indicator")?.remove();

          // Add the new typing indicator
          container
            .querySelector("#message-container")
            ?.appendChild(typingIndicator);

          // Remove the typing indicator after 2 seconds
          setTimeout(() => {
            typingIndicator.remove();
          }, 2000);
        }
      });

      // Listen for errors
      chatService.on("error", (data) => {
        console.error("WebSocket error:", data.message);
        // You might want to show an error message to the user
      });

      // Listen for user blocked confirmation
      chatService.on("user:blocked", (data) => {
        console.log(`User ${data.username} has been blocked`);
        // You might want to update the UI to reflect the blocked status
      });
    };

    // Initialize the component
    const init = () => {
      renderChat();
      initWebSocketEvents();

      // Initialize with activeUser if provided
      if (props.activeUser) {
        setActiveUser(props.activeUser);
      }
    };

    // Initialize the component
    init();

    // Return the component with its public methods
    return Object.assign(container, {
      setActiveUser,
    });
  }
);
