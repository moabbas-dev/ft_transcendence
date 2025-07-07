import en from './en.js'
import fr from './fr.js'
import ar from './ar.js'
import axios from 'axios';
import store from '../../store/store.js';

const translations: any = { en, fr, ar };

export type Lang = 'en' | 'fr' | 'ar';

let currentLanguage: Lang = 'en';

export const setLanguage = async (lang: Lang, saveToDatabase: boolean = false) => {
	if (translations[lang]) {
		document.body.dir = lang === 'ar'? 'rtl' : 'ltr';
		currentLanguage = lang;
		if (saveToDatabase && store.isLoggedIn && store.userId) {
			try {
				await axios.patch(`/authentication/auth/users/${store.userId}`, 
					{ language: lang },
					{
						headers: {
							authorization: `Bearer ${store.accessToken}`,
						}
					}
				);
				store.update('language', lang);
			} catch (error) {
				console.error('Failed to save language preference:', error);
			}
		}
		document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
	}
};

export const initializeLanguage = () => {
	const userLanguage = store.isLoggedIn ? store.language : 'en';
	setLanguage(userLanguage as Lang, false);
};

export const t = (key: string) => {
	return key.split('.').reduce((obj, keyPart) => {
		return obj ? obj[keyPart] : null;
	}, translations[currentLanguage]) || key;
};
