import { createComponent } from "../../utils/StateManager.js";
import { NotificationProps } from "./Notification.js";
import { Profile } from "../profile/UserProfile.js";
import axios from "axios";
import { formatTimestamp } from "../../utils/formatTime.js";
import { formatDistanceToNow } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export const FriendRequestNotification = createComponent((props: NotificationProps) => {
    console.log(props.senderId);
    console.log(props.recipientId);

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
    notification.className = 'flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-l-2 border-pongcyan hover:border-pongpink transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,247,255,0.2)] group cursor-pointer min-w-0 w-full max-w-full';

    notification.innerHTML = `
        <div class="flex-shrink-0">
            <div class="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-pongcyan to-pongpink rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(0,247,255,0.3)] group-hover:shadow-[0_0_15px_rgba(255,0,228,0.3)] transition-all duration-300">
                <i class="fas fa-user-plus text-white text-xs sm:text-sm group-hover:scale-110 transition-transform duration-300"></i>
            </div>
        </div>
        
        <div class="flex-grow min-w-0 overflow-hidden">
            <div class="flex items-center justify-between mb-1 flex-wrap sm:flex-nowrap gap-1">
                <h4 class="text-pongcyan font-semibold text-xs tracking-wide uppercase flex-shrink-0">Friend Request</h4>
                <div class="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                    ${!props.is_read ? `
                        <div class="w-1.5 h-1.5 bg-pongpink rounded-full animate-pulse shadow-[0_0_6px_rgba(255,0,228,0.5)] flex-shrink-0"></div>
                    ` : ''}
                </div>
            </div>
            
            <p class="text-xs sm:text-sm text-white leading-snug break-words overflow-hidden">
                <a id="sender-name" class="text-pongcyan font-medium hover:text-pongpink transition-colors duration-200 hover:cursor-pointer break-all hover:underline focus:outline-none focus:ring-2 focus:ring-pongcyan focus:ring-opacity-50 rounded-sm">
                    Loading...
                </a>
                <span class="text-gray-300 ml-1">sent you a friend request</span>
            </p>
        </div>
    `;

    fetchSenderNickname(props.senderId).then(data => {
        if (data) {
            const senderName = notification.querySelector('#sender-name')! as HTMLAnchorElement;
            senderName.textContent = data.nickname;

            senderName.addEventListener('click', (e) => {
                e.preventDefault();
                console.log(`Clicked on user: ${data.nickname} (ID: ${props.senderId})`);
                const profileComponent = Profile({ uName: data.nickname });
                document.body.appendChild(profileComponent);
            });

            senderName.classList.add('animate-pulse');
            setTimeout(() => {
                senderName.classList.remove('animate-pulse');
                senderName.classList.add('drop-shadow-[0_0_8px_rgba(0,247,255,0.3)]');
            }, 1000);
        }
    });

    notification.addEventListener('mouseenter', () => {
        notification.style.transform = 'translateX(2px)';
    });

    notification.addEventListener('mouseleave', () => {
        notification.style.transform = 'translateX(0)';
    });

    return notification;
});
