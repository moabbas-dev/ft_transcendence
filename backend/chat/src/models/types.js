const User = {
    username: "",
    firstname: "",
    lastname: "",
    friends: [],
    pendingFriends: [],
    blockedUsers: []
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
  
  export default { User, Message, ChatRoom };