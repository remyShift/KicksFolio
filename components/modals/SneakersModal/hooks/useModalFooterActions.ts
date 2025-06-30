import { useModalStore } from '@/store/useModalStore';
import { useSneakerAPI } from './useSneakerAPI';
import { useSession } from '@/context/authContext';
import { Sneaker } from '@/types/Sneaker';
import { useState } from 'react';
import { Alert } from 'react-native';
import { SneakerFormData } from '@/validation/schemas';
import useToast from '@/hooks/useToast';
import { useTranslation } from 'react-i18next';

export const useModalFooterActions = () => {
	const { t } = useTranslation();
	const { showSuccessToast, showErrorToast, showInfoToast } = useToast();
	const { user, refreshUserData } = useSession();
	const [nextSneaker, setNextSneaker] = useState<Sneaker | null>(null);
	const [prevSneaker, setPrevSneaker] = useState<Sneaker | null>(null);

	const {
		modalStep,
		sneakerSKU,
		setModalStep,
		setErrorMsg,
		setFetchedSneaker,
		estimatedValue,
		gender,
		sku,
		validateForm,
		resetModalData,
		setCurrentSneaker,
		setIsVisible,
		currentSneaker,
		isLoading,
		setIsLoading,
	} = useModalStore();

	if (!user) {
		throw new Error('User is not authenticated');
	}

	const {
		handleSkuSearch,
		handleAddSneaker,
		handleFormUpdate,
		handleNext,
		handlePrevious,
		handleSneakerDelete,
	} = useSneakerAPI(user!.id);

	const handleEditAction = () => {
		setModalStep('editForm');
	};

	const handleDeleteAction = () => {
		if (currentSneaker?.id) {
			Alert.alert(
				t('alert.titles.deleteSneaker'),
				t('alert.descriptions.deleteSneaker'),
				[
					{
						text: t('alert.buttons.cancel'),
						style: 'cancel',
					},
					{
						text: t('alert.buttons.delete'),
						style: 'destructive',
						onPress: () => {
							showInfoToast(
								t('common.titles.deletingSneaker'),
								t('common.descriptions.deletingSneaker')
							);
							handleSneakerDelete(currentSneaker.id)
								.then(() => {
									refreshUserData();
									resetModalData();
									setModalStep('index');
									setIsVisible(false);
									setCurrentSneaker(null);
								})
								.then(() => {
									showSuccessToast(
										t('common.titles.sneakerDeleted'),
										t('common.descriptions.sneakerDeleted')
									);
								})
								.catch(() => {
									showErrorToast(
										t(
											'common.titles.sneakerDeletionFailed'
										),
										t(
											'common.descriptions.sneakerDeletionFailed'
										)
									);
									setErrorMsg(
										t(
											'common.descriptions.sneakerDeletionFailed'
										)
									);
								});
						},
					},
				]
			);
		}
	};

	const handleNextAction = () => {
		switch (modalStep) {
			case 'index':
				setErrorMsg('');
				setModalStep('sku');
				break;
			case 'sku':
				if (isLoading) return;

				if (!sneakerSKU.trim()) {
					setErrorMsg(
						t('common.sneaker.modal.form.errors.sku.required')
					);
					return;
				}
				showInfoToast(
					t('common.titles.searchingProgressSneaker'),
					t('common.descriptions.searchingProgressSneaker')
				);
				setErrorMsg('');
				setIsLoading(true);
				handleSkuSearch(sneakerSKU, {
					setFetchedSneaker,
					setModalStep,
					setErrorMsg,
				})
					.then(() => {
						showSuccessToast(
							t('common.titles.searchingSneaker'),
							t('common.descriptions.searchingSneaker')
						);
					})
					.finally(() => {
						setIsLoading(false);
					});
				break;
			case 'addForm':
				if (isLoading) return;

				if (validateForm) {
					showInfoToast(
						t('common.titles.addingSneaker'),
						t('common.descriptions.addingSneaker')
					);
					setIsLoading(true);
					validateForm()
						.then(async (result) => {
							if (result.isValid && result.data) {
								return handleAddSneaker(
									result.data as SneakerFormData,
									{
										setCurrentSneaker,
										setModalStep,
										setErrorMsg,
									},
									estimatedValue,
									gender,
									sku
								);
							} else {
								setErrorMsg(result.errorMsg);
							}
						})
						.catch((error) => {
							setErrorMsg(
								t(
									'common.sneaker.modal.form.errors.sneaker.error'
								) + error
							);
						})
						.finally(() => setIsLoading(false));
				}
				break;
			case 'editForm':
				if (isLoading) return;

				if (validateForm && currentSneaker) {
					showInfoToast(
						t('common.titles.updatingSneaker'),
						t('common.descriptions.updatingSneaker')
					);
					setIsLoading(true);
					validateForm()
						.then(async (result) => {
							if (result.isValid && result.data) {
								return handleFormUpdate(
									currentSneaker.id,
									result.data as SneakerFormData,
									{
										setCurrentSneaker,
										setModalStep,
										setErrorMsg,
									}
								);
							} else {
								setErrorMsg(result.errorMsg);
							}
						})
						.catch((error) => {
							setErrorMsg(
								t(
									'common.sneaker.modal.form.errors.sneaker.error'
								) + error
							);
						})
						.finally(() => setIsLoading(false));
				} else {
					if (!validateForm)
						setErrorMsg(
							t(
								'common.sneaker.modal.form.errors.validateForm.missing'
							)
						);
					if (!currentSneaker)
						setErrorMsg(
							t(
								'common.sneaker.modal.form.errors.currentSneaker.missing'
							)
						);
				}
				break;
			case 'view':
				if (nextSneaker) {
					handleNext(nextSneaker, setCurrentSneaker);
				} else {
					setIsVisible(false);
				}
				break;
		}
	};

	const handleBackAction = () => {
		switch (modalStep) {
			case 'sku':
				setErrorMsg('');
				setModalStep('index');
				break;
			case 'addForm':
				resetModalData();
				setModalStep('index');
				break;
			case 'editForm':
				setErrorMsg('');
				setModalStep('view');
				break;
			case 'view':
				if (prevSneaker) {
					handlePrevious(prevSneaker, setCurrentSneaker);
				} else {
					resetModalData();
					setIsVisible(false);
				}
				break;
		}
	};

	return {
		handleNextAction,
		handleBackAction,
		handleEditAction,
		handleDeleteAction,
		setNextSneaker,
		setPrevSneaker,
		isLoading,
	};
};
