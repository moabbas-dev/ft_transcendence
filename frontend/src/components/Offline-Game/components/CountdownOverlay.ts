import { createComponent } from "../../../utils/StateManager.js";

interface CountdownOverlayProps {
  initialDuration: number;
  onCountdownComplete: () => void;
}

export const CountdownOverlay = createComponent((props: CountdownOverlayProps) => {
  let countdownIntervalId: number;
  const COUNTDOWN_DURATION = props.initialDuration || 5;
  
  const countdownOverlay = document.createElement("div");
  countdownOverlay.className = `
    fixed inset-0 flex items-center justify-center bg-opacity-75 text-9xl font-bold text-white
    text-shadow-neon pointer-events-none
  `;
  countdownOverlay.textContent = COUNTDOWN_DURATION.toString();
  
  if (!document.getElementById('neon-text-shadow-style')) {
    const style = document.createElement('style');
    style.id = 'neon-text-shadow-style';
    style.textContent = `
      .text-shadow-neon {
        text-shadow: 0 0 10px #0ff, 0 0 20px #0ff, 0 0 30px #0ff, 0 0 40px #0ff;
      }
    `;
    document.head.appendChild(style);
  }
  
  const startCountdown = () => {
    countdownOverlay.classList.remove("hidden");
    
    let counter = COUNTDOWN_DURATION;
    countdownOverlay.textContent = counter.toString();
    
    if (countdownIntervalId) {
      clearInterval(countdownIntervalId);
    }
    
    countdownIntervalId = window.setInterval(() => {
      counter--;
      countdownOverlay.textContent = counter.toString();
      if (counter === 0) {
        clearInterval(countdownIntervalId);
        countdownOverlay.classList.add("hidden");
        props.onCountdownComplete();
      }
    }, 1000);
  };
  
  const stopCountdown = () => {
    if (countdownIntervalId) {
      clearInterval(countdownIntervalId);
    }
    countdownOverlay.classList.add("hidden");
  };
  
  const resetCountdown = () => {
    stopCountdown();
    startCountdown();
  };
  
  (countdownOverlay as any).startCountdown = startCountdown;
  (countdownOverlay as any).stopCountdown = stopCountdown;
  (countdownOverlay as any).resetCountdown = resetCountdown;
  
  const cleanup = () => {
    if (countdownIntervalId) {
      clearInterval(countdownIntervalId);
    }
  };
  
  (countdownOverlay as any).destroy = cleanup;
  window.addEventListener("beforeunload", cleanup);
  window.addEventListener("hashchange", cleanup);
  window.addEventListener("popstate", cleanup);

  return countdownOverlay;
});