import React, {type ChangeEvent, useEffect, useRef, useState} from 'react';
import {DescribbleLogo} from '~components/DescribbleLogo';

export const Login: React.FC = () => {
	const [phrase, setPhrase] = useState<string[]>(Array(12).fill(''));
	const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

	const handleChange = (e: ChangeEvent<HTMLInputElement>, i: number) => {
		const words = e.target.value.split(' ');
		if (words.length > 1) {
			words.forEach((word, wordIndex) => {
				if (i + wordIndex < 12) {
					setPhrase(prev => {
						const copy = [...prev];
						copy[i + wordIndex] = word;
						return copy;
					});
				}
			});
		} else {
			setPhrase(prev => {
				const copy = [...prev];
				copy[i] = e.target.value;
				return copy;
			});
		}

		if (e.target.value.includes(' ') && i < 11) {
			setTimeout(() => {
				inputRefs.current[i + 1]?.focus();
			}, 0);
		}
	};

	useEffect(() => {
		inputRefs.current = inputRefs.current.slice(0, 12);
	}, []);

	return (
		<div className='hero min-h-screen bg-base-200 p-4'>
			<div className='card w-full max-w-md shrink-0 shadow-2xl' data-theme='dark'>
				<div className='card-body'>
					<figure className='text-slate-100'>
						<DescribbleLogo className='w-full' />
					</figure>
					<div className='divider'></div>
					<div>
						<div data-theme='light' className='tabs -mb-px justify-center bg-transparent'>
							<div className='tab-lifted tab tab-active '>Login</div>
							<div className='tab-lifted tab  text-base-100'>Register</div>
						</div>
						<div data-theme='light' className='rounded-box mb-4 border border-base-300 bg-base-100 p-4 text-base-content'>
							<h2 className='mb-4 text-xl font-bold'>Recovery Phrase</h2>
							<div className='form-control'>
								<div className='grid grid-cols-4 gap-2'>
									{phrase.map((_, index) => (
										<input
											ref={el => inputRefs.current[index] = el}
											key={`word-${index}`}
											type='text'
											placeholder={`#${index + 1}`}
											className='input-bordered input input-md'
											value={phrase[index]}
											onChange={e => handleChange(e, index)}
										/>
									))}
								</div>
							</div>
							<div className='form-control mt-6'>
								<button className='btn-neutral btn'>Validate Phrase</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
