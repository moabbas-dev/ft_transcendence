import { Button } from '../components/Button.js';
import { navigate } from '../router.js';

export default {
  render: (container) => {
    const add = (component) => {
      container.appendChild(component);
    }

    const aboutButton = Button({
      type: 'button',
      text: 'About Game',
      styles: 'mx-auto',
      eventType: 'click',
      onClick: () => {
        navigate('/about');
      },
    });

    container.innerHTML = `
      <div class="text-center w-full">
        <i class='bx bxl-typescript text-3xl'></i>
      </div>
      <h1 class="text-4xl font-bold text-center mt-8">Home Page</h1>
      <p class="text-center mt-4">Welcome to ft_transcendence!</p>
    `;
    add(aboutButton)
  },
};
