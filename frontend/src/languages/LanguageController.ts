import en from './en.js'
import fr from './fr.js'

const translations:any = { en, fr };

export type Lang = 'en' | 'fr';

let currentLanguage:Lang = 'en'; 

export const setLanguage = (lang: Lang) => {	
	if (translations[lang]) {
	  currentLanguage = lang;
	  document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
	}
};

export const getLanguage = (lang: Lang) => {
	return translations[currentLanguage]
};

export const msg = (key:string) => {
	return key.split('.').reduce((obj, keyPart) => {
	  return obj ? obj[keyPart] : null;
	}, translations[currentLanguage]) || key;
};
// we can use it like this:
// msg('home.title')
// msg('register.signup.emailPlaceholder')