import { createComponent } from "../utils/StateManager";

interface ChatProps {}

export const Footer = createComponent((props: ChatProps) => {
    const container = document.createElement("footer");
    container.className = "text-center w-full flex flex-col items-center justify-center text-lg font-normal text-white bg-[var(--main-color)]";

    container.innerHTML = `
        <h1>created by <span class="text-[var(--bg-color)]">afarachi🐰  moabbas🐰  jfatfat🐰</span> | all rights reserved! </h1>
        <p class="text-center">Rou7 3al user profile 🙂</p>
    `;
    return container;
});
