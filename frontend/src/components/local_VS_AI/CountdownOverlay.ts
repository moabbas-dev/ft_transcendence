import { createComponent } from "../../utils/StateManager.js";

interface CountdownOverlayProps {
  initialDuration: number;
  onCountdownComplete: () => void;
}

export const CountdownOverlay = createComponent((props: CountdownOverlayProps) => {
  let countdownIntervalId: number;
  const COUNTDOWN_DURATION = props.initialDuration || 5;
  
  // Create countdown overlay
  const countdownOverlay = document.createElement("div");
  countdownOverlay.className = `
    fixed inset-0 flex items-center justify-center bg-opacity-75 text-9xl font-bold text-cyan-400
    text-shadow-neon pointer-events-none
  `;
  countdownOverlay.textContent = COUNTDOWN_DURATION.toString();
  
  // Add neon text shadow style if it doesn't exist
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
  
  // Start countdown logic
  const startCountdown = () => {
    // Make the overlay visible
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
        // Call the callback when countdown is complete
        props.onCountdownComplete();
      }
    }, 1000);
  };
  
  // Method to stop countdown
  const stopCountdown = () => {
    if (countdownIntervalId) {
      clearInterval(countdownIntervalId);
    }
    countdownOverlay.classList.add("hidden");
  };
  
  // Method to reset countdown
  const resetCountdown = () => {
    stopCountdown();
    startCountdown();
  };
  
  // Expose methods to the parent component
  (countdownOverlay as any).startCountdown = startCountdown;
  (countdownOverlay as any).stopCountdown = stopCountdown;
  (countdownOverlay as any).resetCountdown = resetCountdown;
  
  // Cleanup function for component unmount
  const cleanup = () => {
    if (countdownIntervalId) {
      clearInterval(countdownIntervalId);
    }
  };
  
  (countdownOverlay as any).destroy = cleanup;
  
  return countdownOverlay;
});