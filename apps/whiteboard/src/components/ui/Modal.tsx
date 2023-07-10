import React, {useImperativeHandle, forwardRef, useRef, useEffect} from 'react';

type ModalHandle = {
	openModal: () => void;
	closeModal: () => void;
};

type ModalProps = {
	open?: boolean;
	activator?: React.FC<{openModal: () => void}>;
	children: React.FC<{closeModal: () => void}>;
};

export const Modal = forwardRef<ModalHandle, ModalProps>(({open, activator, children}, ref) => {
	const modalRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		if (modalRef.current) {
			if (open) {
				openModal();
			} else {
				closeModal();
			}
		}
	}, [open, modalRef]);

	const openModal = () => {
		if (modalRef.current) {
			modalRef.current.close();
			modalRef.current.showModal();
		}
	};

	const closeModal = () => {
		if (modalRef.current) {
			modalRef.current.close();
		}
	};

	useImperativeHandle(ref, () => ({
		openModal,
		closeModal,
	}));

	return (
		<>
			{activator?.({openModal})}
			<dialog className='modal modal-bottom sm:modal-middle' ref={modalRef}>
				<form method='dialog' className='modal-box'>
					{children({closeModal})}
				</form>
				<form method='dialog' className='modal-backdrop'>
					<button>close</button>
				</form>
			</dialog>
		</>
	);
});

Modal.displayName = 'Modal';

export const modalActivator = (activator: React.FC<{openModal: () => void}>) => activator;
