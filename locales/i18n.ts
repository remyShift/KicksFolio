import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import enAuth from './en/auth.json';
import enForm from './en/form.json';
import enSettings from './en/settings.json';

import frAuth from './fr/auth.json';
import frForm from './fr/form.json';
import frSettings from './fr/settings.json';

const resources = {
	en: {
		translation: {
			auth: enAuth,
			form: enForm,
			settings: enSettings,
		},
	},
	fr: {
		translation: {
			auth: frAuth,
			form: frForm,
			settings: frSettings,
		},
	},
};

// Récupération de la langue de l'appareil
export const deviceLanguage = getLocales()[0]?.languageCode || 'en';

i18n.use(initReactI18next).init({
	resources,
	lng: 'en',
	fallbackLng: 'en',
	debug: __DEV__,

	interpolation: {
		escapeValue: false,
	},

	react: {
		useSuspense: false,
	},
});

export default i18n;
