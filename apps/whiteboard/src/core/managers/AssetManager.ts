import {type Asset, type WhiteboardApp} from '~core/WhiteboardApp';
import {nanoid} from 'nanoid';

export class AssetManager {
	constructor(private readonly app: WhiteboardApp) {}

	public createAsset(src: string, type: string): Asset {
		const existingAsset = Object.values(this.app.documentState.assets).find(asset => asset.src === src);
		if (existingAsset) {
			return existingAsset;
		}

		const asset: Asset = {
			id: nanoid(),
			type,
			src,
		};
		this.addAsset(asset);
		return asset;
	}

	public addAsset(asset: Asset) {
		this.app.patchDocument({
			assets: {
				[asset.id]: asset,
			},
		}, `add_asset_${asset.id}`);
	}

	public getAsset(id: string): Asset | undefined {
		return this.app.documentState.assets[id];
	}
}
