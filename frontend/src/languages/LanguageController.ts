import en from './en.js'
import fr from './fr.js'
import ar from './ar.js'

const translations: any = { en, fr, ar };

export type Lang = 'en' | 'fr' | 'ar';

let currentLanguage: Lang = 'en';

export const setLanguage = (lang: Lang) => {
	if (translations[lang]) {
		document.body.dir = lang === 'ar'? 'rtl' : 'ltr';
		currentLanguage = lang;
		document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
	}
};

export const t = (key: string) => {
	return key.split('.').reduce((obj, keyPart) => {
		return obj ? obj[keyPart] : null;
	}, translations[currentLanguage]) || key;
};
