import { createComponent } from "../utils/StateManager";

interface ChatProps {

}

export const Chat = createComponent((props: ChatProps) => {
    const container = document.createElement('div')
    container.innerHTML = `
        <div  class="flex flex-col bg-[var(--main-color)] bg-custom-gradient justify-between px-1 sm:px-2 h-screen z-20 gap-2">
            <div class="flex rounded-full h-fit items-center justify-between py-3 px-2 bg-white">
                <div class="flex">
                    <div class="back_arrow sm:hidden text-black text-3xl flex items-center justify-center hover:cursor-pointer hover:opacity-80">
                        <i class='bx bx-left-arrow-alt'></i>
                    </div>
                    <div class="flex items-center justify-center gap-1 sm:gap-2">
                        <div class="friend_icon w-10 h-10 2xl:w-12 2xl:h-12 bg-black rounded-full"></div> <!-- Icon Here -->
                        <div>
                            <p class="friend_name text-base sm:text-xl">Test User<!-- Name of the Friend Here --></p>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-2 justify-center">
                    <button type="button" class="text-base sm:text-lg text-white bg-[var(--bg-color)] rounded-full px-3 py-2 hover:opacity-80" >Block</button>
                    <button type="button" class="text-base sm:text-lg text-white bg-[var(--main-color)] rounded-full px-3 py-2 hover:opacity-80">Invite</button>
                </div>
            </div>
            <section id ="message-container" class="chat_core overflow-y-auto styled-scrollbar h-fit flex-1 flex flex-col-reverse gap-0.5">
            
            </section>
            <div id="message-container" class="flex items-center h-fit bg-[var(--bg-color)] gap-2 w-full rounded-full mb-16 sm:mb-4">
                <form id="send-container" class="flex items-center w-full" autocomplete="off" >
                    <input type="text" placeholder="Type your message..." id="message-input" autocomplete="off" class="focus:outline-none rounded-full bg-[var(--bg-color)] p-3 text-lg text-white flex-1" autocorrect="off" autocapitalize="off" spellcheck="false">
                    <button type="submit" id="send-button" class="flex pr-3 items-center justify-center hover:cursor-pointer hover:opacity-80 rounded-full h-8 w-8 sm:w-12 sm:h-12 text-2xl text-white bg-[var(--bg-color)]">
                        <i class='bx bx-send'></i>
                    </button>
                </form>
            </div>
        </div>
    `;
    return container
})

