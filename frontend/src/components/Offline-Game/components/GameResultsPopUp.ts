/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   GameResultsPopUp.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: afarachi <afarachi@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/22 15:28:49 by afarachi          #+#    #+#             */
/*   Updated: 2025/06/22 15:28:49 by afarachi         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { t } from "../../../languages/LanguageController.js";
import { createComponent } from "../../../utils/StateManager.js";

export const GameResultsPopUp = createComponent(() => {
  const popup = document.createElement("div");
  popup.className = "fixed hidden inset-0 flex items-center justify-center bg-black bg-opacity-75";
  popup.id = "result-popup"

  const popupContent = document.createElement("div");
  popupContent.className = "bg-black border-2 border-pongcyan p-6 rounded-lg shadow-lg text-center";
  popup.appendChild(popupContent);
  
  const winnerText = document.createElement("p");
  winnerText.className = "text-xl font-bold mb-4 text-white text-shadow-neon";
  winnerText.id = "winner-text"
  
  popupContent.appendChild(winnerText);
  
  const scoreText = document.createElement("p");
  scoreText.className = "mb-4 text-lg text-white text-shadow-neon";
  scoreText.id = "score-text"
  popupContent.appendChild(scoreText);
  
  const restartButton = document.createElement("button");
  restartButton.className = 
    "px-4 py-2 bg-pongcyan text-white border border-white rounded-lg transition-all hover:opacity-80 hover:shadow-neon";
  restartButton.textContent = t('play.resultsPopup.playAgain');
  restartButton.style.boxShadow = "0 0 10px #0ff, 0 0 20px #0ff";
  restartButton.id = "restart-btn"

  popupContent.appendChild(restartButton);
    
  return popup;
});