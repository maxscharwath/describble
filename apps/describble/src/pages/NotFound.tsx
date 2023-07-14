import React from 'react';
import {Link} from 'react-router-dom';
import {Moodie} from 'moodie';
import {useTranslation} from 'react-i18next';

export const NotFound = () => {
	const {t} = useTranslation();
	return (
		<div className='hero min-h-screen bg-base-200'>
			<div className='hero-content text-center'>
				<div className='flex max-w-screen-md flex-col items-center'>
					<div className='avatar m-6 animate-pop-in'>
						<Moodie size='100%' expression={{eye: 'mischief', mouth: 'unhappy'}}/>
					</div>
					<h1 className='text-6xl font-bold'>404</h1>
					<h2 className='text-4xl font-bold'>{t('error.not_found.title')}</h2>
					<p className='py-6 text-lg'>
						{t('error.not_found.description')}
					</p>
					<Link to='/' className='btn-primary btn'>
						{t('btn.back_to_home')}
					</Link>
				</div>
			</div>
		</div>
	);
};
