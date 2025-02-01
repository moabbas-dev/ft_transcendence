
export function Button({ text, onClick, classes = '' }) {
	const button = document.createElement('button');
	button.innerText = text;
	button.className = `flex items-center justify-center px-4 py-2 bg-sky-500 text-white rounded-md ${classes}`;
	button.addEventListener('click', onClick);
	return button;
}
