import { createComponent } from "../../utils/StateManager.js";
import { ChatNotification } from "./ChatNotification";
import { FriendRequestAcceptedNotification } from "./FriendRequestAcceptedNotification.js";
import { FriendRequestDeclinedNotification } from "./FriendRequestDeclinedNotification.js";
import { FriendRequestNotification } from "./FriendRequestNotification.js";
import { GameChallengeNotification } from "./GameNotification";
import { TournamentAlertNotification } from "./TournamentNotification.js";

export interface NotificationProps {
	senderId: number;
	recipientId: number;
	type: "USER_MESSAGE" | "TOURNAMENT_ALERT" | "FRIEND_REQUEST" | "FRIEND_ACCEPTED" | "FRIEND_DECLINED" | "GAME_CHALLENGE";
	content?: string;
	is_read: boolean;
	created_at: Date;
}

export const Notification = createComponent((props: NotificationProps) => {
	return props.type === "USER_MESSAGE" ? ChatNotification(props):
		   props.type === "FRIEND_REQUEST"? FriendRequestNotification(props):
		   props.type === "FRIEND_ACCEPTED" ? FriendRequestAcceptedNotification(props):
		   props.type === "FRIEND_DECLINED" ? FriendRequestDeclinedNotification(props):
		   props.type === "GAME_CHALLENGE"? GameChallengeNotification(props):
		   TournamentAlertNotification(props);
})