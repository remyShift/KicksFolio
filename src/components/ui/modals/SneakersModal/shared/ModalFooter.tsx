import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import BackButton from '@/components/ui/buttons/BackButton';
import DeleteButton from '@/components/ui/buttons/DeleteButton';
import EditButton from '@/components/ui/buttons/EditButton';
import NextButton from '@/components/ui/buttons/NextButton';
import { useSession } from '@/contexts/authContext';
import { useModalNavigation } from '@/hooks/useModalNavigation';
import { useModalStore } from '@/store/useModalStore';

import { useModalFooterActions } from '../hooks/useModalFooterActions';

export const ModalFooter = () => {
	const { t } = useTranslation();
	const { modalStep, currentSneaker } = useModalStore();
	const { user } = useSession();

	const {
		handleBackAction,
		handleNextAction,
		handleEditAction,
		handleDeleteAction,
		isLoading,
	} = useModalFooterActions();

	useModalNavigation();

	if (!user) return null;

	return (
		<View className="justify-end items-start w-full pb-6">
			{modalStep === 'sku' && (
				<View className="flex-row justify-between w-full">
					<BackButton onPressAction={handleBackAction} />
					<NextButton
						content={t('collection.modal.buttons.search')}
						onPressAction={() => {
							if (!isLoading) {
								handleNextAction();
							}
						}}
						disabled={isLoading}
						testID="search"
					/>
				</View>
			)}
			{modalStep === 'barcode' && (
				<View className="flex-row justify-between w-full">
					<BackButton onPressAction={handleBackAction} />
				</View>
			)}
			{modalStep === 'addFormImages' && (
				<View className="flex-row justify-between w-full">
					<BackButton onPressAction={handleBackAction} />
					<NextButton
						content={t('collection.actions.next')}
						onPressAction={() => {
							if (!isLoading) {
								handleNextAction();
							}
						}}
						disabled={isLoading}
						testID="next-to-details"
					/>
				</View>
			)}
			{modalStep === 'addFormDetails' && (
				<View className="flex-row justify-between w-full">
					<BackButton onPressAction={handleBackAction} />
					<NextButton
						content={t('collection.actions.add')}
						onPressAction={() => {
							if (!isLoading) {
								handleNextAction();
							}
						}}
						disabled={isLoading}
						testID="add"
					/>
				</View>
			)}
			{modalStep === 'editFormImages' && (
				<View className="flex-row justify-between w-full">
					<BackButton onPressAction={handleBackAction} />
					<NextButton
						content={t('ui.buttons.save')}
						onPressAction={() => {
							if (!isLoading) {
								handleNextAction();
							}
						}}
						disabled={isLoading}
						testID="save-images"
					/>
				</View>
			)}
			{modalStep === 'editForm' && (
				<View className="flex-row justify-between w-full">
					<View className="flex flex-row gap-3">
						<BackButton onPressAction={handleBackAction} />
						<DeleteButton
							onPressAction={handleDeleteAction}
							testID="delete"
						/>
					</View>

					<NextButton
						content={t('ui.buttons.save')}
						onPressAction={() => {
							if (!isLoading) {
								handleNextAction();
							}
						}}
						disabled={isLoading}
						testID="edit"
					/>
				</View>
			)}
			{modalStep === 'view' && (
				<View className="flex-row justify-between w-full">
					<View className="flex flex-row gap-3">
						<BackButton onPressAction={handleBackAction} />
						{(currentSneaker!.owner?.id === user.id ||
							currentSneaker!.user_id === user.id) && (
							<EditButton
								onPressAction={handleEditAction}
								testID="edit-button"
							/>
						)}
					</View>

					<NextButton
						content={t('collection.actions.next')}
						onPressAction={handleNextAction}
						testID="next"
					/>
				</View>
			)}
		</View>
	);
};
