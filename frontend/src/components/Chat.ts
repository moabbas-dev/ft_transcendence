import { createComponent } from "../utils/StateManager";

interface ChatProps {

}

export const Chat = createComponent((props: ChatProps) => {
    const container = document.createElement('div')
    container.innerHTML = `
        <div  class="flex flex-col justify-between px-2 sm:px-4 h-screen">
            <div class="flex gap-1 h-fit items-center py-3 px-2 bg-white">
                <div class="back_arrow sm:hidden text-black text-3xl flex items-center justify-center hover:cursor-pointer hover:opacity-80">
                    <i class='bx bx-left-arrow-alt'></i>
                </div>
                <div class="flex items-center justify-center gap-2">
                    <div class="friend_icon w-10 h-10 2xl:w-12 2xl:h-12 bg-black rounded-full"></div> <!-- Icon Here -->
                    <div>
                        <p class="friend_name text-lg sm:text-xl">Test User<!-- Name of the Friend Here --></p>
                    </div>
                </div>
            </div>
            <section id ="message-container" class="chat_core overflow-y-auto flex-1 flex-row">
            
            </section>
            <div id="message-container" class="flex items-center h-fit bg-[var(--bg-color)] gap-2 w-full rounded-full mb-16 sm:mb-4">
                <form id="send-container" >
                    <input type="text" placeholder="Type your message..." id="message-input" class="focus:outline-none rounded-full bg-[var(--bg-color)] p-3 text-lg text-white flex-1">
                    <button type="submit" id="send-button" class="flex pr-3 items-center justify-center hover:cursor-pointer hover:opacity-80 rounded-full h-8 w-8 sm:w-12 sm:h-12 text-2xl text-white bg-[var(--bg-color)]">
                        <i class='bx bx-send'></i>
                    </button>
                </form>
            </div>
        </div>
    `;
    return container
})

