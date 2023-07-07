import {type WhiteboardApp} from '~core/WhiteboardApp';

export const seederCredentials = {
	key: 'qBWVsxpXJHfNShbiKtgWkD6M2KNp35JaPS4Efck39t43',
	privateKey: new Uint8Array([67, 164, 123, 169, 138, 28, 13, 130, 211, 136, 179, 76, 134, 243, 231, 0, 56, 50, 255, 210, 22, 196, 204, 205, 94, 93, 116, 44, 130, 88, 115, 255]),
	secret: 'password123',
};

export const initSeeder = async (app: WhiteboardApp) => {
	try {
		await app.sessionManager.register(
			seederCredentials.privateKey,
			seederCredentials.secret,
		);
	} catch {}
};
