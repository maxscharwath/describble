import React from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

type ConfirmDialogProps = {
	onAction: () => void;
	title: string;
	description: string;
	cancelLabel: string;
	actionLabel: string;
	children: React.ReactNode;
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
	onAction,
	title,
	description,
	cancelLabel,
	actionLabel,
	children,
}) => (
	<AlertDialog.Root>
		<AlertDialog.Trigger asChild>
			{children}
		</AlertDialog.Trigger>
		<AlertDialog.Portal>
			<AlertDialog.Content className='modal data-[state=open]:modal-open'>
				<div className='modal-box'>
					<AlertDialog.Title className='text-lg font-bold'>
						{title}
					</AlertDialog.Title>
					<AlertDialog.Description className='py-4'>
						{description}
					</AlertDialog.Description>
					<div className='modal-action'>
						<AlertDialog.Cancel asChild>
							<button className='btn-ghost btn'>
								{cancelLabel}
							</button>
						</AlertDialog.Cancel>
						<AlertDialog.Action asChild>
							<button className='btn-error btn' onClick={onAction}>
								{actionLabel}
							</button>
						</AlertDialog.Action>
					</div>
				</div>
			</AlertDialog.Content>
		</AlertDialog.Portal>
	</AlertDialog.Root>
);
