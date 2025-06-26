/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   HeaderAnimations_utils.ts                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: afarachi <afarachi@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/22 15:29:10 by afarachi          #+#    #+#             */
/*   Updated: 2025/06/22 15:29:10 by afarachi         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export const createDivider = () => {
  const dividerContainer = document.createElement("div");
  dividerContainer.className =
    "absolute top-1/2 left-1/2 h-full z-20 flex items-center justify-center";
  dividerContainer.style.transform = "translate(-50%, -50%)";

  const divider = document.createElement("div");
  divider.className =
    "w-1 bg-yellow-300 rounded-full opacity-80 hidden sm:block animate-dividerPulse";
  divider.style.boxShadow = "0 0 10px rgba(255, 255, 0, 0.8)";

  dividerContainer.appendChild(divider);

  return dividerContainer;
};

export const createParticles = () => {
  const particleContainer = document.createElement("div");
  particleContainer.className =
    "absolute inset-0 overflow-hidden pointer-events-none z-10 hidden md:block";

  const particleCount = 100;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    const size = Math.random() * 6 + 2;

    particle.className = "absolute rounded-full animate-particle";

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.opacity = `${Math.random() * 0.5 + 0.3}`;

    if (Math.random() > 0.5) {
      particle.style.left = `${Math.random() * 40}%`;
      particle.style.background = `rgba(59, 130, 246, ${
        Math.random() * 0.7 + 0.3
      })`;
    } else {
      particle.style.left = `${Math.random() * 40 + 60}%`;
      particle.style.background = `rgba(239, 68, 68, ${
        Math.random() * 0.7 + 0.3
      })`;
    }

    particle.style.top = `${Math.random() * 100}%`;

    const tx = (Math.random() - 0.5) * 100;
    const ty = (Math.random() - 0.5) * 100;
    particle.style.setProperty("--tx", `${tx}px`);
    particle.style.setProperty("--ty", `${ty}px`);

    particleContainer.appendChild(particle);
  }

  return particleContainer;
};

let leftBg: HTMLDivElement | null = null;
let rightBg: HTMLDivElement | null = null;

export function initBackgrounds(container: HTMLDivElement) {
  leftBg = document.createElement("div");
  leftBg.className = "absolute inset-y-0 left-0 transition-all duration-500";
  leftBg.style.background = "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)";
  leftBg.style.width = "50%";

  rightBg = document.createElement("div");
  rightBg.className = "absolute inset-y-0 right-0 transition-all duration-500";
  rightBg.style.background =
    "linear-gradient(135deg, #991b1b 0%, #ef4444 100%)";
  rightBg.style.width = "50%";

  container.appendChild(leftBg);
  container.appendChild(rightBg);
}

export function updateBackgrounds(playerScore: number, aiScore: number) {
  if (leftBg === null || rightBg === null) {
    console.warn(
      "Backgrounds are not initialized. Call initBackgrounds() first."
    );
    return;
  }

  const total = playerScore + aiScore;
  let leftWidth = 50;
  let rightWidth = 50;

  if (total > 0) {
    leftWidth = (playerScore / total) * 100;
    rightWidth = 100 - leftWidth;
  }

  leftBg.style.transition = "width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)";
  rightBg.style.transition = "width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)";
  leftBg.style.width = `${leftWidth}%`;
  rightBg.style.width = `${rightWidth}%`;

  const playerScoreElem = document.querySelector("#player-score1");
  const aiScoreElem = document.querySelector("#player-score2");
  
  if (playerScoreElem) {
    playerScoreElem.textContent = String(playerScore);
  }
  if (aiScoreElem) {
    aiScoreElem.textContent = String(aiScore);
  }
}
