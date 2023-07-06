import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useSteps} from '~pages/login/useSteps';
import {type RegisterContext} from '~pages/login/RegisterContent';
import {MnemonicWord} from '~pages/login/MnemoWord';

const useClearedWords = (numberOfClearedWords: number, phrase: string | undefined) => {
	const originalWords = useMemo(() => phrase?.split(' ') ?? [], [phrase]);
	const [filledWords, setFilledWords] = useState<Map<number, string>>(new Map());
	const [clearedIndexes, setClearedIndexes] = useState<number[]>([]);

	useEffect(() => {
		const uniqueIndexes = new Set<number>();
		while (uniqueIndexes.size < numberOfClearedWords) {
			uniqueIndexes.add(Math.floor(Math.random() * originalWords.length));
		}

		setClearedIndexes(Array.from(uniqueIndexes));
	}, [numberOfClearedWords, originalWords]);

	const handleChangeWord = useCallback((index: number, word: string) => {
		setFilledWords(prev => new Map(prev).set(index, word));
	}, []);

	const isValid = useMemo(() =>
		clearedIndexes.every(index => filledWords.get(index) === originalWords[index]),
	[filledWords, originalWords, clearedIndexes],
	);

	return {filledWords, handleChangeWord, isValid, clearedIndexes, originalWords};
};

type PhraseWordProps = {
	word: string;
	index: number;
	isCleared: boolean;
	value: string;
	handleChangeWord: (index: number, word: string) => void;
};

export const ConfirmationStep: React.FC = () => {
	const {prev, next, state: {phrase}} = useSteps<RegisterContext>();
	const {handleChangeWord, isValid, originalWords, clearedIndexes, filledWords} = useClearedWords(3, phrase);

	const handleNext = useCallback(() => {
		if (isValid) {
			next();
		}
	}, [isValid, next]);

	if (!phrase) {
		return null;
	}

	const clearedIndexSet = new Set(clearedIndexes);

	return (
		<>
			<p className='text-center font-bold'>
			Please fill in the missing words to confirm you have written down the phrase correctly.
			</p>
			<div className='px-0 sm:px-8'>
				<div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
					{originalWords.map((word, index) => (
						<MnemonicWord
							key={`${index}-${word}`}
							label={index + 1}
							value={clearedIndexSet.has(index) ? (filledWords.get(index) ?? '') : word}
							readOnly={!clearedIndexSet.has(index)}
							onChange={e => handleChangeWord(index, e.target.value)}
						/>
					))}
				</div>
				<div className='mt-6 flex gap-4'>
					<button className='btn-neutral btn grow' onClick={prev}>Back</button>
					<button className='btn-neutral btn grow' onClick={handleNext} disabled={!isValid}>Confirm</button>
				</div>
			</div>
		</>
	);
};
