/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   GameInviteMessage.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: afarachi <afarachi@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/22 15:16:33 by afarachi          #+#    #+#             */
/*   Updated: 2025/06/22 15:16:33 by afarachi         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { createComponent } from "../../utils/StateManager.js";
import chatService from "../../utils/chatUtils/chatWebSocketService.js";
import store from "../../../store/store.js";
import { t } from "../../languages/LanguageController.js";

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
  
  const isReceived = Number(props.to) === parseInt(store.userId || '');
  const isPending = props.status === 'pending';
  
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
            ${t('profile.socialTab.accept')}
          </button>
          <button class="decline-btn bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">
            ${t('profile.socialTab.decline')}
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

  function formatTimestamp(timestamp: string | number) {
    try {
      const date = new Date(timestamp);
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

      buttons?.classList.add('hidden');
      
      const statusDiv = document.createElement('div');
      statusDiv.className = 'status text-sm text-green-400';
      statusDiv.textContent = 'Accepted';
      messageElement.querySelector('.flex')?.appendChild(statusDiv);
    });
    
    declineBtn?.addEventListener('click', () => {
      chatService.send("game:invite_response", {
        inviteId: props.inviteId,
        response: 'decline',
        from: props.from,
        to: props.to
      });

      buttons?.classList.add('hidden');
      
      const statusDiv = document.createElement('div');
      statusDiv.className = 'status text-sm text-red-400';
      statusDiv.textContent = 'Declined';
      messageElement.querySelector('.flex')?.appendChild(statusDiv);
    });
  }
  
  return messageElement;
});