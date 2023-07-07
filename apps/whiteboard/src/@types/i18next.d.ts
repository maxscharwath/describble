import type translation from '../locales/en.json' assert {type: 'json'};

declare module 'i18next' {
	interface CustomTypeOptions {
		resources: typeof translation;
	}
}
