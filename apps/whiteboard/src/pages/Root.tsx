import {generatePath, Link, useNavigate} from 'react-router-dom';
import React from 'react';
import {useWhiteboard} from '~core/hooks';
import {CloudIcon, ShareIcon, TrashIcon} from 'ui/components/Icons';
import {DescribbleLogo} from '~components/DescribbleLogo';
import {Thumbnail} from '~components/Thumbnail';
import {useTranslation} from 'react-i18next';

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
		<div className='flex min-h-screen flex-col bg-gray-100 px-4'>
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

	const handleShare = async (event: React.MouseEvent<HTMLButtonElement>, id: string) => navigator.share({
		title: 'Describble',
		text: 'Describble',
		url: generatePath('/document/:id', {id}),
	});

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
								<button className='btn-primary btn-sm btn-circle btn' onClick={async e => handleShare(e, item)} aria-label={t('btn.share')}>
									<ShareIcon fontSize={20}/>
								</button>
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
};
