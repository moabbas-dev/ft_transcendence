import store from "../../../store/store.js";
import { createComponent } from "../../utils/StateManager.js";
import chatService from "../../utils/chatUtils/chatWebSocketService.js";
import bgImage from "../../assets/bg3.jpg";
import bgImage2 from "../../assets/background1.gif"
import { emoticons, emoticonsMap } from "./emoticons.js";
import { Profile } from "../profile/UserProfile.js";
import { t } from "../../languages/LanguageController.js";
import axios from "axios";

interface Message {
  id: number;
  senderId: string | null;
  content: string;
  timestamp: number;
}

export const Chat = createComponent(
  (props: {
    activeUser?: { nickname: string; id: number; full_name: string, avatar_url: string };
  }) => {
    const container = document.createElement("div");
    let activeUser = props.activeUser;
    let messages: Message[] = [];
    let roomId: string | null = null;

    // Create the chat UI
    const renderChat = () => {
      container.innerHTML = `
            <div class="flex flex-col bg-black bg-custom-gradient justify-between h-screen z-20 gap-2 bg-cover bg-center" style="background-image: ${activeUser ? `url(${bgImage})` : `url(${bgImage2})` }">
                <header class="flex h-fit items-center justify-between py-3 px-2 bg-[#202c33] shadow-[0_0_15px_rgba(0,247,255,0.3)]">
                    <div class="flex">
                        <div class="back_arrow sm:hidden text-pongcyan text-3xl flex items-center justify-center hover:cursor-pointer hover:opacity-80">
                            <i class='bx bx-left-arrow-alt'></i>
                        </div>
                        <div class="flex items-center z-10 justify-center gap-1 sm:gap-2"  id="friend_name">
                                    
                            <div class="avatar h-12 w-12 rounded-full bg-black border-2 ${activeUser ? 'border-pongcyan' : 'border-pongpink'} flex items-center justify-center text-xl font-semibold ${activeUser ? 'text-pongcyan' : 'text-pongpink'} ${activeUser ? 'shadow-[0_0_10px_rgba(0,247,255,0.4)]' : 'shadow-[0_0_10px_rgba(255,0,228,0.4)]'}">
                              ${activeUser?.avatar_url ? 
                              `<img src="${activeUser?.avatar_url}" class="h-11 w-11 rounded-full" alt="lol"/>` : 
                              activeUser?.full_name?.charAt(0)?.toUpperCase() || "👀"
                              }
                            </div>

                            <div>
                                <p class="text-base sm:text-xl ${activeUser ? "cursor-pointer hover:underline text-pongcyan" : "text-pongpink"} ">${
                                  activeUser
                                    ? `${activeUser.full_name} - ${activeUser.nickname}`
                                    : t('chat.nochat')
                                }</p>
                            </div>
                        </div>
                    </div>

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
                    ? `<div class="message-input-container flex items-center h-fit bg-[#202c33] border-t-2 border-pongcyan shadow-[0_0_15px_rgba(0,247,255,0.3)] gap-2 w-full px-3">
                    <div class="flex items-center w-full px-2 py-2">
                        <div 
                            id="message-input" 
                            contenteditable="true"
                            role="textbox"
                            class="border border-pongcyan rounded-full lg:py-2 py-1 pl-4 [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-[#a0aec0] [&:empty]:before:pointer-events-none focus:outline-none bg-black text-lg text-pongcyan flex-1 max-h-[4.75rem] overflow-y-auto whitespace-pre-wrap [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-pongdark [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:my-2 shadow-[0_0_5px_rgba(0,247,255,0.2)]"
                            autocorrect="off"
                            autocapitalize="off"
                            spellcheck="false"
                            data-placeholder="Type your message..."
                        ></div>
                        <div 
                            id="emoticon-button" 
                            class="flex items-center justify-center hover:cursor-pointer hover:opacity-80 max-sm:bg-pongdark hover:bg-ponghover rounded-full w-10 h-10 text-2xl text-pongpink bg-black transition-all duration-300 mx-1 border border-pongpink shadow-[0_0_5px_rgba(255,0,228,0.3)]"
                        >
                            <i class='bx bx-smile'></i>
                        </div>
                        <div 
                            id="send-button" 
                            class="flex items-center justify-center hover:cursor-pointer hover:opacity-80 max-sm:bg-pongdark hover:bg-ponghover rounded-full w-10 h-10 text-2xl text-pongcyan bg-black transition-all duration-300 -mr-2 border border-pongcyan shadow-[0_0_5px_rgba(0,247,255,0.3)]"
                        >
                            <i class='bx bx-send'></i>
                        </div>
                    </div>
                </div>
                
                <!-- Add emoticon container popup that will be hidden by default -->
                <div id="emoticon-container" class="fixed bottom-20 sm:bottom-20 left-4 right-8 sm:left-auto sm:w-72 max-h-60 overflow-y-auto max-w-80 bg-black bg-opacity-95 rounded-lg shadow-[0_0_15px_rgba(255,0,228,0.5)] border border-pongpink p-2 z-30 grid grid-cols-5 gap-2 hidden">
                    <!-- Emoticons will be inserted here dynamically -->
                </div>`
                    : ""
                }
            </div>
        `;


        

      // Add event listeners after the HTML is rendered
      if (activeUser) {
        setupEventListeners();
      }

      const friend = document.querySelector('#friend_name');
      if (friend) {
        friend.addEventListener('click', () => {
          // Check if the profile popup exists, create it if not
          let profilePopUp = document.querySelector(".profile");
          if (!profilePopUp) {
            profilePopUp = document.createElement("div");
            profilePopUp.className = "profile";
            // Append it to a parent container, e.g. the main container
            container.appendChild(profilePopUp);
          }
          
          const profile = Profile({ 
            uName: activeUser?.nickname,
          });
          console.log(activeUser?.nickname);
          profilePopUp.innerHTML = ''; // Clear existing content
          profilePopUp.appendChild(profile);
        });
      }

      container.querySelector(".back_arrow")?.addEventListener("click", () => {
        const chatContainer = document.querySelector(".chat")!;
        chatContainer.classList.add("animate-slideDown");
        chatContainer.classList.remove("animate-slideUp");
      });
    };

    const formatMessageContent = (content: string): string => {
      // Replace emoticon codes with images
      const emoticonRegex = /:([\w]+):/g;

      return content.replace(emoticonRegex, (match) => {
        const emoticonUrl = emoticonsMap[match as keyof typeof emoticonsMap];

        if (emoticonUrl) {
          return `<img src="${emoticonUrl}" alt="${match}" class="inline-block h-6" />`;
        }

        return match;
      });
    };

    // Render messages in the chat
    const renderMessages = () => {
      if (!messages.length && activeUser) {
        return `<div class="text-pongcyan text-center py-4 opacity-50">No messages yet</div>`;
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
          <div class="flex justify-center items-center w-full bg-black bg-opacity-70 my-2 py-1 rounded-md border-t border-b border-pongcyan">
              <div class="date-header text-center bg-ponghover text-pongcyan rounded-md px-2 py-1 shadow-[0_0_10px_rgba(0,247,255,0.3)]">
                  ${date}
              </div>
          </div>
          ${dateMessages
            .map((message) => {
              const isCurrentUser = message.senderId == currentUserId;

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
                              ? "bg-[#202c33] mr-1 shadow-[0_0_8px_rgba(0,247,255,0.3)]"
                              : "bg-[#005c4b] ml-1 shadow-[0_0_8px_rgba(255,0,228,0.3)]"
                          }
                      ">
                          <div class="message-content break-words text-white">
                              ${formatMessageContent(message.content)}
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
      });

      // Handle block button
      blockButton?.addEventListener("click", () => {
        if (activeUser && chatService.isConnected()) {
          chatService.blockUser(activeUser.nickname);
          // You might want to update the UI to reflect the blocked status
          alert(`${activeUser.full_name} has been blocked`);
        }
      });

      const emoticonButton = container.querySelector("#emoticon-button");
      const emoticonContainer = container.querySelector("#emoticon-container");

      // Toggle emoticon container visibility
      emoticonButton?.addEventListener("click", () => {
        if (emoticonContainer) {
          if (emoticonContainer.classList.contains("hidden")) {
            loadEmoticons();
            emoticonContainer.classList.remove("hidden");
          } else {
            emoticonContainer.classList.add("hidden");
          }
        }
      });

      // Load emoticons into the container
      const loadEmoticons = () => {
        const emoticonContainer = container.querySelector(
          "#emoticon-container"
        );
        if (!emoticonContainer) return;

        // Clear existing emoticons
        emoticonContainer.innerHTML = "";

        // Create emoticon elements
        emoticons.forEach((emo) => {
          const emoticonDiv = document.createElement("div");
          emoticonDiv.className =
            "emoticon p-2 rounded cursor-pointer w-12 h-12 hover:bg-ponghover transition-all duration-200";
          emoticonDiv.title = emo.title;
          emoticonDiv.innerHTML = `<img src="${emo.src}" alt="${emo.title}" class="w-full h-auto">`;

          // Add click event to insert emoticon
          emoticonDiv.addEventListener("click", () => {
            insertEmoticon(emo.title);
            emoticonContainer?.classList.add("hidden");
          });

          emoticonContainer.appendChild(emoticonDiv);
        });
      };

      // Insert emoticon into message input
      const insertEmoticon = (emoticonCode: string) => {
        const messageInput = container.querySelector(
          "#message-input"
        ) as HTMLDivElement;
        if (!messageInput) return;

        messageInput.innerText += emoticonCode + " ";
      };

      // Close emoticon container when clicking outside
      document.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        if (
          emoticonContainer &&
          !emoticonContainer.classList.contains("hidden") &&
          !emoticonContainer.contains(target) &&
          !emoticonButton?.contains(target)
        ) {
          emoticonContainer.classList.add("hidden");
        }
      });
    };

    const sendMessage = async () => {
      const messageInput = container.querySelector("#message-input") as HTMLDivElement;
      const content = messageInput.innerText.trim();

      if (!content || !activeUser || !chatService.isConnected()) return;

      // Get current user info
      const currentUser = store.userId;
      const currentUsername = store.nickname;

      if (!currentUser || !currentUsername) {
        console.error("Current user not found");
        return;
      }

      const body = {
        senderId: parseInt(currentUser),
        recipientId: activeUser.id,
        content,
      }
      await axios.post('http://localhost:3003/api/notifications/user-message', body).catch(err => {
        console.error("Error sending message:", err);
      })

      // Create temporary message for optimistic update
      const tempMessage: Message = {
        id: Date.now(), // Temporary ID (replace with real ID from server later)
        senderId: currentUser,
        content,
        timestamp: Date.now(),
      };

      // Optimistically add message to UI
      messages = [tempMessage, ...messages];
      renderChat();
      scrollToBottom();

      // Clear input
      messageInput.innerText = "";

      // Create proper message payload
      const newMessage = {
        from: currentUser,
        to: activeUser.id,
        content,
        timestamp: tempMessage.timestamp,
      };

      // Send via WebSocket
      chatService.send("message:private", newMessage);
    };

    const scrollToBottom = () => {
      const messageContainer = container.querySelector("#message-container");
      if (messageContainer) {
        messageContainer.scrollTop = 0; // For flex-col-reverse containers
      }
    };

    // Set the active user for chat
    const setActiveUser = (user: {
      nickname: string;
      id: number;
      full_name: string;
      avatar_url: string;
    }) => {
      activeUser = user;
      console.log(activeUser);
    
      // Create room ID (combination of both usernames sorted alphabetically)
      const currentUserId = store.userId;
      if (currentUserId) {
        // Use consistent userId format for roomId
        roomId = [currentUserId, user.id]
          .sort((a: any, b: any) => a - b)
          .join("-");
    
        // Get message history for this room
        if (chatService.isConnected()) {
          chatService.getMessageHistory(roomId);
          
          // Mark messages as read when opening the chat
          chatService.markMessagesAsRead(roomId);
          
          // Request updated unread counts after marking messages as read
          chatService.send("messages:unread:get", {
            userId: store.userId
          });
        }
      }
    
      renderChat();
    };

    // Initialize WebSocket event listeners
    const initWebSocketEvents = () => {
      // Listen for received messages
      chatService.on("message:received", (data: any) => {
        console.log("Received message:", data);
        
        if (!data || !data.message) {
          console.error("Invalid message data received");
          return;
        }
        
        const { message, roomId: msgRoomId } = data;
        
        // Only add message if it's for the current room
        if (msgRoomId === roomId) {
          // Add the new message to the messages array
          messages = [message, ...messages];
          renderChat();
          scrollToBottom();
        }
      });

      // Listen for sent message confirmations
      chatService.on("message:sent", (data: any) => {
        console.log("Message sent confirmation:", data);
        
        if (!data || !data.message) {
          console.error("Invalid message sent data received");
          return;
        }
        
        const { message, roomId: msgRoomId } = data;
        
        // Check if this message is already in our messages array
        // (to avoid duplicates from the optimistic update)
        const messageExists = messages.some(m => 
          m.content === message.content && 
          m.timestamp === message.timestamp
        );
        
        // Only add message if it's for the current room and doesn't already exist
        if (msgRoomId === roomId && !messageExists) {
          messages = [message, ...messages];
          renderChat();
          scrollToBottom();
        }
      });

      chatService.on("messages:history", (data) => {
        if (!data || !data.messages) {
          console.error("Invalid message history data received");
          return;
        }

        const { messages: historyMessages, roomId: msgRoomId } = data;

        // Only set messages if it's for the current room
        if (msgRoomId === roomId) {
          messages = historyMessages; // Most recent first
          renderChat();
          scrollToBottom();
        }
      });

      // Listen for errors
      chatService.on("error", (data) => {
        console.error("WebSocket error:", data.message);
        // You might want to show an error message to the user
      });

      // Listen for user blocked confirmation
      chatService.on("user:blocked", (data) => {
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
      getCurrentActiveChatId: () => activeUser ? activeUser.id : null
    });
  }
);