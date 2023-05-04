import {type Asset, type WhiteboardApp} from '../WhiteboardApp';

export class AssetManager {
	constructor(private readonly app: WhiteboardApp) {}

	public addAsset(asset: Asset) {
		this.app.patchState({
			document: {
				assets: {
					[asset.id]: asset,
				},
			},
		}, `add_asset_${asset.id}`);
	}

	public getAsset(id: string): Asset | undefined {
		return this.app.state.document.assets[id];
	}
}
