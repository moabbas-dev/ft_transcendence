import { createComponent } from "../../utils/StateManager.js";

export const Chat = createComponent(() => {
    const container = document.createElement('div')
    container.innerHTML = `
        <div  class="flex flex-col bg-pongblue bg-custom-gradient justify-between px-1 sm:px-2 h-screen z-20 gap-2">
            <header class="flex rounded-full mt-2 h-fit items-center justify-between py-3 px-2 bg-white">
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
                    <button type="button" class="text-base sm:text-lg text-white bg-pongdark rounded-full px-3 py-1 hover:opacity-80" >Block</button>
                    <button type="button" class="text-base sm:text-lg text-white bg-pongblue rounded-full px-3 py-1 hover:opacity-80">Invite</button>
                </div>
            </header>
            <section id ="message-container" class="chat_core overflow-y-auto [scrollbar-width:thin] [scrollbar-color:white_pongdark]
            [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2
            [&::-webkit-scrollbar-track]:bg-ponghover [&::-webkit-scrollbar-track]:rounded
            [&::-webkit-scrollbar-thumb]:bg-pongdark [&::-webkit-scrollbar-thumb]:rounded
            [&::-webkit-scrollbar-thumb:hover]:bg-[#2d3748] h-fit flex-1 flex flex-col-reverse gap-0.5">
            
            </section>
            <div id="message-container" class="flex items-center h-fit bg-pongdark gap-2 w-full rounded-full px-3 mb-16 sm:mb-4">
                <div class="flex items-center w-full px-2 py-2">
                    <div 
                        id="message-input" 
                        contenteditable="true"
                        role="textbox"
                        class="[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-[#a0aec0] [&:empty]:before:pointer-events-none focus:outline-none bg-pongdark  text-lg text-white flex-1 max-h-[4.75rem] overflow-y-auto whitespace-pre-wrap [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-pongdark [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:my-2"
                        autocorrect="off"
                        autocapitalize="off"
                        spellcheck="false"
                        data-placeholder="Type your message..."
                    ></div>
                    <div 
                        id="send-button" 
                        class="flex items-center justify-center hover:cursor-pointer hover:opacity-80 max-sm:bg-slate-400 hover:bg-slate-400 rounded-full w-10 h-10 text-2xl text-white bg-pongdark transition-all duration-300 -mr-2"
                    >
                        <i class='bx bx-send'></i>
                    </div>
                </div>
            </div>
        </div>
    `;
    return container
})