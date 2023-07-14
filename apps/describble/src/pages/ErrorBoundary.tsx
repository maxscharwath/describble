import React from 'react';
import {isRouteErrorResponse, Link, useRouteError} from 'react-router-dom';
import {Moodie} from 'moodie';
import {useTranslation} from 'react-i18next';
import {NotFound} from '~pages/NotFound';

export const ErrorBoundary = () => {
	const {t} = useTranslation();
	const error = useRouteError();
	const stack = error instanceof Error ? error.stack : null;
	if (isRouteErrorResponse(error) && error.status === 404) {
		return <NotFound />;
	}

	return (
		<div className='hero min-h-screen bg-base-200'>
			<div className='hero-content text-center'>
				<div className='flex max-w-screen-md flex-col items-center'>
					<div className='avatar m-6 animate-pop-in'>
						<Moodie size='100%' expression={{eye: 'mischief', mouth: 'unhappy'}}/>
					</div>
					<div tabIndex={0} className='collapse'>
						<div className='collapse-title'>
							<h1 className='text-6xl font-bold'>500</h1>
							<h2 className='text-4xl font-bold'>{t('error.internal.title')}</h2>
							<p className='py-6 text-lg'>
								{t('error.internal.description')}
							</p>
						</div>
						<pre className='collapse-content overflow-x-auto text-left font-mono text-sm'>
							{stack}
						</pre>
					</div>
					<Link to='/' className='btn-primary btn'>
						{t('error.internal.btn')}
					</Link>
				</div>
			</div>
		</div>
	);
};
