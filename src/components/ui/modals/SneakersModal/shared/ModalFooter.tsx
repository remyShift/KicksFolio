import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import BackButton from '@/components/ui/buttons/BackButton';
import DeleteButton from '@/components/ui/buttons/DeleteButton';
import EditButton from '@/components/ui/buttons/EditButton';
import NextButton from '@/components/ui/buttons/NextButton';
import NextSneakerButton from '@/components/ui/buttons/NextSneakerButton';
import { useModalNavigation } from '@/components/ui/modals/SneakersModal/hooks/useModalNavigation';
import { useSession } from '@/contexts/authContext';
import { useModalStore } from '@/store/useModalStore';

import { useModalFooterActions } from '../hooks/useModalFooterActions';

export const ModalFooter = () => {
	const { t } = useTranslation();
	const modalStep = useModalStore((state) => state.modalStep);
	const currentSneaker = useModalStore((state) => state.currentSneaker);
	const { user } = useSession();

	const {
		handleBackAction,
		handleNextAction,
		handleEditAction,
		handleDeleteAction,
		isLoading,
	} = useModalFooterActions();

	useModalNavigation();

	const isAnonymous = !user || user.is_anonymous;

	return (
		<View className="justify-end items-start w-full pb-6">
			{!isAnonymous && modalStep === 'sku' && (
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
			{!isAnonymous && modalStep === 'barcode' && (
				<View className="flex-row justify-between w-full">
					<BackButton onPressAction={handleBackAction} />
				</View>
			)}
			{!isAnonymous && modalStep === 'addFormImages' && (
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
			{!isAnonymous && modalStep === 'addFormDetails' && (
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
			{!isAnonymous && modalStep === 'editFormImages' && (
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
			{!isAnonymous && modalStep === 'editForm' && (
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
						{!isAnonymous &&
							currentSneaker &&
							user &&
							(currentSneaker.owner?.id === user.id ||
								currentSneaker.user_id === user.id) && (
								<EditButton
									onPressAction={handleEditAction}
									testID="edit-button"
								/>
							)}
					</View>

					<NextSneakerButton onPressAction={handleNextAction} />
				</View>
			)}
			{modalStep === 'wishlist-view' && (
				<View className="flex-row justify-between w-full">
					<BackButton onPressAction={handleBackAction} />
					<NextSneakerButton onPressAction={handleNextAction} />
				</View>
			)}
		</View>
	);
};
