// src/components/Button.js
export function Button({ text, onClick, classes = '' }) {
	const button = document.createElement('button');
	button.className = "flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md";
	button.innerText = text;
	button.className = classes;
	button.addEventListener('click', onClick);
	return button;
  }
  