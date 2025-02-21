import { createComponent } from "../../utils/StateManager.js";

export const Footer = createComponent(() => {
    const container = document.createElement("footer");
    container.className = "fixed bottom-0 left-0 w-full h-[68px] flex flex-col items-center justify-center text-center text-lg font-normal text-white bg-[var(--main-color)]";
    container.innerHTML = `
        <h1>created by <span class="text-[var(--bg-color)]">afarachi🐰  moabbas🐰  jfatfat🐰</span> | all rights reserved!</h1>
    `;
    return container;
});
