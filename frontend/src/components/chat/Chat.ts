/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Chat.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: moabbas <moabbas@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/22 15:13:53 by afarachi          #+#    #+#             */
/*   Updated: 2025/06/28 13:28:27 by moabbas          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import store from "../../../store/store.js";
import { createComponent } from "../../utils/StateManager.js";
import chatService from "../../utils/chatUtils/chatWebSocketService.js";
import bgImage from "../../assets/bg3.jpg";
import bgImage2 from "../../assets/background1.gif"
import { emojis, emojisMap, emoticons, emoticonsMap, stickers, stickersMap } from "./emoticons.js";
import { Profile } from "../profile/UserProfile.js";
import { t } from "../../languages/LanguageController.js";
import axios from "axios";
import { GameInviteMessage } from "./GameInviteMessage.js";
import Toast from "../../toast/Toast.js";
import DOMPurify from 'dompurify';

interface Message {
  id: number | string;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: number | string;
  messageType?: string;
  gameInviteData?: {
    gameType: string;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
    inviteId: string;
  };
}

export const Chat = createComponent(
  (props: {
    activeUser?: { nickname: string; id: number; full_name: string, avatar_url: string };
  }) => {
    const container = document.createElement("div");
    let activeUser = props.activeUser;
    let messages: Message[] = [];
    let roomId: string | null = null;

    const isRTL = document.documentElement.dir === 'rtl' ||
      document.documentElement.lang === 'ar' ||
      getComputedStyle(document.documentElement).direction === 'rtl';

    const renderChat = () => {
      container.innerHTML = `
            <div class="flex flex-col bg-black bg-custom-gradient justify-between h-[100svh] w-full z-20 gap-1 md:gap-2 bg-cover bg-center" style="background-image: ${activeUser ? `url(${bgImage})` : `url(${bgImage2})`}">
                <header class="flex h-fit w-full items-center justify-between py-2 md:py-3 px-1 md:px-2 bg-[#202c33] shadow-[0_0_15px_rgba(0,247,255,0.3)]">
                    <div class="flex w-full">
                      <!--
                        <div class="back_arrow block md:hidden text-pongcyan text-2xl md:text-3xl flex items-center justify-center hover:cursor-pointer hover:opacity-80 mr-1">
                            <i class='bx bx-left-arrow-alt'></i>
                        </div> -->
                        <div class="flex items-center z-10 justify-center gap-1 sm:gap-2"  id="friend_name">
                                    
                            <div class="avatar h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-black border-2 ${activeUser ? 'border-pongcyan' : 'border-pongpink'} flex items-center justify-center text-base sm:text-lg md:text-xl font-semibold ${activeUser ? 'text-pongcyan' : 'text-pongpink'} ${activeUser ? 'shadow-[0_0_10px_rgba(0,247,255,0.4)]' : 'shadow-[0_0_10px_rgba(255,0,228,0.4)]'}">
                              ${activeUser?.avatar_url ?
          `<img src="${activeUser?.avatar_url}" class="h-7 w-7 sm:h-9 sm:w-9 md:h-11 md:w-11 rounded-full" alt="user avatar"/>` :
          activeUser?.full_name?.charAt(0)?.toUpperCase() || "💬"
        }
                            </div>
                            <div>
                                <p class="text-sm sm:text-base md:text-xl ${activeUser ? "cursor-pointer hover:underline text-pongcyan" : "text-pongpink"} truncate max-w-[200px] sm:max-w-none">${activeUser
          ? `${activeUser.full_name} - ${activeUser.nickname}`
          : t('chat.nochat')
        }</p>
                            </div>
                        </div>
                    </div>
                </header>
                <section id="message-container" class="chat_core w-full overflow-y-auto [scrollbar-width:thin] [scrollbar-color:white_pongdark]
                [&::-webkit-scrollbar]:w-1 md:[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2
                [&::-webkit-scrollbar-track]:bg-ponghover [&::-webkit-scrollbar-track]:rounded
                [&::-webkit-scrollbar-thumb]:bg-pongdark [&::-webkit-scrollbar-thumb]:rounded
                [&::-webkit-scrollbar-thumb:hover]:bg-[#2d3748] h-fit flex-1 flex flex-col-reverse gap-0.5 px-1 md:px-2">
                    ${renderMessages()}
                </section>
                ${activeUser
          ? `<div id="message-input-container" class="message-input-container flex items-center h-fit bg-[#202c33]   gap-1 md:gap-2 w-full px-2 md:px-3 pb-safe">
                    <div class="flex items-center w-full px-1 md:px-2 py-2">
                        <div 
                            id="message-input" 
                            contenteditable="true"
                            role="textbox"
                            class="border border-pongcyan rounded-full py-1 md:py-2 px-2 md:px-3 [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-[#a0aec0] [&:empty]:before:pointer-events-none focus:outline-none bg-black text-base md:text-lg text-pongcyan flex-1 max-h-[3rem] md:max-h-[4.75rem] overflow-y-auto whitespace-pre-wrap [&::-webkit-scrollbar]:w-1 md:[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-pongdark [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:my-1 md:[&::-webkit-scrollbar-track]:my-2 shadow-[0_0_5px_rgba(0,247,255,0.2)]"
                            autocorrect="off"
                            autocapitalize="off"
                            spellcheck="false"
                            data-placeholder="${t('chat.typeMessage')}"
                        ></div>
                        <div class="flex items-center justify-center gap-1">
                        <div 
                            id="emoticon-button" 
                            class="flex items-center justify-center hover:cursor-pointer hover:opacity-80 bg-black hover:bg-ponghover rounded-full w-8 h-8 md:w-10 md:h-10 text-xl md:text-2xl text-pongpink transition-all duration-300 mx-1 border border-pongpink shadow-[0_0_5px_rgba(255,0,228,0.3)]"
                        >
                            <i class='bx bx-smile'></i>
                        </div>
                        <div 
                            id="send-button" 
                            class="flex items-center justify-center hover:cursor-pointer hover:opacity-80 bg-black hover:bg-ponghover rounded-full w-8 h-8 md:w-10 md:h-10 text-xl md:text-2xl text-pongcyan transition-all duration-300 border border-pongcyan shadow-[0_0_5px_rgba(0,247,255,0.3)]"
                        >
                            <i class='bx bx-up-arrow-alt'></i>  
                        </div>
                        </div>
                    </div>
                </div>
                
                <!-- Enhanced emoticon container with tabs -->
                <div id="emoticon-container" class="fixed bottom-20 left-1 right-1 sm:left-auto sm:right-8 sm:w-72 max-h-64 sm:max-h-80 bg-black bg-opacity-95 rounded-lg shadow-[0_0_15px_rgba(255,0,228,0.5)] border border-pongpink p-1 sm:p-2 z-30 hidden">
                  <!-- Tab headers -->
                  <div class="emoticon-tabs flex justify-start border-b border-pongpink mb-1 sm:mb-2 text-sm sm:text-base">
                    <div id="emojis-tab" class="tab-item px-2 sm:px-4 py-1 cursor-pointer text-pongcyan border-b-2 border-pongcyan">Emojis</div>
                    <div id="emoticon-tab" class="tab-item px-2 sm:px-4 py-1 cursor-pointer text-pongcyan">Emoticons</div>
                    <div id="sticker-tab" class="tab-item px-2 sm:px-4 py-1 cursor-pointer text-gray-400 hover:text-pongcyan">Stickers</div>
                    </div>
                  
                  <!-- Tab contents with scrollable area -->
                  <div class="tabs-content h-40 sm:h-60 overflow-auto [scrollbar-width:thin] [scrollbar-color:white_pongdark] [&::-webkit-scrollbar]:w-1 sm:[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-ponghover [&::-webkit-scrollbar-thumb]:bg-pongdark">
                    
                    <div id="emogis-tab-content" class="grid grid-cols-6 sm:grid-cols-5 gap-1 sm:gap-2">
                      <!-- Emojis will be inserted here dynamically -->
                    </div>
                  <!-- Emoticons tab content -->
                    <div id="emoticon-tab-content" class="grid grid-cols-6 sm:grid-cols-5 gap-1 sm:gap-2">
                      <!-- Emoticons will be inserted here dynamically -->
                    </div>
                    
                    <!-- Stickers tab content -->
                    <div id="sticker-tab-content" class="grid grid-cols-3 sm:grid-cols-4 gap-1 sm:gap-2 hidden">
                      <!-- Stickers will be inserted here dynamically -->
                    </div>
                  </div>
                </div>`
          : ""
        }
            </div>
        `;

      if (activeUser) {
        setupEventListeners();
        renderGameInvites();
      }

      const friend = document.querySelector('#friend_name');
      if (friend) {
        friend.addEventListener('click', () => {
          let profilePopUp = document.querySelector(".profile");
          if (!profilePopUp) {
            profilePopUp = document.createElement("div");
            profilePopUp.className = "profile";
            container.appendChild(profilePopUp);
          }

          const profile = Profile({
            uName: activeUser?.nickname,
          });
          console.log(activeUser?.nickname);
          profilePopUp.innerHTML = '';
          profilePopUp.appendChild(profile);
        });
      }

      container.querySelector(".back_arrow")?.addEventListener("click", () => {
        const chatContainer = document.querySelector(".chat")!;
        chatContainer.classList.add("animate-slideDown");
        chatContainer.classList.remove("animate-slideUp");
      });
    };

    const renderGameInvites = () => {
      const gameInviteContainers = container.querySelectorAll('.game-invite-container');

      gameInviteContainers.forEach(container => {
        const messageId = container.getAttribute('data-message-id');
        const from = container.getAttribute('data-from');
        const to = container.getAttribute('data-to');
        const gameType = container.getAttribute('data-game-type');
        const timestamp = container.getAttribute('data-timestamp');
        const status = container.getAttribute('data-status');
        const inviteId = container.getAttribute('data-invite-id');

        if (messageId && from && to && timestamp && status && inviteId) {
          const gameInviteElement = GameInviteMessage({
            messageId,
            from,
            to,
            gameType: gameType || '1v1',
            timestamp,
            status: status as 'pending' | 'accepted' | 'declined' | 'expired',
            inviteId
          });

          container.innerHTML = '';
          container.appendChild(gameInviteElement);
        }
      });
    };

    // const formatMessageContent = (content: string): string => {
    //   const emoticonRegex = /:([\w]+):/g;

    //   return content.replace(emoticonRegex, (match) => {
    //     const emojiUrl = emojisMap[match as keyof typeof emojisMap];
    //     if (emojiUrl) {
    //       return `<img src="${emojiUrl}" alt="${match}" class="inline-block h-6" />`;
    //     }

    //     const emoticonUrl = emoticonsMap[match as keyof typeof emoticonsMap];
    //     if (emoticonUrl) {
    //       return `<img src="${emoticonUrl}" alt="${match}" class="inline-block h-6" />`;
    //     }

    //     const stickerUrl = stickersMap[match as keyof typeof stickersMap];
    //     if (stickerUrl) {
    //       return `<img src="${stickerUrl}" alt="${match}" class="inline-block h-16 w-16" />`;
    //     }

    //     return match;
    //   });
    // };


const formatMessageContent = (content: string): string => {
  const emoticonRegex = /:([\w]+):/g;
  const formatted = content.replace(emoticonRegex, (match) => {
    const emojiUrl = emojisMap[match as keyof typeof emojisMap];
    if (emojiUrl) {
      return `<img src="${emojiUrl}" alt="${match}" class="inline-block h-6" />`;
    }
    const emoticonUrl = emoticonsMap[match as keyof typeof emoticonsMap];
    if (emoticonUrl) {
      return `<img src="${emoticonUrl}" alt="${match}" class="inline-block h-6" />`;
    }
    const stickerUrl = stickersMap[match as keyof typeof stickersMap];
    if (stickerUrl) {
      return `<img src="${stickerUrl}" alt="${match}" class="inline-block h-16 w-16" />`;
    }
    return match;
  });
  
	// Sanitize the final HTML
	return DOMPurify.sanitize(formatted, {
		ALLOWED_TAGS: ['img'],
		ALLOWED_ATTR: ['src', 'alt', 'class']
	});
};

    const renderMessages = () => {
      if (!messages.length && activeUser) {
        return `<div class="text-pongcyan text-center py-4 opacity-50">No messages yet</div>`;
      }

      const currentUserId = store.userId;

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

          ${dateMessages
              .map((message) => {
                if (message.messageType === 'game_invite') {
                  return `
                    <div class="game-invite-container" data-message-id="${message.id}" data-from="${message.senderId}" data-to="${message.receiverId}" data-game-type="${message.gameInviteData?.gameType || '1v1'}" data-timestamp="${new Date(
                    message.timestamp
                  ).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}" data-status="${message.gameInviteData?.status || 'pending'}" data-invite-id="${message.gameInviteData?.inviteId || message.id}">
                      <!-- Game invite message will be rendered here by JavaScript -->
                      <div class="game-invite-placeholder">${formatMessageContent(message.content)}</div>
                    </div>
                  `;
                }

                const isCurrentUser = message.senderId == parseInt(currentUserId || '');

                const messageTime = new Date(
                  message.timestamp
                ).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                });
				// const messageContent = container.querySelector(".message-content")!
				// messageContent.textContent = formatMessageContent(message.content)

                return `
                  <div class="flex w-full ${isCurrentUser ? "justify-end" : "justify-start"}">
                      <div class="
                          flex flex-col justify-center pt-1 px-2 rounded-lg
                          max-w-[250px] md:max-w-sm break-words 2xl:max-w-xl
                          text-white [direction:ltr] min-w-0 text-[17px] text-left
                          ${isCurrentUser
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
              <div class="flex justify-center items-center w-full bg-black bg-opacity-70 my-2 py-1 rounded-md border-t border-b border-pongcyan">
                <div class="date-header text-center bg-ponghover text-pongcyan rounded-md px-2 py-1 shadow-[0_0_10px_rgba(0,247,255,0.3)]">
                  ${date}
                </div>
              </div>
      `;
        })
        .join("");
    };


    const setupEventListeners = () => {
      const sendButton = container.querySelector("#send-button");
      const messageInput = container.querySelector(
        "#message-input"
      ) as HTMLDivElement;
      const blockButton = container.querySelector(".block-btn");

      sendButton?.addEventListener("click", () => {
        sendMessage();
      });

      messageInput?.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });

      blockButton?.addEventListener("click", () => {
        if (activeUser && chatService.isConnected()) {
          chatService.blockUser(activeUser.nickname);
          alert(`${activeUser.full_name} has been blocked`);
        }
      });

      const emoticonButton = container.querySelector("#emoticon-button");
      const emoticonContainer = container.querySelector("#emoticon-container");

      emoticonButton?.addEventListener("click", () => {
        if (emoticonContainer) {
          if (emoticonContainer.classList.contains("hidden")) {
            loadEmoticonContent();
            emoticonContainer.classList.remove("hidden");
          } else {
            emoticonContainer.classList.add("hidden");
          }
        }
      });

      const setupTabEvents = () => {
        const emojisTab = container.querySelector("#emojis-tab");
        const emoticonTab = container.querySelector("#emoticon-tab");
        const stickerTab = container.querySelector("#sticker-tab");
        const emojisContent = container.querySelector("#emogis-tab-content");
        const emoticonContent = container.querySelector("#emoticon-tab-content");
        const stickerContent = container.querySelector("#sticker-tab-content");

        let emojisLoaded = false;
        let emoticonsLoaded = false;
        let stickersLoaded = false;

        emojisTab?.addEventListener("click", () => {
          emojisTab.classList.add("text-pongcyan", "border-b-2", "border-pongcyan");
          emojisTab.classList.remove("text-gray-400");
          emoticonTab?.classList.remove("text-pongcyan", "border-b-2", "border-pongcyan");
          emoticonTab?.classList.add("text-gray-400", "hover:text-pongcyan");
          stickerTab?.classList.remove("text-pongpink", "border-b-2", "border-pongpink");
          stickerTab?.classList.add("text-gray-400", "hover:border-pongcyan");

          emojisContent?.classList.remove("hidden");
          emoticonContent?.classList.add("hidden");
          stickerContent?.classList.add("hidden");

          if (!emojisLoaded) {
            loadEmojis();
            emojisLoaded = true;
          }
        });

        emoticonTab?.addEventListener("click", () => {
          emoticonTab.classList.add("text-pongcyan", "border-b-2", "border-pongcyan");
          emoticonTab.classList.remove("text-gray-400");
          emojisTab?.classList.remove("text-pongcyan", "border-b-2", "border-pongcyan");
          emojisTab?.classList.add("text-gray-400", "hover:text-pongcyan");
          stickerTab?.classList.remove("text-pongpink", "border-b-2", "border-pongpink");
          stickerTab?.classList.add("text-gray-400", "hover:border-pongcyan");

          emoticonContent?.classList.remove("hidden");
          emojisContent?.classList.add("hidden");
          stickerContent?.classList.add("hidden");

          if (!emoticonsLoaded) {
            loadEmoticons();
            emoticonsLoaded = true;
          }
        });

        stickerTab?.addEventListener("click", () => {
          stickerTab.classList.add("text-pongcyan", "border-b-2", "border-pongcyan");
          stickerTab.classList.remove("text-gray-400");
          emoticonTab?.classList.remove("text-pongcyan", "border-b-2", "border-pongcyan");
          emoticonTab?.classList.add("text-gray-400", "hover:text-pongcyan");
          emojisTab?.classList.remove("text-pongcyan", "border-b-2", "border-pongcyan");
          emojisTab?.classList.add("text-gray-400", "hover:text-pongcyan");

          stickerContent?.classList.remove("hidden");
          emoticonContent?.classList.add("hidden");
          emojisContent?.classList.add("hidden");

          if (!stickersLoaded) {
            loadStickers();
            stickersLoaded = true;
          }
        });
      };

      const setupEmoticonContainer = () => {
        setupTabEvents();
        loadEmojis();
      };

      const loadEmoticonContent = () => {
        setupEmoticonContainer();
      };

      const loadEmojis = () => {
        const emojisContent = container.querySelector("#emogis-tab-content");
        if (!emojisContent) return;

        emojisContent.innerHTML = "";

        emojis.forEach((emo) => {
          const emojiDiv = document.createElement("div");
          emojiDiv.className =
            "emoticon p-2 rounded cursor-pointer flex items-center justify-center hover:bg-ponghover transition-all duration-200";
          emojiDiv.title = emo.title;
          emojiDiv.innerHTML = `<img src="${emo.src}" alt="${emo.title}" class="h-6">`;

          emojiDiv.addEventListener("click", () => {
            insertEmoticon(emo.title);
            emoticonContainer?.classList.add("hidden");
          });

          emojisContent.appendChild(emojiDiv);
        });
      };

      const loadEmoticons = () => {
        const emoticonContent = container.querySelector("#emoticon-tab-content");
        if (!emoticonContent) return;

        emoticonContent.innerHTML = "";

        emoticons.forEach((emo) => {
          const emoticonDiv = document.createElement("div");
          emoticonDiv.className =
            "emoticon p-2 rounded cursor-pointer flex items-center justify-center hover:bg-ponghover transition-all duration-200";
          emoticonDiv.title = emo.title;
          emoticonDiv.innerHTML = `<img src="${emo.src}" alt="${emo.title}" class="h-6">`;

          emoticonDiv.addEventListener("click", () => {
            insertEmoticon(emo.title);
            emoticonContainer?.classList.add("hidden");
          });

          emoticonContent.appendChild(emoticonDiv);
        });
      };

      const loadStickers = () => {
        const stickerContent = container.querySelector("#sticker-tab-content");
        if (!stickerContent) return;

        stickerContent.innerHTML = "";

        stickers.forEach((sticker) => {
          const stickerDiv = document.createElement("div");
          stickerDiv.className =
            "sticker p-2 rounded cursor-pointer flex items-center justify-center hover:bg-ponghover transition-all duration-200";
          stickerDiv.title = sticker.title;
          stickerDiv.innerHTML = `<img src="${sticker.src}" alt="${sticker.title}" class="w-12 h-12">`;

          stickerDiv.addEventListener("click", () => {
            insertEmoticon(sticker.title);
            emoticonContainer?.classList.add("hidden");
          });

          stickerContent.appendChild(stickerDiv);
        });
      };

      const insertEmoticon = (code: string) => {
        const messageInput = container.querySelector(
          "#message-input"
        ) as HTMLDivElement;
        if (!messageInput) return;

        messageInput.innerText += code + " ";
        messageInput.focus();
      };

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

      chatService.send("user:check_blocked", {
        userId: store.userId,
        targetId: activeUser.id
      });

      chatService.on("user:blocked_status", async (data) => {
        console.log(data.isBlocked, data);
        if (!data.isBlocked) {
          await axios.post('/notifications/api/notifications/user-message', body).catch(err => {
            console.error("Error sending message:", err);
          });
        }
      });

      const tempMessage: Message = {
        id: Date.now(),
        senderId: parseInt(currentUser),
        receiverId: activeUser.id,
        content,
        timestamp: Date.now(),
      };

      messages = [tempMessage, ...messages];
      renderChat();
      scrollToBottom();

      messageInput.innerText = "";

      const newMessage = {
        from: currentUser,
        to: activeUser.id,
        content,
        timestamp: tempMessage.timestamp,
      };
      console.log(newMessage);

      chatService.send("message:private", newMessage);
    };

    const scrollToBottom = () => {
      const messageContainer = container.querySelector("#message-container");
      if (messageContainer) {
        messageContainer.scrollTop = 0;
      }
    };

    const setActiveUser = (user: {
      nickname: string;
      id: number;
      full_name: string;
      avatar_url: string;
    }) => {
      activeUser = user;
      const currentUserId = parseInt(store.userId || '');
      if (currentUserId) {
        roomId = [currentUserId, user.id]
          .sort((a: number, b: number) => a - b)
          .join("-");

        if (chatService.isConnected()) {
          chatService.getMessageHistory(roomId);

          chatService.markMessagesAsRead(roomId);

          chatService.send("messages:unread:get", {
            userId: store.userId
          });
        }

        chatService.off("user:blocked_status");

        chatService.send("user:check_blocked", {
          userId: store.userId,
          targetId: user.id
        });

        chatService.on("user:blocked_status", (data) => {
          if (user.id && user.id === data.targetId) {
            const messageContainer = container.querySelector("#message-container");

            if (data.isBlocked && messageContainer) {
              const existingBlockedMessage = Array.from(messageContainer.querySelectorAll(".blocked-message"))
                .find(msg => msg.textContent === "You have blocked this user.");

              if (!existingBlockedMessage) {
                const blockedMessage = document.createElement("div");
                blockedMessage.className = "text-center text-red-500 my-2 px-4 blocked-message";
                blockedMessage.textContent = "You have blocked this user.";
                messageContainer.prepend(blockedMessage);
              }

              const inputContainer = container.querySelector("#message-input-container");
              inputContainer?.classList.add("hidden");
            }
          }
        });
      }
      renderChat();
    };

    const initWebSocketEvents = () => {
      chatService.off("message:received");
      chatService.off("message:sent");
      chatService.off("messages:history");
      chatService.off("message:blocked");
      chatService.off("user:blocked");
      chatService.off("error");

      chatService.on("message:received", (data: any) => {
        console.log("Received message:", data);

        if (!data || !data.message) {
          console.error("Invalid message data received");
          return;
        }

        const { message, roomId: msgRoomId } = data;

        if (msgRoomId === roomId) {
          messages = [message, ...messages];
          renderChat();
          scrollToBottom();
          chatService.markMessagesAsRead(roomId);
        }
      });

      chatService.on("message:private", (data: any) => {
        console.log("Private message received:", data);

        if (!data) {
          console.error("Invalid private message data received");
          return;
        }

        const message: Message = data;
        const msgRoomId = data.roomId;

        if (msgRoomId === roomId) {
          messages = [message, ...messages];
          renderChat();
          scrollToBottom();
          chatService.markMessagesAsRead(roomId);
        }

        chatService.send("messages:unread:get", {
          userId: store.userId
        });

      });

      chatService.on("message:sent", (data: any) => {
        console.log("Message sent confirmation:", data);

        if (!data || !data.message) {
          console.error("Invalid message sent data received");
          return;
        }

        const { message, roomId: msgRoomId } = data;

        const messageExists = messages.some(m =>
          m.content === message.content &&
          m.timestamp === message.timestamp
        );

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

        if (msgRoomId === roomId) {
          messages = historyMessages;
          renderChat();
          scrollToBottom();
        }
      });

      chatService.on("message:blocked", (data: any) => {
        console.log("Message blocked:", data);
        const messageContainer = container.querySelector("#message-container");
        if (messageContainer) {
          const blockedMessage = document.createElement("div");
          blockedMessage.className = "text-center text-red-500 my-2 px-4";
          blockedMessage.textContent = data.reason || "Message could not be sent due to block settings";
          messageContainer.prepend(blockedMessage);
        }
      });

      chatService.on("user:blocked", (data: any) => {
        console.log("User blocked:", data);

        const messageContainer = container.querySelector("#message-container");
        if (activeUser && activeUser.id === data.userId && messageContainer) {
          const existingBlockedMessage = Array.from(messageContainer.querySelectorAll(".blocked-message"))
            .find(msg => msg.textContent === "You have blocked this user.");

          if (!existingBlockedMessage) {
            const blockedMessage = document.createElement("div");
            blockedMessage.className = "text-center text-red-500 my-2 px-4 blocked-message";
            blockedMessage.textContent = "You have blocked this user.";
            messageContainer.prepend(blockedMessage);
          }

          const inputContainer = container.querySelector("#message-input-container");
          inputContainer?.classList.add("hidden");
        }
      });

      chatService.on("user:unblocked", (data: any) => {
        if (activeUser && activeUser.id === data.userId) {
          const messageContainer = container.querySelector("#message-container");
          if (messageContainer) {
            const blockedMessages = messageContainer.querySelectorAll(".blocked-message");
            blockedMessages.forEach(msg => {
              if (msg.textContent === "You have blocked this user.") {
                msg.remove();
              }
            });
          }

          const inputContainer = container.querySelector("#message-input-container");
          inputContainer?.classList.remove("hidden");
        }
      });

        chatService.on("create_friend_match", (data) => {
          console.log("Received create_friend_match from chat service:", data);
          
          import("../../main.js").then(({ pongGameClient }) => {
            if (pongGameClient) {
              console.log("Forwarding to matchmaking service...");
              pongGameClient.send('create_friend_match', {
                player1: data.player1,
                player2: data.player2,
                initiator: data.initiator
              });
            } else {
              console.error("Matchmaking client not available");
            }
          });
        });

        chatService.on("game:match_creating", (data) => {
          console.log("Game match is being created:", data);
          
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg z-50';
          notification.textContent = 'Creating game match...';
          document.body.appendChild(notification);
          
          setTimeout(() => {
            if (document.body.contains(notification)) {
              document.body.removeChild(notification);
            }
          }, 3000);
        });

      chatService.on("error", (data) => {
        console.error("WebSocket error:", data.message);
        Toast.show(data.message, "error")
      });
    };

    const init = () => {
      renderChat();
      initWebSocketEvents();

      if (props.activeUser) {
        setActiveUser(props.activeUser);
      }
    };

    init();

    return Object.assign(container, {
      setActiveUser,
      getCurrentActiveChatId: () => activeUser ? activeUser.id : null
    });
  }
);
