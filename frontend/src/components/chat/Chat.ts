import store from "../../../store/store.js";
import { createComponent } from "../../utils/StateManager.js";
import chatService from "../../utils/chatWebSocketService.js";
import bgImage from "../../assets/bg1.png";
import bgImage2 from "../../assets/chatBg5.gif"
import { emoticons, emoticonsMap } from "./emoticons.js";
import { Profile } from "../profile/UserProfile.js";
import { t } from "../../languages/LanguageController.js";

interface Message {
  id: number;
  senderId: string | null;
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
            <div class="flex flex-col bg-pongblue bg-custom-gradient justify-between h-screen z-20 gap-2 bg-cover bg-center" style="background-image: ${activeUser ? `url(${bgImage})` : `url(${bgImage2})` }">
                <header class="flex h-fit items-center justify-between py-3 px-2 bg-white">
                    <div class="flex">
                        <div class="back_arrow sm:hidden text-black text-3xl flex items-center justify-center hover:cursor-pointer hover:opacity-80">
                            <i class='bx bx-left-arrow-alt'></i>
                        </div>
                        <div class="flex items-center justify-center gap-1 sm:gap-2"  id="friend_name">
                            <div class="avatar h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold text-gray-700">
                              ${
                                activeUser?.full_name.charAt(0).toUpperCase() ||
                                ""
                              }
                            </div>
                            <div>
                                <p  class="text-base sm:text-xl ${activeUser? "cursor-pointer hover:underline" : ""} ">${
                                  activeUser
                                    ? `${activeUser.full_name} - ${activeUser.nickname}`
                                    : t('chat.nochat')
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
                    ? `<div class="message-input-container flex items-center h-fit bg-gray-800 gap-2 w-full  px-3">
                    <div class="flex items-center w-full  px-2 py-2">
                        <div 
                            id="message-input" 
                            contenteditable="true"
                            role="textbox"
                            class="border rounded-full lg:py-2 py-1 pl-4 [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-[#a0aec0] [&:empty]:before:pointer-events-none focus:outline-none bg-gray-800 text-lg text-white flex-1 max-h-[4.75rem] overflow-y-auto whitespace-pre-wrap [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-pongdark [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:my-2 "
                            autocorrect="off"
                            autocapitalize="off"
                            spellcheck="false"
                            data-placeholder="Type your message..."
                        ></div>
                        <div 
                            id="emoticon-button" 
                            class="flex items-center justify-center hover:cursor-pointer hover:opacity-80 max-sm:bg-slate-400 hover:bg-slate-400 rounded-full w-10 h-10 text-2xl text-white bg-gray-800 transition-all duration-300 mx-1"
                        >
                            <i class='bx bx-smile'></i>
                        </div>
                        <div 
                            id="send-button" 
                            class="flex items-center justify-center hover:cursor-pointer hover:opacity-80 max-sm:bg-slate-400 hover:bg-slate-400 rounded-full w-10 h-10 text-2xl text-white bg-gray-800 transition-all duration-300 -mr-2"
                        >
                            <i class='bx bx-send'></i>
                        </div>
                    </div>
                </div>
                
                <!-- Add emoticon container popup that will be hidden by default -->
                <div id="emoticon-container" class="fixed bottom-20 sm:bottom-20 left-4 right-8 sm:left-auto  sm:w-72 max-h-60 overflow-y-auto max-w-80 bg-black bg-opacity-55 rounded-lg shadow-lg p-2 z-30 grid grid-cols-5 gap-2 hidden">
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
        return `<div class="text-black text-center py-4 opacity-50">No messages yet</div>`;
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
              const isCurrentUser = message.senderId == currentUserId;

              console.log(isCurrentUser);
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

        // Define your emoticons - this is a subset from your paste.txt

        // Create emoticon elements
        emoticons.forEach((emo) => {
          const emoticonDiv = document.createElement("div");
          emoticonDiv.className =
            "emoticon p-2 rounded cursor-pointer w-12 h-12";
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

    const sendMessage = () => {
      const messageInput = container.querySelector(
        "#message-input"
      ) as HTMLDivElement;
      const content = messageInput.innerText.trim();

      if (!content || !activeUser || !chatService.isConnected()) return;

      // Get current user info
      const currentUser = store.userId;
      const currentUsername = store.nickname;

      if (!currentUser || !currentUsername) {
        console.error("Current user not found");
        return;
      }

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

      // Create proper message payload
      const newMessage = {
        from: currentUser,
        to: activeUser.id,
        content,
        timestamp: tempMessage.timestamp,
      };

      // Send via WebSocket
      chatService.send("message:private", newMessage);

      // Clear input
      messageInput.innerText = "";
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
    }) => {
      activeUser = user;

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
        }
      }

      renderChat();
    };

    // Initialize WebSocket event listeners
    const initWebSocketEvents = () => {
      // Listen for received messages
      chatService.on("message:received", (data: any) => {
        const { message, roomId: msgRoomId } = data;

        // Only add message if it's for the current room
        if (msgRoomId === roomId) {
          messages.unshift(message);
          renderChat();
          scrollToBottom();
        }
      });

      // Listen for sent message confirmations
      chatService.on("message:sent", (data: any) => {
        const { message, roomId: msgRoomId } = data;

        // Only add message if it's for the current room
        if (msgRoomId === roomId) {
          messages.unshift(message);
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
