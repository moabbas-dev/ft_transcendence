import { createComponent } from "../../utils/StateManager.js";
import { ChatNotification } from "./ChatNotification";
import { FriendRequestAcceptedNotification } from "./FriendRequestAcceptedNotification.js";
import { FriendRequestNotification } from "./FriendRequestNotification.js";
import { GameChallengeNotification } from "./GameNotification";
import { TournamentAlertNotification } from "./TournamentNotification.js";

export interface NotificationProps {
	id: number;
	senderId: number;
	recipientId: number;
	type: "USER_MESSAGE" | "TOURNAMENT_ALERT" | "FRIEND_REQUEST" | "FRIEND_ACCEPTED" | "GAME_CHALLENGE";
	content?: string;
	created_at: Date;
}

export const Notification = createComponent((props: NotificationProps) => {
	return props.type === "USER_MESSAGE" ? ChatNotification(props):
		   props.type === "FRIEND_REQUEST"? FriendRequestNotification(props):
		   props.type === "FRIEND_ACCEPTED"? FriendRequestAcceptedNotification(props):
		   props.type === "GAME_CHALLENGE"? GameChallengeNotification(props):
		   TournamentAlertNotification(props);
})