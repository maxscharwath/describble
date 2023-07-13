/**
 * Class representing a DocumentValidationError
 * This is used when a document fails a validation check
 */
export class DocumentValidationError extends Error {
	constructor(message?: string, options?: ErrorOptions) {
		super(message, options);
		this.name = 'DocumentValidationError';
	}
}
