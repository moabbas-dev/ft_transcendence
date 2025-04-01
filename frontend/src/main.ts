import './router.js';
// import  io  from "socket.io-client";
// const messageForm = document.getElementById('send-container');
// const messageInput = document.getElementById('message-input') as HTMLInputElement | null;;
// const socket = io('https://localhost:8000');

// console.log('App initialized!');


// Attach event listeners after rendering
// document.addEventListener('DOMContentLoaded', () => {
//   const messageContainer = document.getElementById('message-container')!;
//   const messageInput = document.getElementById('message-input')!; // This is now a div
//   const sendButton = document.getElementById('send-button')!;

//   Function to send the message
//   const sendMessage = () => {
//     const message: string = messageInput.textContent?.trim() || '';
//     if (message.length > 0) {
//       appendMessage(message, true);
//       console.log('Message:', message);
//     //   socket.emit('send-chat-message', message);

//       // Clear the contenteditable div and restore the placeholder
//       messageInput.innerHTML = '';
//       messageInput.focus();
//     }
//   };

//   // Click event for the send button
//   sendButton?.addEventListener('click', sendMessage);

//   // Keydown event for Enter key inside the contenteditable div
//   messageInput?.addEventListener('keydown', (e) => {
//     // If Enter is pressed without Shift, send the message
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault(); // Prevent newline insertion
//       sendMessage();
//     }
//   });

//   Ensure that if the user clears the input (which may leave behind <br> or whitespace),
//   we truly empty the element so the placeholder shows up.
//   messageInput?.addEventListener('input', () => {
//     if (messageInput.textContent?.trim() === '') {
//       messageInput.innerHTML = '';
//     }
//   });

//   sendButton?.addEventListener('click', () => {
//     // Use textContent to get the text from a contenteditable div
//     const message = messageInput?.textContent?.trim();
//     if (message && message.length > 0) {
//       appendMessage(message, true);
//       console.log('Message:', message);
//       socket.emit('send-chat-message', message);

//       // Clear the contenteditable div
//       messageInput.textContent = '';
//       messageInput.focus();
//     }
//   });

//   socket.on('connect', () => {
//     console.log('Connected to server:', socket.id);
//   });

//   socket.on('chat-message', (data:any) => {
//     console.log('Received message:', data);
//     appendMessage(data, false);
//   });

// function appendMessage(message: string, isSender: boolean = false) {
//   const messageWrapper = document.createElement('div');
//   const messageElement = document.createElement('div');
//   const messageText = document.createTextNode(message);
//   const currentDate = new Date();
//   const messageDate = currentDate.toLocaleTimeString([], {
//     hour: 'numeric',
//     minute: '2-digit',
//     hour12: true
//   });

//   const formattedDate = currentDate.toLocaleDateString('en-US', {
//     month: 'long', day: 'numeric'
//   });
//   let dateHeader = document.querySelector(`.date-header[data-date="${formattedDate}"]`);

//   if (!dateHeader) {
//     // Create a new date header
//     const dateWrapper = document.createElement('div');
//     dateWrapper.className = 'flex justify-center items-center w-full bg-slate-500 bg-opacity-30 my-2 py-1 rounded-md';
//     dateHeader = document.createElement('div');
//     dateHeader.classList.add('date-header', 'text-center', 'bg-ponghover', 'text-white', 'rounded-md', 'px-2', 'py-1');
//     dateHeader.setAttribute('data-date', formattedDate);
//     dateHeader.textContent = formattedDate;
//     dateWrapper.appendChild(dateHeader);
//     messageContainer.appendChild(dateWrapper);
//   }

//   messageElement.appendChild(messageText);
//   messageElement.innerHTML += `<span class="text-xs text-gray-400">${messageDate}</span>`;

//   messageWrapper.classList.add('flex', 'w-full');
//   // Common styles for both sender and receiver
//   messageElement.classList.add(
//     'flex',
//     'flex-col',
//     'justify-center',
//     'pt-1',
//     'px-2',
//     'rounded-lg',
//     'max-w-[250px]',
//     'md:max-w-sm',
//     'break-words',
//     '2xl:max-w-xl',
//     'text-white',
//     '[direction:ltr]',
//     'min-w-0',
//     'text-[17px]',
//     'text-left',
//   );

//   // Apply conditional styles for sender and receiver
//   isSender? messageWrapper.classList.add('justify-end')
//         :   messageWrapper.classList.add('justify-start');

//   isSender? messageElement.classList.add('bg-blue-900', 'mr-1')
//         : messageElement.classList.add('bg-pongdark', 'ml-1');

//   messageWrapper.appendChild(messageElement);

//   messageContainer.firstChild? messageContainer.insertBefore(messageWrapper, messageContainer.firstChild)
//         : messageContainer.appendChild(messageWrapper);
// }
// });