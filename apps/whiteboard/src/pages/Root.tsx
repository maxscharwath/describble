import {Link, useNavigate} from 'react-router-dom';
import React from 'react';
import {useWhiteboard} from '~core/hooks';
import {CloudIcon, TrashIcon} from 'ui/components/Icons';
import {Button} from '~components/ui/Buttons';
import {DescribbleLogo} from '~components/DescribbleLogo';

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
		<div className='flex min-h-screen flex-col bg-gray-200 p-4 dark:bg-gray-900'>
			<div className='mx-auto flex w-full max-w-7xl flex-col items-center justify-center'>
				<div
					className='pointer-events-auto fixed inset-x-0 top-0 z-50 m-4 flex h-32 flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-100/80 p-2 shadow-lg backdrop-blur dark:border-gray-600 dark:bg-gray-800/80 dark:text-gray-200'
				>
					<div className='m-2 h-16 text-slate-900 dark:text-slate-100'>
						<DescribbleLogo className='h-full' />
					</div>
					<Button onClick={handleCreate}>
						<CloudIcon className='h-6 w-6'/>
						<span>Create New Whiteboard</span>
					</Button>
				</div>
				<List list={list} onDelete={handleDelete}/>
			</div>
		</div>
	);
};

const List = ({list, onDelete}: {onDelete: (id: string) => void; list: string[]}) => (
	<div className='mt-36 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
		{list.map((item, index) => (
			<div key={index} className='m-2 flex min-w-full flex-col rounded-lg border border-gray-200 bg-gray-100/80 p-2 shadow-lg backdrop-blur dark:border-gray-600 dark:bg-gray-800/80 dark:text-gray-200'>
				<img className='h-48 w-full object-cover' src='https://source.unsplash.com/random' alt='Random Image'/>
				<div className='flex grow flex-col justify-between px-6 py-4'>
					<div className='mb-2 overflow-hidden text-ellipsis text-xl font-bold'>Document: {item}</div>
					<div className='flex justify-end gap-4'>
						<Button className='bg-red-500 text-white hover:bg-red-600' onClick={async () => onDelete(item)}>
							<TrashIcon fontSize={20}/>
							<span>Delete</span>
						</Button>
						<Link to={`/document/${item}`}>
							<Button>
								<CloudIcon fontSize={20}/>
								<span>Open</span>
							</Button>
						</Link>
					</div>
				</div>
			</div>
		))}
	</div>
);
