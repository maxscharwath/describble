import React, {useState, useEffect, useMemo, memo} from 'react';
import {useWhiteboard} from '~core/hooks';
import {getLayerUtil, type Layer} from '~core/layers';
import {type Asset, type SyncedDocument} from '~core/managers';
import {type Document} from 'ddnet';
import {QuadTree} from '~core/utils/QuadTree';
import {type Camera, type Dimension} from '~core/types';
import {getCanvasBounds} from '~core/utils';
import {useTranslation} from 'react-i18next';
import {type WhiteboardApp} from '~core/WhiteboardApp';
import {renderToString} from 'react-dom/server';

interface DocumentHookProps {
	documentId: string;
}

const useDocument = ({documentId}: DocumentHookProps) => {
	const [document, setDocument] = useState<Document<SyncedDocument> | null>(null);
	const [error, setError] = useState<Error | null>(null);
	const app = useWhiteboard();
	useEffect(() => {
		const fetchDocument = async () => {
			try {
				const doc = await app.documentManager.get(documentId);
				setDocument(doc ?? null);
			} catch (cause) {
				setError(new Error('Failed to fetch document', {cause}));
			}
		};

		void fetchDocument();
	}, [documentId, app]);

	return {document, error};
};

interface ThumbnailProps {
	documentId: string;
	dimension: Dimension;
	camera: Camera;
}

export const ThumbnailRenderer = ({document, dimension, camera}: {document: Document<SyncedDocument>; dimension: Dimension; camera: Camera}) => {
	const {t} = useTranslation();
	const layers = useLayers({document, dimension, camera});
	const assets = document?.data.assets ?? {};

	if (layers.length === 0) {
		return (
			<div>
				<span className='text-gray-500'>{t('error.no_layers')}</span>
			</div>);
	}

	return (
		<svg viewBox={`0 0 ${dimension.width} ${dimension.height}`} className='h-full w-full animate-fade-in' xmlns='http://www.w3.org/2000/svg'>
			<g transform={`translate(${camera.x}, ${camera.y}) scale(${camera.zoom})`}>
				{layers.map(layer => (
					<LayerComponent layer={layer} asset={layer.assetId ? assets[layer.assetId] : undefined} key={layer.id}/>
				))}
			</g>
		</svg>
	);
};

export const toThumbnail = async (app: WhiteboardApp, {documentId, dimension, camera}: ThumbnailProps) => {
	const document = await app.documentManager.get(documentId);
	if (!document) {
		throw new Error('Failed to fetch document');
	}

	return renderToString(<ThumbnailRenderer document={document} dimension={dimension} camera={camera}/>);
};

export const Thumbnail = memo(({documentId, dimension, camera}: ThumbnailProps) => {
	const {t} = useTranslation();
	const {document, error} = useDocument({documentId});

	if (error) {
		return (
			<div>
				<span className='text-gray-500'>{t('error.failed_to_fetch_document')}</span>
			</div>);
	}

	if (!document) {
		return <span className='loading loading-ring loading-lg'></span>;
	}

	return <ThumbnailRenderer document={document} dimension={dimension} camera={camera}/>;
});
Thumbnail.displayName = 'Thumbnail';

interface LayerHookProps {
	document: Document<SyncedDocument> | undefined | null;
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
