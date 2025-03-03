import { navigate } from "../../router.js";
import { createComponent } from "../../utils/StateManager.js";

export const Footer = createComponent(() => {
    const container = document.createElement("footer");
    container.className = "fixed bottom-0 left-0 w-full h-[68px] flex flex-col items-center justify-center text-center text-lg font-normal text-white bg-pongblue";
    container.innerHTML = `
        <p>
            © ${new Date().getFullYear()} Developed by 
            <button id="about-us" class="text-pongdark font-medium hover:opacity-70 transition-all">Afarachi, Moabbas, Jfatfat</button>. 
            All intellectual property rights reserved.
        </p>
    `;
    container.querySelector("#about-us")?.addEventListener("click", () => {
        navigate("/about-us");
    })
    return container;
});
