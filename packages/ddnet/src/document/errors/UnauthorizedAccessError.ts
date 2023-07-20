/**
 * Class representing an UnauthorizedAccessError
 * This is used when there are attempts to access resources without permission
 */
export class UnauthorizedAccessError extends Error {
	public constructor(message?: string, options?: ErrorOptions) {
		super(message, options);
		this.name = 'UnauthorizedAccessError';
	}
}
