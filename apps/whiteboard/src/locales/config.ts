import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './en.json' assert {type: 'json'};
import fr from './fr.json' assert {type: 'json'};

i18next.on('languageChanged', lng => {
	document.documentElement.setAttribute('lang', lng);
});

void i18next
	.use(initReactI18next)
	.use(LanguageDetector)
	.init({
		fallbackLng: 'en',
		resources: {
			en: {
				translation: en,
			},
			fr: {
				translation: fr,
			},
		},
	});
