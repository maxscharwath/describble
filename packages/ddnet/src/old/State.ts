import Emittery from 'emittery';

export class State<TState> extends Emittery<{
	transition: {from: TState; to: TState};
}> {
	private _value: TState;

	constructor(initialState: TState) {
		super();
		this._value = initialState;
	}

	public get value(): TState {
		return this._value;
	}

	public set value(newState: TState) {
		const oldState = this._value;
		this._value = newState;
		console.log(`Transition ${oldState as string} -> ${newState as string}`);
		void this.emit('transition', {from: oldState, to: newState});
	}

	public is(...states: TState[]) {
		return new Set(states).has(this._value);
	}

	public async waitTransition(states: TState[], timeout: number): Promise<TState> {
		const statesSet = new Set(states);

		if (statesSet.has(this._value)) {
			return this.value;
		}

		return new Promise((resolve, reject) => {
			const timeoutId = setTimeout(() => {
				unsubscribe();
				reject(new Error('Transition timeout'));
			}, timeout);

			const unsubscribe = this.on('transition', ({to}) => {
				if (statesSet.has(to)) {
					clearTimeout(timeoutId);
					unsubscribe();
					resolve(to);
				}
			});
		});
	}
}
