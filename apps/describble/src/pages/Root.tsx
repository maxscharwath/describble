import {Link, useNavigate} from 'react-router-dom';
import React from 'react';
import {useWhiteboard} from '~core/hooks';
import {CloudIcon, TrashIcon} from 'ui/components/Icons';
import {DescribbleLogo} from '~components/ui/DescribbleLogo';
import {Thumbnail} from '~components/Thumbnail';
import {useTranslation} from 'react-i18next';
import {useSession} from '~core/hooks/useSession';
import {KeyAvatar} from '~components/ui/KeyAvatar';
import {ShareModal} from '~pages/ShareModal';
import {ConfirmDialog} from '~components/ui/ConfirmDialog';

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
	const session = useSession();
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
						<DescribbleLogo className='pointer-events-none absolute m-2 h-8 w-auto' textClassName='opacity-0 sm:opacity-100 transition-opacity duration-300 ease-in-out'/>
					</div>
					<div className='flex gap-2'>
						<button className='btn-ghost btn' onClick={handleCreate}>
							<CloudIcon className='h-6 w-6'/>
							<span>{t('btn.new_whiteboard')}</span>
						</button>

						{session && (
							<button className='btn-ghost btn' onClick={() => navigate('/login')}>
								<KeyAvatar value={session.base58PublicKey} className='w-6' />
							</button>
						)}
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
								<ConfirmDialog
									onAction={() => onDelete(item)}
									title={t('confirm_dialog.title')}
									description={t('confirm_dialog.description')}
									actionLabel={t('confirm_dialog.action')}
									cancelLabel={t('confirm_dialog.cancel')}
								>
									<button className='btn-error btn-sm btn-circle btn'>
										<TrashIcon fontSize={20}/>
									</button>
								</ConfirmDialog>
								<ShareModal documentId={item}/>
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
};
