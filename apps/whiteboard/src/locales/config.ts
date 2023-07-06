import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './en/en.json' assert {type: 'json'};
import fr from './fr/fr.json' assert {type: 'json'};

void i18next
	.use(initReactI18next)
	.use(LanguageDetector)
	.init({
		fallbackLng: 'en',
		debug: true,
		resources: {
			en: {
				translation: en,
			},
			fr: {
				translation: fr,
			},
		},
	});
