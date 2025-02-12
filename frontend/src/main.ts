import './router.js';
import  io  from "socket.io-client";

// const messageForm = document.getElementById('send-container');
// const messageInput = document.getElementById('message-input') as HTMLInputElement | null;;
const socket = io('http://localhost:8000');

// console.log('App initialized!');


// Attach event listeners after rendering
window.addEventListener('load', () => {
  const messageContainer = document.getElementById('message-container')!;
  const messageForm = document.getElementById('send-container');
  const messageInput = document.getElementById('message-input') as HTMLInputElement | null;

  messageForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (messageInput && messageInput.value.trim().length > 0) {
      const message = messageInput.value;
      appendMessage(message, true);
      console.log('Message:', message);
      socket.emit('send-chat-message', message);
      messageInput.value = '';
      messageInput.focus()
    }
  });

  socket.on('connect', () => {
    console.log('Connected to server:', socket.id);
  });

  socket.on('chat-message', (data: any) => {
    console.log('Received message:', data);
    appendMessage(data, false);
  });

  function appendMessage(message: string, isSender: boolean = false) {
    const messageWrapper = document.createElement('div');
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
  
    messageWrapper.classList.add('flex', 'w-full', 'mb-2'); // Message container with flex
  
    // Common styles for both sender and receiver
    messageElement.classList.add(
      'p-3',         // Padding
      'rounded-lg',  // Rounded corners
      'max-w-[250px]',
      'md:max-w-sm',    // Limit width
      '2xl:max-w-xl',
      'break-words', // Handle long messages
      'text-white',
    );

    // Apply conditional styles for sender and receiver
    if (isSender) {
      messageWrapper.classList.add('justify-end'); // Align sender messages to the right
      messageElement.classList.add('bg-blue-900', 'text-right');
    } else {
      messageWrapper.classList.add('justify-start'); // Align receiver messages to the left
      messageElement.classList.add('bg-[var(--bg-color)]', 'text-left');
    }
  
    messageWrapper.appendChild(messageElement);
    if (messageContainer.firstChild) {
      messageContainer.insertBefore(messageWrapper, messageContainer.firstChild);
    } else {
      messageContainer.appendChild(messageWrapper);
    }
  }
});