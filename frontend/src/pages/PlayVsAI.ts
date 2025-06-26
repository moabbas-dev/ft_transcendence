/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PlayVsAI.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: afarachi <afarachi@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/22 16:46:21 by afarachi          #+#    #+#             */
/*   Updated: 2025/06/22 16:46:21 by afarachi         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { OfflineGameAI } from "../components/Offline-Game/AIGame.js";
import { OfflineGame } from "../components/Offline-Game/OfflineGame.js";

export default {
  render: (container: HTMLElement) => {
    container.innerHTML = `
      <div class="content relative flex flex-col items-center sm:justify-around h-dvh max-sm:p-2 sm:border-8 bg-pongcyan border-pongdark border-solid">
        <div class="player-header w-4/5 "></div>
        <div id="game-container" class="flex items-center justify-center max-sm:flex-1 max-w-0"></div>
      </div>
    `;

    const content = container.querySelector(".content")!
    const playerHeader = content.querySelector(".player-header")!
    const gameContainer = container.querySelector("#game-container")!;
    const game:OfflineGame = new OfflineGameAI()

    if (game instanceof OfflineGameAI) {
      container.appendChild(game.difficultyPopupElement);
      container.appendChild(game.countdownOverlayElement)
      playerHeader.appendChild(game.gameHeaderElement);
      container.appendChild(game.resultPopupElement);
      gameContainer.appendChild(game.gameCanvasElement);
    }
  },
};
