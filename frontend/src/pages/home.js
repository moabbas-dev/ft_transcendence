import { Button } from '../components/Button.js';
import { navigate } from '../router.js';

export default {
  render: (container) => {
    container.innerHTML = `
      <div class="text-center w-full">
        <i class='bx bxl-typescript text-3xl'></i>
      </div>
      <h1 class="text-4xl font-bold text-center mt-8">Home Page</h1>
      <p class="text-center mt-4">Welcome to ft_transcendence!</p>
    `;

    const aboutButton = Button({
      text: 'About Game',
      classes: 'mx-auto hover:opacity-80',
      onClick: () => {
        navigate('/about');
      },
    });

    container.appendChild(aboutButton);
  },
};
