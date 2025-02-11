import './router.js';
import io from "socket.io-client";
// console.log('App initialized!');

const socket = io('http://localhost:8000');

//Attach event listeners after rendering

window.addEventListener('load', () => {
	const messageContainer = document.getElementById('message-container');
	const messageForm = document.getElementById('send-container');
	const messageInput = document.getElementById('message-input') as HTMLInputElement | null;

	messageForm?.addEventListener('submit', (e) => {
		e.preventDefault();
		if (messageInput)
		{
			const message = messageInput.value;
			appendMessage(message, true);
			console.log('Message:', message);
			socket.emit('send-chat-message', message);
			messageInput.value = '';
		}
	});

	socket.on('connect', () => {
		console.log('Connected to server:', socket.id);
	});

	socket.on('chat-message', (data: any) => {
		console.log('Received message:', data);
		appendMessage(data, false);
	});


	function appendMessage(message: string, isSender: boolean = false)
	{
		const messageWrapper = document.createElement('div');
		const messageElement = document.createElement('div');
		messageElement.innerText = message;

		messageWrapper.classList.add(
			'p-3',
			'rounded-lg',
			'max-w-xs',
			'break-words',
			'text-white'
		);

		if (isSender)
		{
			messageWrapper.classList.add('justify-end');
			messageElement.classList.add('bg-blue-500', 'text-right');
		} else {
			messageWrapper.classList.add('justify-start');
			messageElement.classList.add('bg-gray-500', 'text-left');
		}

		messageWrapper.appendChild(messageElement);
		messageContainer?.appendChild(messageWrapper);
	}
});