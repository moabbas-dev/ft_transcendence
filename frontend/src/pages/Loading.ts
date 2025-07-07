import { Page } from "../types/types.js";

const LoadingPage: Page = {
  render: (container: HTMLElement) => {
    container.className = "h-dvh bg-gradient-to-br from-pongdark to-ponghover flex items-center justify-center";
    
    container.innerHTML = `
      <div class="flex flex-col items-center gap-6">
        <!-- Loading Spinner -->
        <div class="relative">
          <div class="w-16 h-16 border-4 border-gray-600 border-t-pongcyan rounded-full animate-spin"></div>
          <div class="absolute inset-2 w-8 h-8 border-2 border-gray-600 border-b-pongpink rounded-full animate-spin animation-delay-150"></div>
        </div>
        
        <!-- Loading Text -->
        <div class="text-center">
          <h2 class="text-2xl font-bold text-white mb-2">Loading...</h2>
          <p class="text-gray-300 text-sm">Please wait while we set up everything</p>
        </div>
        
        <!-- Animated Dots -->
        <div class="flex gap-1">
          <div class="w-2 h-2 bg-pongcyan rounded-full animate-bounce"></div>
          <div class="w-2 h-2 bg-pongcyan rounded-full animate-bounce animation-delay-75"></div>
          <div class="w-2 h-2 bg-pongcyan rounded-full animate-bounce animation-delay-150"></div>
        </div>
      </div>
    `;
  }
};

export default LoadingPage;