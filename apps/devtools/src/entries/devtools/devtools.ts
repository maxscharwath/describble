import browser from 'webextension-polyfill';

void browser.devtools.panels.create(
	'Condensation', // Title
	'icons/icon_16.png', // Icon
	'src/entries/devtools/index.html', // Content
);
