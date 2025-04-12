import { createComponent } from "../../utils/StateManager.js";
import store from "../../../store/store.js";
import axios from "axios";
import { t } from "../../languages/LanguageController.js";
import countryList from "country-list";
import Toast from "../../toast/Toast.js";
import { refreshRouter } from "../../router.js";

interface UserInfoProps {
  uName: string;
}

export const UserInfo = createComponent((props: UserInfoProps) => {
  if (props && props.uName) {
    const token = store.accessToken;
    // Make the API call with proper authorization headers
    axios
      .get(`http://localhost:8001/auth/users/nickname/${props.uName}`, {
        headers: {
          Authorization: `Bearer ${token}`,
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
            ${store.nickname !== props.uName ? "" : `<div class="flex flex-col gap-2">
            
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
                        <form class="flex flex-col gap-4" id="code-form">
				                  <div id="auth-code" class="flex gap-4 justify-center">
					                  <input type="text" class="size-8 sm:size-10 border-2 border-ponghover text-center rounded-lg text-pongdark text-2xl" maxlength="1" autocomplete="off" inputmode="numeric"/>
					                  <input type="text" class="size-8 sm:size-10 border-2 border-ponghover text-center rounded-lg text-pongdark text-2xl" maxlength="1" autocomplete="off" inputmode="numeric"/>
					                  <input type="text" class="size-8 sm:size-10 border-2 border-ponghover text-center rounded-lg text-pongdark text-2xl" maxlength="1" autocomplete="off" inputmode="numeric"/>
					                  <input type="text" class="size-8 sm:size-10 border-2 border-ponghover text-center rounded-lg text-pongdark text-2xl" maxlength="1" autocomplete="off" inputmode="numeric"/>
					                  <input type="text" class="size-8 sm:size-10 border-2 border-ponghover text-center rounded-lg text-pongdark text-2xl" maxlength="1" autocomplete="off" inputmode="numeric"/>
					                  <input type="text" class="size-8 sm:size-10 border-2 border-ponghover text-center rounded-lg text-pongdark text-2xl" maxlength="1" autocomplete="off" inputmode="numeric"/>
				                  </div>
                          <button id="validateCodeBtn" class="bg-pongblue text-white px-4 py-1 rounded hover:bg-blue-700 transition-colors">
                               ${t('profile.infoTab.generateNewQrcode')}
                          </button>
			                  </form>
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

    const nicknameInput = container.querySelector('#nickname-value') as HTMLInputElement;
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
  const qrCodeImage = container.querySelector("#qrCodeImage") as HTMLDivElement;

  if (props.uName) {
    const saveBtn = container.querySelector("#save-btn")!;
    const nicknameInput = container.querySelector("#nickname-value") as HTMLInputElement;
    const fullNameInput = container.querySelector("#fullName") as HTMLInputElement;
    const ageInput = container.querySelector('input[placeholder="Age"]') as HTMLInputElement;
    const emailInput = container.querySelector('input[placeholder="Email"]') as HTMLInputElement;
    const countryInput = container.querySelector("#country-select") as HTMLSelectElement;

    if (saveBtn) {
      saveBtn.addEventListener("click", async () => {
        const data: {
          nickname?: string;
          full_name?: string;
          age?: string;
          email?: string;
            country?: string;
        } = {};
        if (store.nickname !== nicknameInput.value)
          data.nickname = nicknameInput.value;
        if (store.fullName !== fullNameInput.value)
          data.full_name = fullNameInput.value;
        if (ageInput.value !== 'undefined' && store.age !== ageInput.value)
          data.age = ageInput.value;
        if (store.email !== emailInput.value)
          data.email = emailInput.value;
        if (store.country !== countryInput.value)
          data.country = countryInput.value;

        if (Object.keys(data).length === 0){
          Toast.show("No changes detected", "warn");
          return;
        }
        
        try {
          await axios.patch(`http://localhost:8001/auth/users/${store.userId}`, data, {
            headers: {
              authorization: `Bearer ${store.accessToken}`,
            }
          })
          store.nickname = nicknameInput.value;
          store.fullName = fullNameInput.value;
          store.age = ageInput.value;
          store.email = emailInput.value;
          store.country = countryInput.value;

          refreshRouter()
          Toast.show("Your data are updated sucessfuly", "success");
        } catch(err: any) {
          console.log(err);
          Toast.show(`Error: ${err.response.data.message}`, "error");
        }
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

  // 2FA toggle interactions
  if (twoFactorToggle && qrCodeContainer) {
    twoFactorToggle.addEventListener("change", async function () {
      if (this.checked) {
        // Show QR code when 2FA is enabled
        qrCodeContainer.classList.remove("hidden");
        try {
          const res = await axios.put(`http://localhost:8001/auth/twoFactor/enable/${store.userId}`, {}, {
            headers: {
              Authorization: `Bearer ${store.accessToken}`,
            },
          });
          qrCodeImage.innerHTML = `<img src="${res.data.qrCodeDataUrl}" alt="QR Code" class="w-full h-full object-contain" />`;
        } catch (error: any) {
          if (error.response) {
            if (error.response.status === 404 || error.response.status === 403 || error.response.status === 401)
              Toast.show(`Error: ${error.response.data.message}`, "error");
            else if (error.response.status === 500)
              Toast.show(`Server error: ${error.response.data.error}`, "error");
            else
              Toast.show(`Unexpected error: ${error.response.data}`, "error");
          } else if (error.request)
            Toast.show(`No response from server: ${error.request}`, "error");
          else
            Toast.show(`Error setting up the request: ${error.message}`, "error");
        }

      } else {
        // Hide QR code when 2FA is disabled
        qrCodeContainer.classList.add("hidden");
        console.log("2FA disabled");
      }
    });
  }

  const inputs: NodeListOf<HTMLInputElement> = container.querySelectorAll("#auth-code input");

	if (inputs.length) {
		requestAnimationFrame(() => {
			inputs[0].focus();
			inputs[0].select();
		});
	}

  const formElement = container.querySelector("#code-form") as HTMLFormElement;
  inputs.forEach((input, index) => {
		input.addEventListener("input", (e: Event) => {
			const target = e.target as HTMLInputElement;
			const value = target.value;

			if (!/^\d$/.test(value)) {
				target.value = "";
				return;
			}

			if (value.length >= 1 && index < inputs.length - 1) {
				inputs[index + 1].focus();
			}

      if (index === 5) {

        formElement.addEventListener("submit", async (e) => {
          e.preventDefault();
          let code = Array.from(inputs).map(input => input.value).join('');
          console.log("Submitted code:", code);
          inputs.forEach(input => { input.value = "" });
          inputs[0].focus();
          try {
            const body = {code: code};
            await axios.post(`http://localhost:8001/auth/twoFactor/enable/validate/${store.userId}`, body, {
              headers: {Authorization: `Bearer ${store.accessToken}`}
            })
            try {
              await axios.put(`http://localhost:8001/auth/twoFactor/enable/${store.userId}`, undefined, {
                headers: {Authorization: `Bearer ${store.accessToken}`}
              })
              console.log("FFFFFFF");
              
              Toast.show(`2FA Enabled Successfully!`, "success");  
            } catch(err:any) {
              Toast.show(`Error: ${err.response.data.message}`, "error");  
            }
          } catch (error:any) {
            Toast.show(`Error: ${error.response.data.message}`, "error");
          }
        });

        const allFilled = Array.from(inputs).every(input => input.value.length === 1);
        if (allFilled && index === 5)
          formElement.requestSubmit();
      }

		});

		// Handle backspace to move to previous field
		input.addEventListener("keydown", (e: KeyboardEvent) => {
			if (e.key === "Backspace" && input.value === "" && index > 0)
				inputs[index - 1].focus();
		});
	});

  return container;
});
