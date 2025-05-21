import { t } from "../../languages/LanguageController.js";
import { navigate } from "../../router.js";
import { createComponent } from "../../utils/StateManager.js";

export const Footer = createComponent(() => {
    const container = document.createElement("footer");
    container.className = "w-full h-[68px] flex items-center justify-center px-4 text-lg font-normal text-white bg-black border-t-2  border-pongcyan shadow-[0_-5px_15px_rgba(0,247,255,0.5)] relative overflow-hidden";
    container.innerHTML = `
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-pongcyan/5 to-transparent opacity-30"></div>
        <div class="relative z-10 flex items-center justify-center text-center">
            <p class="flex items-center justify-center flex-wrap gap-1">
                <span class="text-pongpink drop-shadow-[0_0_5px_#ff00e4]">© ${new Date().getFullYear()} ${t("home.footer.developed")}</span>
                <button id="about-us" class="group flex items-center gap-1 text-pongcyan font-medium drop-shadow-[0_0_5px_#00f7ff] transition-all duration-300 transform hover:scale-105">
                    <span class="relative group-hover:text-white group-hover:drop-shadow-[0_0_10px_#00f7ff]">
                        Afarachi, Moabbas, Jfatfat
                        <span class="absolute bottom-0 left-0 w-full h-0.5 bg-pongcyan shadow-[0_0_5px_#00f7ff] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                    </span>
                </button>
                <span class="max-[380px]:hidden text-pongpink drop-shadow-[0_0_5px_#ff00e4]"> | ${t("home.footer.rights")}</span>
            </p>
        </div>
    `;
    
    container.querySelector("#about-us")?.addEventListener("click", () => {
        navigate("/about-us");
    });

    return container;
});