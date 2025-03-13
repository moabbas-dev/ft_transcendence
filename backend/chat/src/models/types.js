// backend/src/types.js

const User = {
    username: "",
    firstname: "",
    lastname: "",
    friends: [],
    pendingFriends: [],
    blockedUsers: [] // Optional
};

const Message = {
    id: "",
    from: "",
    content: "",
    timestamp: 0
};

const ChatRoom = {
    id: "",
    participants: [],
    messages: []
};

// frontend/src/types/chat.js

const FrontendUser = {
    username: "",
    firstname: "",
    lastname: "",
    isOnline: false // Optional
};

const FrontendMessage = {
    id: "",
    from: "",
    content: "",
    timestamp: 0
};

const FrontendChatRoom = {
    id: "",
    participants: [],
    messages: []
};

module.exports = { User, Message, ChatRoom, FrontendUser, FrontendMessage, FrontendChatRoom };
