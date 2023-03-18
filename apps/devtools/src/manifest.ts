import pkg from '../package.json' assert { type: 'json' };

const sharedManifest = {
	content_scripts: [
		{
			js: ['src/entries/contentScript/main.ts'],
			matches: ['*://*/*'],
		},
	],
	devtools_page: 'src/entries/devtools/index.html',
	icons: {
		16: 'icons/icon_16.png',
		19: 'icons/icon_19.png',
		32: 'icons/icon_32.png',
		38: 'icons/icon_38.png',
		48: 'icons/icon_48.png',
		64: 'icons/icon_64.png',
		96: 'icons/icon_96.png',
		128: 'icons/icon_128.png',
		256: 'icons/icon_256.png',
		512: 'icons/icon_512.png',
	},
	permissions: [],
};

const browserAction = {
	default_icon: {
		16: 'icons/icon_16.png',
		19: 'icons/icon_19.png',
		32: 'icons/icon_32.png',
		38: 'icons/icon_38.png',
	},
	default_popup: 'src/entries/popup/index.html',
};

const ManifestV2 = {
	...sharedManifest,
	background: {
		scripts: ['src/entries/background/main.ts'],
		persistent: false,
	},
	browser_action: browserAction,
	permissions: [...sharedManifest.permissions, '*://*/*'],
} satisfies Partial<chrome.runtime.ManifestV2>;

const ManifestV3 = {
	...sharedManifest,
	action: browserAction,
	background: {
		service_worker: 'src/entries/background/main.ts',
	},
	host_permissions: ['*://*/*'],
} satisfies Partial<chrome.runtime.ManifestV3>;

export function getManifest(manifestVersion: 2 | 3 | string) {
	const manifest = {
		author: pkg.author,
		description: pkg.description,
		name: pkg.displayName ?? pkg.name,
		version: pkg.version,
	};

	switch (manifestVersion) {
		case 2:
			return {
				...manifest,
				...ManifestV2,
				manifest_version: manifestVersion,
			};
		case 3:
			return {
				...manifest,
				...ManifestV3,
				manifest_version: manifestVersion,
			};
		default:
			throw new Error(`Missing manifest definition for manifestVersion ${manifestVersion}`);
	}
}
