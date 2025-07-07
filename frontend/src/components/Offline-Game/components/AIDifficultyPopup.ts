/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   AIDifficultyPopup.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: afarachi <afarachi@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/22 15:26:44 by afarachi          #+#    #+#             */
/*   Updated: 2025/06/22 15:26:44 by afarachi         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { createComponent } from "../../../utils/StateManager.js";
import { AIDifficulty } from "../../../types/types.js";
import { t } from "../../../languages/LanguageController.js";

interface DifficultyPopupProps {
	onSelect: (difficulty: AIDifficulty) => void;
}

export const DifficultyPopup = createComponent((props: DifficultyPopupProps) => {
    const container = document.createElement("div");
    container.className = `
    fixed inset-0 z-[10000]
    flex items-center justify-center
    bg-black/70
    animate-fadeIn
  `;

  container.innerHTML = `
  <div class="bg-black p-8 rounded-lg shadow-lg border-2 border-purple-500 w-[90vw] sm:w-3/5 max-w-lg">
	<h2 class="text-3xl font-bold mb-6 text-center text-purple-400" style="text-shadow: 0 0 10px #a855f7, 0 0 20px #a855f7;">${t('play.localAI.difficultyPopup.title')}</h2>
	<div class="flex flex-col gap-6">
	  <button id="difficulty-easy" class="px-6 py-3 bg-black text-green-400 rounded font-bold text-lg border
		border-green-400 relative overflow-hidden transition-all duration-300 ease-in-out opacity-0 animate-floatIn
		will-change-transform btn-shine animation-delay-100 shadow-[0_0_10px_#4ade80]">${t('play.localAI.difficultyPopup.easy')}</button>
	  <button id="difficulty-medium" class="px-6 py-3 bg-black text-yellow-400 rounded font-bold text-lg border
		border-yellow-400 relative overflow-hidden transition-all duration-300 ease-in-out opacity-0 animate-floatIn
		will-change-transform btn-shine animation-delay-200 shadow-[0_0_10px_#facc15]">${t('play.localAI.difficultyPopup.medium')}</button>
	  <button id="difficulty-hard" class="px-6 py-3 bg-black text-red-400 rounded font-bold text-lg border
		border-red-400 relative overflow-hidden transition-all duration-300 ease-in-out opacity-0 animate-floatIn
		will-change-transform btn-shine animation-delay-300 shadow-[0_0_10px_#f87171]">${t('play.localAI.difficultyPopup.hard')}</button>
	</div>
  </div>
  `;

	const selectDifficulty = (difficulty: AIDifficulty) => {
		const popupContent = container.querySelector("div");
		if (popupContent) {
		popupContent.className = "animate-fadeOut";
		}

		setTimeout(() => {
		props.onSelect(difficulty);
		container.remove();
		}, 50);
	};

	container
		.querySelector("#difficulty-easy")!
		.addEventListener("click", () => selectDifficulty("easy"));
	container
		.querySelector("#difficulty-medium")!
		.addEventListener("click", () => selectDifficulty("medium"));
	container
		.querySelector("#difficulty-hard")!
		.addEventListener("click", () => selectDifficulty("hard"));
	return container;
})