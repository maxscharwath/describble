import {Link, useNavigate} from 'react-router-dom';
import React from 'react';
import {useWhiteboard} from '~core/hooks';
import {CloudIcon, KeyIcon, ShareIcon, TrashIcon} from 'ui/components/Icons';
import {DescribbleLogo} from '~components/DescribbleLogo';
import {Thumbnail} from '~components/Thumbnail';
import {useTranslation} from 'react-i18next';
import {Modal, modalActivator} from '~components/ui/Modal';
import {useDocument} from '~core/hooks/useDocument';

const useList = () => {
	const app = useWhiteboard();
	const [list, setList] = React.useState<string[]>([]);
	const refresh = React.useCallback(async () => {
		const list = await app.documentManager.list();
		setList(list);
	}, [app]);

	React.useEffect(() => {
		void refresh();
	}, [refresh]);

	return [list, refresh] as const;
};

export const Root = () => {
	const {t} = useTranslation();
	const app = useWhiteboard();
	const navigate = useNavigate();
	const [list, refresh] = useList();

	const handleCreate = async () => {
		const {id} = app.documentManager.create();
		navigate(`/document/${id}`);
	};

	const handleDelete = async (id: string) => {
		await app.documentManager.delete(id);
		void refresh();
	};

	return (
		<div className='flex min-h-screen flex-col px-4 portrait:standalone:pt-14'>
			<div className='mx-auto flex w-full max-w-7xl grow flex-col items-center'>
				<div className='navbar rounded-box sticky top-4 z-50 mb-8 bg-base-100/50 shadow-xl backdrop-blur-xl'>
					<div className='mr-8 flex-1 text-slate-800 dark:text-slate-100'>
						<DescribbleLogo className='absolute m-2 h-8 w-auto' textClassName='opacity-0 sm:opacity-100 transition-opacity duration-300 ease-in-out'/>
					</div>
					<div className='flex-none'>
						<button className='btn-ghost btn' onClick={handleCreate}>
							<CloudIcon className='h-6 w-6'/>
							<span>{t('btn.new_whiteboard')}</span>
						</button>
					</div>
				</div>
				<List list={list} onDelete={handleDelete}/>
			</div>
		</div>
	);
};

const List = ({list, onDelete}: {onDelete: (id: string) => void; list: string[]}) => {
	const {t} = useTranslation();

	return (
		<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
			{list.map((item, index) => (
				<div key={item} className='relative'>
					<Link to={`/document/${item}`} className='peer absolute inset-0 outline-none' aria-label={t('btn.open')} />
					<div className='card pointer-events-none min-w-full bg-base-100/50 shadow-lg transition-all duration-100 ease-in-out peer-focus:shadow-xl peer-focus:ring-4 peer-focus:ring-neutral peer-active:scale-95'>
						<figure className='z-0 h-48 w-full bg-gradient-to-b from-black/0 to-black/10 object-cover'>
							<Thumbnail
								documentId={item}
								camera={{x: 0, y: 0, zoom: 0.25}}
								dimension={{width: 300, height: 200}}/>
						</figure>
						<div className='card-body overflow-hidden'>
							<h2 className='card-title'>{t('document.title', {index})}</h2>
							<div className='badge badge-neutral max-w-full'><span
								className='overflow-hidden text-ellipsis text-xs'>{item}</span></div>
						</div>
						<div className='pointer-events-auto z-10 p-4 pt-0'>
							<div className='card-actions justify-end'>
								<button className='btn-error btn-sm btn-circle btn' onClick={() => onDelete(item)} aria-label={t('btn.delete')}>
									<TrashIcon fontSize={20}/>
								</button>
								<ShareModal documentId={item}/>
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
};

const Activator = modalActivator(({openModal}) =>
	<button className='btn-primary btn-sm btn-circle btn' onClick={openModal}>
		<ShareIcon fontSize={20}/>
	</button>,
);

type ShareModalProps = {
	documentId: string;
};

const ShareModal = ({documentId}: ShareModalProps) => {
	const {document, error} = useDocument(documentId);

	if (error ?? !document) {
		return null;
	}

	const allowedClients = [
		document.header.owner,
		...document.header.allowedClients,
	];

	return <Modal activator={Activator}>
		{({closeModal}) => (<div className='grid gap-4'>
			<h1>Share</h1>

			<div className='form-control'>
				<div className='input-group'>
					<input type='text' className='input-bordered input w-full text-sm' placeholder='Public key'/>
					<button className='btn-square btn'>
						<KeyIcon fontSize={20}/>
					</button>
				</div>
			</div>

			<div className='rounded-box mb-4 border p-4'>
				{allowedClients.map(({base58}) => (
					<div className='form-control' key={base58}>
						<div className='input-group'>
							<input type='text' className='input-bordered input w-full text-sm' readOnly value={base58}/>
							<button className='btn-square btn'>
								<TrashIcon fontSize={20}/>
							</button>
						</div>
					</div>
				))}
			</div>

			<div className='flex justify-end'>
				<button className='btn-primary btn' onClick={closeModal}>Save</button>
			</div>
		</div>)}
	</Modal>;
};
