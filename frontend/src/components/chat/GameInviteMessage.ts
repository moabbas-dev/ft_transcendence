import { createComponent } from "../../utils/StateManager.js";
import chatService from "../../utils/chatUtils/chatWebSocketService.js";
import store from "../../../store/store.js";
import { pongGameClient } from "../../main.js";

export interface GameInviteMessageProps {
  messageId: string;
  from: number;
  to: number;
  gameType: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  inviteId: string;
}

export const GameInviteMessage = createComponent((props: GameInviteMessageProps) => {
  const messageElement = document.createElement('div');
  messageElement.className = 'game-invite-message bg-gradient-to-r from-pongcyan/20 to-pongpink/20 border border-pongcyan/50 rounded-lg p-4 my-2';
  
  // const isReceived = props.to === (parseInt(store.userId || ''));
  const isReceived = Number(props.to) === parseInt(store.userId || '');
  // console.log(isReceived,props.to,store.userId);
  const isPending = props.status === 'pending';
  
  // console.log('Game invite message:', {
  //   isReceived,
  //   isPending,
  //   to: props.to,
  //   userId: store.userId,
  //   status: props.status
  // });
  
  messageElement.innerHTML = `
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="text-2xl">🎮</div>
        <div>
          <div class="font-semibold text-white">
            ${isReceived ? 'Game Invite Received' : 'Game Invite Sent'}
          </div>
          <div class="text-sm text-gray-300">
            ${props.gameType} Match • ${formatTimestamp(props.timestamp)}
          </div>
        </div>
      </div>
      
      ${isPending && isReceived ? `
        <div class="buttons flex space-x-2">
          <button class="accept-btn bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">
            Accept
          </button>
          <button class="decline-btn bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">
            Decline
          </button>
        </div>
      ` : `
        <div class="status text-sm ${
          props.status === 'accepted' ? 'text-green-400' :
          props.status === 'declined' ? 'text-red-400' :
          props.status === 'expired' ? 'text-gray-400' :
          'text-yellow-400'
        }">
          ${props.status.charAt(0).toUpperCase() + props.status.slice(1)}
        </div>
      `}
    </div>
  `;

  // Helper function to safely format timestamp
  function formatTimestamp(timestamp: string | number) {
    try {
      const date = new Date(timestamp);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return new Date().toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }
      return date.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return new Date().toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  }
  
  // Add event listeners for accept/decline buttons
  if (isPending && isReceived) {
    const acceptBtn = messageElement.querySelector('.accept-btn');
    const declineBtn = messageElement.querySelector('.decline-btn');
    const buttons = messageElement.querySelector('.buttons');
    
    acceptBtn?.addEventListener('click', () => {
      chatService.send("game:invite_response", {
        inviteId: props.inviteId,
        response: 'accept',
        from: props.from,
        to: props.to
      });

      chatService.send("messages:unread:get", {
        userId: props.from,
      });

      const matchmakingClient = pongGameClient!;
      matchmakingClient.acceptFriendMatch(props.from.toString());

      buttons?.classList.add('hidden');
    });
    
    declineBtn?.addEventListener('click', () => {
      chatService.send("game:invite_response", {
        inviteId: props.inviteId,
        response: 'decline',
        from: props.from,
        to: props.to
      });

      chatService.send("messages:unread:get", {
        userId: props.from,
      });

      // chatService.getMessageHistory(`${props.from}-${props.to}`);
      buttons?.classList.add('hidden');

    });
  }
  
  return messageElement;
});