import { createComponent } from "../utils/StateManager";

interface ChatProps {}

export const Footer = createComponent((props: ChatProps) => {
    const container = document.createElement("footer");
    container.className = "text-center fixed bottom-0 left-0 right-0 p-4 text-2xl font-normal text-whitet bg-[var(--main-color)]";

    container.innerHTML = `
        <h1>created by <span class="text-[var(--bg-color)]">afarachi🐰</span><span class="text-[var(--bg-color)]">moabbas🐰</span><span class="text-[var(--bg-color)]">jfatfat🐰</span> | all rights reserved! </h1>
    `;
    return container;
});
