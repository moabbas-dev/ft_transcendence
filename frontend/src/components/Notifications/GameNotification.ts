import { createComponent } from "../../utils/StateManager";

interface GameChallengeProps {
    username: string,
    onAccept?: () => void,
    gameType?: string
}

export const GameChallengeNotification = createComponent((props: GameChallengeProps) => {
    const notification = document.createElement('li');
    notification.className = 'w-full flex flex-col gap-2 text-black border-b bg-purple-50';
    
    const gameType = props.gameType || 'Pong';
    
    notification.innerHTML = `
        <div class="flex justify-between items-center">
            <span class="text-lg font-bold text-pongblue cursor-pointer hover:opacity-90 hover:underline">${props.username}</span>
            <span class="">Just now</span>
        </div>
        <div class="flex flex-col gap-1">
            <p class="text-gray-800 font-semibold"><i class="fa-solid fa-bolt text-[#f00]"></i> Epic Challenge Incoming! <i class="fa-solid fa-bolt text-[#f00]"></i></p>
            <p class="text-gray-700">${props.username} has thrown down the gauntlet and challenged you to an intense ${gameType} showdown!</p>
            <div class="flex items-center justify-center w-full">
                <button class="accept-btn w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
					<i class="fa-solid fa-hands-holding-circle"></i>
                    Accept the Challenge!
                </button>
            </div>
            <p class="text-xs text-gray-500 text-center italic">Prove your skills and show who's the true champion!</p>
        </div>
    `;

    // Add event listener for accept button
    const acceptBtn = notification.querySelector('.accept-btn');
    if (acceptBtn && props.onAccept) {
        acceptBtn.addEventListener('click', props.onAccept);
    }

    return notification;
});