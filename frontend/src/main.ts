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
    const messageText = document.createTextNode(message);
    const currentDate = new Date();
    const messageDate = currentDate.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const formattedDate = currentDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric'
    });
    let dateHeader = document.querySelector(`.date-header[data-date="${formattedDate}"]`);
  
    if (!dateHeader) {
      // Create a new date header
      const dateWrapper = document.createElement('div');
      dateWrapper.className = 'flex justify-center items-center w-full bg-slate-500 bg-opacity-30 my-2 py-1 rounded-md';
      dateHeader = document.createElement('div');
      dateHeader.classList.add('date-header', 'text-center', 'bg-[var(--bg-hover)]', 'text-white', 'rounded-md', 'px-2', 'py-1');
      dateHeader.setAttribute('data-date', formattedDate);
      dateHeader.textContent = formattedDate;
      dateWrapper.appendChild(dateHeader);
      messageContainer.appendChild(dateWrapper);
    }

    messageElement.appendChild(messageText);
    messageElement.innerHTML += `<span class="text-xs text-gray-400">${messageDate}</span>`;

    messageWrapper.classList.add('flex', 'w-full'); // Message container with flex
    // Common styles for both sender and receiver
    messageElement.classList.add(
      'flex',
      'flex-col',
      'justify-center',
      'px-2',
      'rounded-lg',  // Rounded corners
      'max-w-[250px]',
      'md:max-w-sm',    // Limit width
      'break-words',
      '2xl:max-w-xl',
      'text-white',
      '[direction:ltr]',
      'min-w-0',
      'text-[17px]'
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
