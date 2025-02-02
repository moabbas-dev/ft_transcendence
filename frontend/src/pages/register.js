import {SignIn} from '../components/SignIn.js';

export default {
	render: (container) => {
		container.innerHTML = `
			<div class="flex items-center justify-around">
				<div class="form flex items-center justify-center h-screen">
					<!-- Sign In Form -->
				</div>
			</div>
		`;
		const form = container.querySelector('.form');
		form.appendChild(SignIn({styles: 'mx-auto'}));
	}
}