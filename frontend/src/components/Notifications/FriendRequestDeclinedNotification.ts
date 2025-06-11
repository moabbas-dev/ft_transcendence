// import { formatDistanceToNow } from "date-fns";
// import { createComponent } from "../../utils/StateManager.js";
// import { NotificationProps } from "./Notification.js";
// import axios from "axios";

// export const FriendRequestDeclinedNotification = createComponent((props: NotificationProps) => {
//     const fetchSenderNickname = async (senderId:number) => {
// 		try {
// 			const response = await axios.get(`/authentication/auth/users/id/${senderId}`)
// 			return response.data
// 		} catch(err) {
// 			console.error(err);
// 			return null
// 		}
// 	}	
    
//     const notification = document.createElement('li');
//     notification.className = 'w-full flex flex-col gap-2 text-black border-b bg-green-50';
//     notification.innerHTML = `
//         <div class="flex justify-between items-center">
//             <span class="text-lg font-bold">System</span>
//             <div class="flex items-center gap-2">
//                 ${!props.is_read? '<div class="size-1.5 bg-red-600 rounded-full"></div>' : ''}
//                 <span class="text-sm text-gray-600">${formatDistanceToNow(props.created_at, { addSuffix: false })}</span>
//             </div>
//         </div>
//         <div>
//             <p class="text-gray-700">
//                 <span id="sender-name" class="text-pongcyan font-semibold cursor-pointer hover:underline hover:opacity-90">Loading...</span>
//                 declined your friend invitation
//             </p>
//         </div>
//     `;
//     fetchSenderNickname(props.senderId).then(data => {
// 		if (data) {
// 			const senderName = notification.querySelector('#sender-name')!
// 			senderName.textContent = data.nickname
// 		}
// 	});

//     return notification;
// });

import { formatDistanceToNow } from "date-fns";
import { createComponent } from "../../utils/StateManager.js";
import { NotificationProps } from "./Notification.js";
import { Profile } from "../profile/UserProfile.js";
import axios from "axios";

export const FriendRequestDeclinedNotification = createComponent((props: NotificationProps) => {
    const fetchSenderNickname = async (senderId: number) => {
        try {
            const response = await axios.get(`/authentication/auth/users/id/${senderId}`)
            return response.data
        } catch (err) {
            console.error(err);
            return null
        }
    }

    const notification = document.createElement('li');
    notification.className = 'flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-l-2 border-red-500 hover:border-pongpink transition-all duration-300 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] group cursor-pointer min-w-0 w-full max-w-full';

    notification.innerHTML = `
        <div class="flex-shrink-0">
            <div id="friend-icon" class="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.3)] group-hover:shadow-[0_0_15px_rgba(255,0,228,0.3)] transition-all duration-300 cursor-pointer hover:scale-110">
                <i class="fas fa-times text-white text-xs sm:text-sm group-hover:scale-110 transition-transform duration-300"></i>
            </div>
        </div>
        
        <div class="flex-grow min-w-0 overflow-hidden">
            <div class="flex items-center justify-between mb-1 flex-wrap sm:flex-nowrap gap-1">
                <h4 class="text-red-500 font-semibold text-xs tracking-wide uppercase flex-shrink-0">Friend Declined</h4>
                <div class="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                    ${!props.is_read ? `
                        <div class="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.5)] flex-shrink-0"></div>
                    ` : ''}
                    <span class="text-gray-400 text-xs whitespace-nowrap">${formatDistanceToNow(props.created_at, { addSuffix: true })}</span>
                </div>
            </div>
            
            <p class="text-xs sm:text-sm text-white leading-snug break-words overflow-hidden">
                <a id="sender-name" class="text-red-400 font-medium hover:text-red-300 transition-colors duration-200 hover:cursor-pointer break-all hover:underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 rounded-sm">
                    Loading...
                </a>
                <span class="text-gray-300 ml-1">declined your friend request</span>
            </p>
        </div>
    `;

    // Fetch and display sender nickname with enhanced styling
    fetchSenderNickname(props.senderId).then(data => {
        if (data) {
            const senderName = notification.querySelector('#sender-name')! as HTMLAnchorElement;
            const friendIcon = notification.querySelector('#friend-icon')! as HTMLDivElement;
            
            senderName.textContent = data.nickname;

            // Function to show profile (reusable for both username and icon)
            const showProfile = (e: Event) => {
                e.preventDefault();
                console.log(`Clicked on user: ${data.nickname} (ID: ${props.senderId})`);
                // Create and show the Profile component
                const profileComponent = Profile({ uName: data.nickname });
                document.body.appendChild(profileComponent);
            };

            // Add click event listener to the username anchor
            senderName.addEventListener('click', showProfile);

            // Add click event listener to the friend icon
            friendIcon.addEventListener('click', showProfile);

            // Add a subtle glow effect when name loads
            senderName.classList.add('animate-pulse');
            setTimeout(() => {
                senderName.classList.remove('animate-pulse');
                senderName.classList.add('drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]');
            }, 1000);
        }
    });

    // Add subtle hover effect
    notification.addEventListener('mouseenter', () => {
        notification.style.transform = 'translateX(2px)';
    });

    notification.addEventListener('mouseleave', () => {
        notification.style.transform = 'translateX(0)';
    });

    return notification;
});