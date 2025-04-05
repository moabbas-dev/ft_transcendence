import { createComponent } from "../../utils/StateManager.js";
import store from "../../../store/store.js";
import axios from "axios";
import { t } from "../../languages/LanguageController.js";
import countryList from "country-list";

interface UserInfoProps {
  uName: string;
}

export const UserInfo = createComponent((props: UserInfoProps) => {
  if (props && props.uName) {
    const token = store.accessToken;
    // Make the API call with proper authorization headers
    axios
      .get(`/authentication/auth/users/nickname/${props.uName}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-api-key': import.meta.env.VITE_AUTHENTICATION_API_KEY
        },
      })
      .then((response) => {
        // Store or use the user data
        const userData = response.data;
        updateUIWithUserData(userData, container);
        // console.log(userData);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error.response.data.message);
      });
  }

  const container = document.createElement("div");
  container.innerHTML = `
        <div class="flex flex-col gap-4">
          <div class="flex justify-center flex-wrap gap-2 overflow-y-auto pb-1 px-1">
              <div class="flex-1 min-w-[250px]">
                <label class="block font-semibold">${t('profile.infoTab.fullname')}</label>
                <input id="fullName" type="text" class="border border-gray-300 p-1 w-full
                 rounded-md focus:shadow-[0_0_5px] focus:shadow-pongblue focus:outline-none focus:ring-1 focus:ring-pongblue focus:border-pongblue" placeholder="Full name" id="fullName" value="Loading...">
              </div>
              <div class="flex-1 min-w-[250px]">
                <label class="block font-semibold">Nickname</label>
                <input id="nickname-value" type="text" class="border border-gray-300 p-1 w-full
                rounded-md focus:shadow-[0_0_5px] focus:shadow-pongblue focus:outline-none focus:ring-1 focus:ring-pongblue focus:border-pongblue" value="Loading...">
              </div>
              <div class="flex-1 min-w-[250px]">
                <label class="block font-semibold">${t('profile.infoTab.age')}</label>
                <input type="text" class="border border-gray-300 p-1 w-full
                rounded-md focus:shadow-[0_0_5px] focus:shadow-pongblue focus:outline-none focus:ring-1 focus:ring-pongblue focus:border-pongblue" placeholder="Age" value="Loading...">
              </div>
              <div class="flex-1 min-w-[250px]">
                <label class="block font-semibold">${t('profile.infoTab.country')}</label>
                <select id="country-select" name="country" 
                class="w-full p-1 border cursor-pointer border-gray-300 rounded-md focus:shadow-[0_0_5px] focus:shadow-pongblue focus:outline-none focus:ring-1 focus:ring-pongblue focus:border-pongblue appearance-none bg-white">
                  <option value="" disabled selected>Loding...</option>
                </select>
              </div>
              <div class="flex-1 min-w-[250px]">
                <label class="block font-semibold">Email:</label>
                <input type="text" class="border border-gray-300 p-1 w-full
                rounded-md focus:shadow-[0_0_5px] focus:shadow-pongblue focus:outline-none focus:ring-1 focus:ring-pongblue focus:border-pongblue" placeholder="Email" value="Loading...">
              </div>
            </div>
            <div class="flex-1 min-w-[250px] border-b-2">
              <p class="inline-block font-semibold">${t('profile.infoTab.memberSince')}</P>
              <span>${store.createdAt?.split(" ")[0]}</span>
            </div>
            ${store.nickname !== props.uName? "" : `<div class="flex flex-col gap-2">
          <!-- 2FA Toggle -->
          <div class="flex flex-col gap-4">
              <div class="flex items-center gap-2">
                  <span class="font-semibold">${t('profile.infoTab.enable2fa')}</span>
                  <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" id="twoFactorToggle" class="sr-only peer" />
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 
                      peer-focus:ring-blue-300 rounded-full peer 
                        peer-checked:after:translate-x-full 
                      peer-checked:after:border-white 
                        after:content-[''] after:absolute after:top-0.5 after:left-[2px] 
                      after:bg-white after:border-gray-300 after:border 
                        after:rounded-full after:h-5 after:w-5 after:transition-all
                      peer-checked:bg-pongblue">
                      </div>
                    </label>
              </div>
            
            <!-- QR Code Container (initially hidden) -->
            <div id="qrCodeContainer" class="hidden">
                <div class="flex flex-col items-center p-4 border border-gray-300 rounded-md bg-gray-50">
                    <h3 class="font-semibold mb-2">${t('profile.infoTab.qrcodeScan')}</h3>
                    <div id="qrCodeImage" class="w-48 h-48 bg-white p-4 border border-gray-200 rounded-md flex items-center justify-center">
                        <!-- QR code will be inserted here dynamically -->
                        <div class="animate-pulse text-center text-gray-400">
                            <div class="flex justify-center">
                                <i class="fas fa-spinner fa-spin text-4xl mb-2"></i>
                            </div>
                            <p>${t('profile.infoTab.generating')}</p>
                        </div>
                    </div>

                    <div class="mt-4">
                        <button id="regenerateQrBtn" class="bg-pongblue text-white px-4 py-1 rounded hover:bg-blue-700 transition-colors">
                            <i class="fas fa-sync-alt mr-1"></i> ${t('profile.infoTab.generateNewQrcode')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <!-- Save Button on the right side -->
        <div id="saveButtonContainer" class="flex justify-end">
            <button type="submit" id="save-btn" class="bg-pongblue p-1 w-40 text-white hover:opacity-80 transition-all">${t('profile.infoTab.saveBtn')}</button>
        </div>
        </div>            
    </div>`
    }
          
    `;
    const countryInput = container.querySelector("#country-select") as HTMLSelectElement;
    const countries = countryList.getNames();
    
    countries.forEach(country => {
      const option = document.createElement("option");
      option.value = country;
      option.textContent = country;
    
      countryInput.appendChild(option);
    });
    

  function updateUIWithUserData(userData: any, container: HTMLDivElement) {
    // Update nickname
    const fullNameElement = container.querySelector("#fullName") as HTMLInputElement;
    if (fullNameElement) {
      fullNameElement.value = userData.full_name;

      if (store.nickname !== userData.nickname) {
        fullNameElement.readOnly = true;
      }
      // fullNameElement.classList.add('bg-gray-200');
    }
    // Update age
    const ageInput = container.querySelector('input[placeholder="Age"]') as HTMLInputElement;
    if (ageInput) {
      ageInput.value = userData.age?.toString();
      if (store.nickname !== userData.nickname) {
        ageInput.readOnly = true;
      }
      // ageInput.classList.add('bg-gray-200');
    }

    // Update email
    const emailInput = container.querySelector('input[placeholder="Email"]') as HTMLInputElement;
    if (emailInput) {
      emailInput.value = userData.email;
      if (store.nickname !== userData.nickname) {
        emailInput.readOnly = true;
      }
      // emailInput.readOnly = true;
      // emailInput.classList.add('bg-gray-200');
    }

    const nicknameInput =  container.querySelector('#nickname-value') as HTMLInputElement;
    if (nicknameInput) {
      nicknameInput.value = userData.nickname;
      if (store.nickname !== userData.nickname) {
        nicknameInput.readOnly = true;
      }
      // nicknameInput.classList.add('bg-gray-200');
    }

    // Update country
    const selectedCountry = countryInput.querySelector(`option[value="${userData.country}"]`) as HTMLOptionElement;
    selectedCountry.selected = true;
    if (store.nickname !== userData.nickname) {
      countryInput.disabled = true;
      selectedCountry.disabled = true;
    }
  }

  const twoFactorToggle = container.querySelector(
    "#twoFactorToggle"
  ) as HTMLInputElement;
  const qrCodeContainer = container.querySelector("#qrCodeContainer");
  const qrCodeImage = container.querySelector("#qrCodeImage");
  const secretKeyElement = container.querySelector("#secretKey");
  const regenerateQrBtn = container.querySelector("#regenerateQrBtn");

  if (!props.uName) {
    const saveBtn = container.querySelector("#save-btn")!;
    // Save button interactions
    if (saveBtn) {
      saveBtn.addEventListener("click", (e: Event) => {
        e.preventDefault();
        // Here you would add the logic to save user info
        console.log("Saving user info...");
      });

      saveBtn.addEventListener("mouseenter", function () {
        saveBtn.innerHTML = '<i class="fa-regular fa-floppy-disk"></i>';
        saveBtn.classList.toggle("text-lg");
      });

      saveBtn.addEventListener("mouseleave", function () {
        saveBtn.textContent = "Save";
        saveBtn.classList.toggle("text-lg");
      });
    }
  }

  // Function to generate a random secret key
  const generateSecretKey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"; // Base32 character set
    let result = "";
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Format with dashes for readability
    return result.match(/.{1,4}/g)?.join("-") || result;
  };

  // Function to generate a QR code SVG
  const generateQrCode = async (secretKey: string) => {
    if (!qrCodeImage) return;

    // In a real application, you would make an API call to your server
    // to generate the QR code or use a library like qrcode.js
    // For now, we'll simulate this with a timeout and a placeholder SVG

    qrCodeImage.innerHTML = `
                    <div class="animate-pulse text-center text-gray-400">
                        <div class="flex justify-center">
                            <i class="fas fa-spinner fa-spin text-4xl mb-2"></i>
                        </div>
                        <p>Generating...</p>
                    </div>
                `;

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generate a somewhat random-looking QR code SVG
    // In a real app, this would be generated based on the secret key
    const patternValue = secretKey
      .replace(/[^A-Z0-9]/g, "")
      .split("")
      .reduce((acc, char) => {
        return acc + char.charCodeAt(0);
      }, 0);

    // Create a pseudo-random but consistent pattern based on the secret
    const paths = [];
    for (let i = 0; i < 12; i++) {
      const x = 40 + (i % 4) * 30;
      const y = 40 + Math.floor(i / 4) * 30;
      const seed = (patternValue + i) % 30;
      if (seed % 3 !== 0) {
        // 2/3 chance of adding a square
        paths.push(
          `<rect x="${x}" y="${y}" width="20" height="20" fill="black" />`
        );
      }
    }

    // Add the fixed position markers that all QR codes have
    const qrSvg = `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="160" height="160">
                        <rect x="0" y="0" width="200" height="200" fill="white" />
                        
                        <!-- Position detection patterns (the three large squares in corners) -->
                        <path d="M40,40 h40 v40 h-40 z M50,50 h20 v20 h-20 z" fill="black" />
                        <path d="M120,40 h40 v40 h-40 z M130,50 h20 v20 h-20 z" fill="black" />
                        <path d="M40,120 h40 v40 h-40 z M50,130 h20 v20 h-20 z" fill="black" />
                        
                        <!-- Dynamic pattern based on secret key -->
                        ${paths.join("\n")}
                        
                        <!-- Timing patterns -->
                        <path d="M90,40 h20 v5 h-20 z" fill="black" />
                        <path d="M40,90 h5 v20 h-5 z" fill="black" />
                    </svg>
                `;

    qrCodeImage.innerHTML = qrSvg;
  };

  // Function to handle generating a new 2FA setup
  const setupNewTwoFactor = async () => {
    if (!secretKeyElement) return;

    // Generate a new secret key
    const secretKey = generateSecretKey();

    // Update the secret key display
    secretKeyElement.textContent = secretKey;

    // Generate and display the QR code
    await generateQrCode(secretKey);

    return secretKey;
  };

  // 2FA toggle interactions
  if (twoFactorToggle && qrCodeContainer) {
    twoFactorToggle.addEventListener("change", async function () {
      if (this.checked) {
        // Show QR code when 2FA is enabled
        qrCodeContainer.classList.remove("hidden");

        // Generate a new 2FA setup
        const secretKey = await setupNewTwoFactor();

        console.log("2FA enabled, new secret generated:", secretKey);

        // In a real app, you would send this to your server
        // to associate with the user's account
      } else {
        // Hide QR code when 2FA is disabled
        qrCodeContainer.classList.add("hidden");
        console.log("2FA disabled");

        // In a real app, you would make an API call
        // to remove 2FA from the user's account
      }
    });
  }

  // Regenerate QR code button
  if (regenerateQrBtn) {
    regenerateQrBtn.addEventListener("click", async () => {
      const secretKey = await setupNewTwoFactor();
      console.log("QR code regenerated, new secret:", secretKey);

      // In a real app, you would make an API call to update
      // the user's 2FA settings with the new secret
    });
  }

  return container;
});
