import { t } from "../../languages/LanguageController.js";
import { navigate } from "../../router.js";
import { createComponent } from "../../utils/StateManager.js";

export const Footer = createComponent(() => {
    const container = document.createElement("footer");
    container.className = "w-full h-[68px] flex items-center justify-center px-4 text-lg font-normal text-white bg-gradient-to-r from-pongblue via-[#0a1150] to-pongblue relative overflow-hidden";
    container.innerHTML = `
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-pongblue/10 to-transparent opacity-20"></div>
        <div class="relative z-10 flex items-center justify-center text-center">
            <p class="flex items-center justify-center flex-wrap gap-1">
                <span>© ${new Date().getFullYear()} ${t("home.footer.developed")}</span>
                <button id="about-us" class="group flex items-center gap-1 text-white font-medium hover:text-white/70 transition-all duration-300 transform hover:scale-105">
                    <span class="relative group-hover:text-pongblue">
                        Afarachi, Moabbas, Jfatfat
                        <span class="absolute bottom-0 left-0 w-full h-0.5 bg-pongblue origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                    </span>
                </button>
                <span class="max-[380px]:hidden"> | ${t("home.footer.rights")}</span>
            </p>
        </div>
    `;
    
    container.querySelector("#about-us")?.addEventListener("click", () => {
        navigate("/about-us");
    });

    return container;
});