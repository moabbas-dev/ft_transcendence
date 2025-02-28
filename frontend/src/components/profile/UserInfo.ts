import { createComponent } from "../../utils/StateManager.js";

export const UserInfo = createComponent(() => {
    const container = document.createElement("div");
    container.innerHTML = `
        <div class="flex flex-col gap-4">
        <div class="flex justify-center flex-wrap gap-2 overflow-y-auto">
            <div class="flex-1 min-w-[200px]">
                <label class="block font-semibold">First name:</label>
                <input type="text" class="border border-gray-300 p-1 w-full" placeholder="First name">
            </div>
            <div class="flex-1 min-w-[200px]">
                <label class="block font-semibold">Last name:</label>
                <input type="text" class="border border-gray-300 p-1 w-full" placeholder="Last name">
            </div>    
            <div class="flex-1 min-w-[200px]">
                <label class="block font-semibold">Age:</label>
                <input type="text" class="border border-gray-300 p-1 w-full" placeholder="Age">
            </div>
            <div class="flex-1 min-w-[200px]">
                <label class="block font-semibold">Country:</label>
                <input type="text" class="border border-gray-300 p-1 w-full" placeholder="Country">
            </div>
            <div class="flex-1 min-w-[200px]">
                <label class="block font-semibold">Email:</label>
                <input type="text" class="border border-gray-300 p-1 w-full" placeholder="Email">
            </div>
            <div class="flex-1 min-w-[200px]">
                <label class="block font-semibold">Gender:</label>
                <input type="text" class="border border-gray-300 p-1 w-full" placeholder="Male/Female">
            </div>
        </div>
        
        <!-- 2FA Toggle -->
        <div class="flex justify-start gap-2">
            <span class="font-semibold">Enable 2FA</span>
            <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="twoFactorToggle" class="sr-only peer" />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 
                peer-focus:ring-blue-300 rounded-full peer 
                peer-checked:after:translate-x-full 
                peer-checked:after:border-white 
                after:content-[''] after:absolute after:top-0.5 after:left-[2px] 
                after:bg-white after:border-gray-300 after:border 
                after:rounded-full after:h-5 after:w-5 after:transition-all
                peer-checked:bg-pongblue"></div>
            </label>
        </div>
        <!-- Save Button on the right side -->
        <div class="flex justify-end">
            <button type="submit" class="bg-pongblue p-1 w-40 text-white">Save</button>
        </div>
    </div>
    `;
    return container;
});
