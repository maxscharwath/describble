import React from 'react';
import {type DeepPartial, Room} from './Room';

type RoomHandle<T> = {
	defaultData: T;
	onData?: (data: T) => void;
};

export const useEffectOnce = (effect: () => void | (() => void)) => {
	const destroyFunc = React.useRef<void | (() => void)>();
	const effectCalled = React.useRef(false);
	const renderAfterCalled = React.useRef(false);
	const [, setVal] = React.useState<number>(0);

	if (effectCalled.current) {
		renderAfterCalled.current = true;
	}

	React.useEffect(() => {
		// Only execute the effect first time around
		if (!effectCalled.current) {
			destroyFunc.current = effect();
			effectCalled.current = true;
		}

		// This forces one render after the effect is run
		setVal(val => val + 1);

		return () => {
			// If the comp didn't render since the useEffect was called,
			// we know it's the dummy React cycle
			if (!renderAfterCalled.current) {
				return;
			}

			if (destroyFunc.current) {
				destroyFunc.current();
			}
		};
	}, []);
};

export function useRoom<T extends Record<string, any>>(roomId: string, {
	defaultData,
	onData,
}: RoomHandle<T>) {
	const roomRef = React.useRef<Room<T> | undefined>();
	useEffectOnce(() => {
		const room = new Room<T>(defaultData);
		void room.join(roomId);
		const unsub = room.on('data', message => {
			onData?.(message);
		});

		roomRef.current = room;
		return () => {
			room.leave();
			roomRef.current = undefined;
			unsub();
		};
	});

	const updateData = React.useCallback((data: DeepPartial<T>) => {
		void roomRef.current?.send(data);
	}, []);

	return {room: roomRef, updateData};
}
