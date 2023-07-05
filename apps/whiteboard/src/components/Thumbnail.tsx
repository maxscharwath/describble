import React, {useState, useEffect, useMemo, memo} from 'react';
import {useWhiteboard} from '~core/hooks';
import {getLayerUtil, type Layer} from '~core/layers';
import {type Asset, type SyncedDocument} from '~core/managers';
import {type Document} from 'ddnet';
import {QuadTree} from '~core/utils/QuadTree';
import {type Camera, type Dimension} from '~core/types';
import {getCanvasBounds} from '~core/utils';

interface DocumentHookProps {
	documentId: string;
}

const useDocument = ({documentId}: DocumentHookProps): Document<SyncedDocument> | null => {
	const [document, setDocument] = useState<Document<SyncedDocument> | null>(null);
	const app = useWhiteboard();
	useEffect(() => {
		const fetchDocument = async () => {
			try {
				const doc = await app.documentManager.get(documentId);
				setDocument(doc ?? null);
			} catch (error) {
				console.error(error);
			}
		};

		void fetchDocument();
	}, [documentId, app]);

	return document;
};

interface ThumbnailProps {
	documentId: string;
	dimension: Dimension;
	camera: Camera;
}

export const Thumbnail = memo(({documentId, dimension, camera}: ThumbnailProps) => {
	const document = useDocument({documentId});

	const layers = useLayers({document, dimension, camera});

	if (!document) {
		return <span className='text-gray-400'>Loading...</span>;
	}

	const assets = document.data.assets ?? {};

	return (
		<svg viewBox={`0 0 ${dimension.width} ${dimension.height}`}>
			<g transform={`translate(${camera.x}, ${camera.y}) scale(${camera.zoom})`}>
				{layers.map(layer => (
					<LayerComponent layer={layer} asset={layer.assetId ? assets[layer.assetId] : undefined} key={layer.id} />
				))}
			</g>
		</svg>
	);
});

Thumbnail.displayName = 'Thumbnail';

interface LayerHookProps {
	document: Document<SyncedDocument> | null;
	dimension: Dimension;
	camera: Camera;
}

const useLayers = ({document, dimension, camera}: LayerHookProps): Layer[] => useMemo(() => {
	if (!document) {
		return [];
	}

	const visibleLayers = Object.entries(document.data.layers ?? {}).filter(([, layer]) => layer.visible);
	const tree = new QuadTree<Layer>();

	for (const [, layer] of visibleLayers) {
		const utils = getLayerUtil(layer);
		tree.insert({bounds: utils.getBounds(layer as never), data: layer});
	}

	return tree.query(getCanvasBounds({x: 0, y: 0, ...dimension}, camera));
}, [document, dimension, camera]);

interface LayerComponentProps {
	layer: Layer;
	asset?: Asset;
}

const LayerComponent = ({layer, asset}: LayerComponentProps) => {
	const {Component} = getLayerUtil(layer);
	return <Component layer={layer as never} asset={asset} />;
};
