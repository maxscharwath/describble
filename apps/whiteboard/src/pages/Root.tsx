import {Link, useNavigate} from 'react-router-dom';
import React from 'react';
import {useWhiteboard} from '~core/hooks';
import {CloudIcon, TrashIcon} from 'ui/components/Icons';
import {DescribbleLogo} from '~components/DescribbleLogo';
import {Thumbnail} from '~components/Thumbnail';

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
		<div className='flex min-h-screen flex-col bg-gray-200 px-4 dark:bg-gray-900'>
			<div className='mx-auto flex w-full max-w-7xl grow flex-col items-center'>
				<div className='navbar rounded-box glass sticky top-4 z-50 mb-8 bg-base-100/50 shadow-xl'>
					<div className='mr-8 flex-1 text-slate-800 dark:text-slate-100'>
						<DescribbleLogo className='absolute m-2 h-8 w-auto' textClassName='opacity-0 sm:opacity-100 transition-opacity duration-300 ease-in-out'/>
					</div>
					<div className='flex-none'>
						<button className='btn-ghost btn' onClick={handleCreate}>
							<CloudIcon className='h-6 w-6'/>
							<span>Create New Whiteboard</span>
						</button>
					</div>
				</div>
				<List list={list} onDelete={handleDelete}/>
			</div>
		</div>
	);
};

const List = ({list, onDelete}: {onDelete: (id: string) => void; list: string[]}) => (
	<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
		{list.map((item, index) => (
			<div key={index} className='card glass min-w-full shadow-lg'>
				<figure className='h-48 bg-gradient-to-b from-black/0 to-black/10 object-cover'>
					<Thumbnail documentId={item} camera={{x: 0, y: 0, zoom: 0.25}} dimension={{width: 300, height: 200}}/>
				</figure>
				<div className='card-body overflow-hidden'>
					<h2 className='card-title'>Document #{index}</h2>
					<div className='badge badge-neutral max-w-full'><span className='overflow-hidden text-ellipsis text-xs'>{item}</span></div>
					<div className='card-actions justify-end'>
						<button className='btn-error btn-sm btn' onClick={() => onDelete(item)}>
							<TrashIcon fontSize={20}/>
							<span>Delete</span>
						</button>
						<Link to={`/document/${item}`}>
							<button className='btn-neutral btn-sm btn'>
								<CloudIcon fontSize={20}/>
								<span>Open</span>
							</button>
						</Link>
					</div>
				</div>
			</div>
		))}
	</div>
);
