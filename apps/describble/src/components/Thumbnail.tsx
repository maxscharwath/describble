import React, {memo, useMemo} from 'react';
import {getLayerUtil, type Layer} from '~core/layers';
import {type Asset, type DocumentMetadata, type SyncedDocument} from '~core/managers';
import {type Document} from '@describble/ddnet';
import {QuadTree} from '~core/utils/QuadTree';
import {type Camera, type Dimension} from '~core/types';
import {getCanvasBounds} from '~core/utils';
import {useTranslation} from 'react-i18next';
import {type WhiteboardApp} from '~core/WhiteboardApp';
import {renderToString} from 'react-dom/server';
import {useDocument} from '~core/hooks/useDocument';

interface ThumbnailProps {
	documentId: string;
	dimension: Dimension;
	camera: Camera;
}

export const ThumbnailRenderer = ({document, dimension, camera}: {document: Document<SyncedDocument, DocumentMetadata>; dimension: Dimension; camera: Camera}) => {
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

export const Thumbnail = memo(({documentId, dimension, camera}: ThumbnailProps) => {
	const {t} = useTranslation();
	const {document, error} = useDocument(documentId);

	if (error) {
		return (
			<div>
				<span className='text-gray-500'>{t('error.failed_to_fetch_document')}</span>
			</div>);
	}

	if (!document) {
		return <div className='flex h-full w-full animate-pulse items-center justify-center rounded bg-neutral/20'>
			<svg className='h-10 w-10 text-gray-200 dark:text-gray-600' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 20 18'><path d='M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z'/></svg>
		</div>;
	}

	return <ThumbnailRenderer document={document} dimension={dimension} camera={camera}/>;
});
Thumbnail.displayName = 'Thumbnail';

interface LayerHookProps {
	document: Document<SyncedDocument, DocumentMetadata> | undefined | null;
	dimension: Dimension;
	camera: Camera;
}

export const toThumbnail = async (app: WhiteboardApp, {documentId, dimension, camera}: ThumbnailProps) => {
	const doc = await app.documentManager.get(documentId);
	if (!doc) {
		throw new Error('Failed to fetch document');
	}

	const svgData = renderToString(<ThumbnailRenderer document={doc} dimension={dimension} camera={camera}/>);

	const canvas = document.createElement('canvas');
	canvas.width = dimension.width;
	canvas.height = dimension.height;
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Failed to create canvas');
	}

	ctx.drawImage(await renderSvg(svgData), 0, 0);
	return new Promise<Blob>((resolve, reject) => {
		canvas.toBlob(blob => {
			if (!blob) {
				reject(new Error('Failed to convert canvas to blob'));
				return;
			}

			resolve(blob);
		}, 'image/png');
	});
};

const renderSvg = async (svgData: string) => new Promise<HTMLImageElement>((resolve, reject) => {
	const img = new Image();
	img.src = URL.createObjectURL(new Blob([svgData], {type: 'image/svg+xml'}));
	img.onload = () => resolve(img);
	img.onerror = reject;
});

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
