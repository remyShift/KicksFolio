import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { useSession } from '@/contexts/authContext';
import useToast from '@/hooks/ui/useToast';
import { useModalStore } from '@/store/useModalStore';
import { Sneaker } from '@/types/sneaker';
import { SneakerFormData } from '@/validation/sneaker';

import { useSneakerAPI } from './useSneakerAPI';

export const useModalFooterActions = () => {
	const { t } = useTranslation();
	const { showSuccessToast, showErrorToast, showInfoToast } = useToast();
	const { user, refreshUserData } = useSession();

	const {
		modalStep,
		sneakerSKU,
		setModalStep,
		setErrorMsg,
		setFetchedSneaker,
		fetchedSneaker,
		estimatedValue,
		gender,
		sku,
		validateForm,
		resetModalData,
		setCurrentSneaker,
		setIsVisible,
		currentSneaker,
		nextSneaker,
		prevSneaker,
		isLoading,
		setIsLoading,
	} = useModalStore();

	const isAnonymous = !user || user.is_anonymous;

	const {
		handleSkuSearch,
		handleAddSneaker,
		handleFormUpdate,
		handleNext,
		handlePrevious,
		handleSneakerDelete,
	} = useSneakerAPI();

	const handleEditAction = () => {
		if (isAnonymous) {
			showErrorToast(
				'Action non autorisée',
				'Connectez-vous pour modifier des sneakers'
			);
			return;
		}
		setModalStep('editForm');
	};

	const handleDeleteAction = (sneakerToDelete: Sneaker | null = null) => {
		if (isAnonymous) {
			showErrorToast(
				'Action non autorisée',
				'Connectez-vous pour supprimer des sneakers'
			);
			return;
		}
		if (sneakerToDelete?.id || currentSneaker?.id) {
			Alert.alert(
				t('alert.titles.deleteSneaker'),
				t('alert.descriptions.deleteSneaker'),
				[
					{
						text: t('alert.choices.cancel'),
						style: 'cancel',
					},
					{
						text: t('alert.choices.delete'),
						style: 'destructive',
						onPress: () => {
							showInfoToast(
								t('collection.messages.deleting.title'),
								t('collection.messages.deleting.description')
							);
							const idToDelete =
								sneakerToDelete?.id || currentSneaker?.id;
							if (!idToDelete) {
								throw new Error('Sneaker ID is required');
							}
							handleSneakerDelete(idToDelete)
								.then(() => {
									refreshUserData();
									resetModalData();
									setModalStep('index');
									setIsVisible(false);
									setCurrentSneaker(null);
								})
								.then(() => {
									showSuccessToast(
										t('collection.messages.deleted.title'),
										t(
											'collection.messages.deleted.description'
										)
									);
								})
								.catch(() => {
									showErrorToast(
										t(
											'collection.messages.deletionFailed.title'
										),
										t(
											'collection.messages.deletionFailed.description'
										)
									);
									setErrorMsg(
										t(
											'collection.messages.deletionFailed.description'
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
		if (
			isAnonymous &&
			[
				'index',
				'sku',
				'addFormImages',
				'addFormDetails',
				'editFormImages',
				'editForm',
			].includes(modalStep)
		) {
			showErrorToast(
				'Action non autorisée',
				'Connectez-vous pour ajouter ou modifier des sneakers'
			);
			return;
		}

		switch (modalStep) {
			case 'index':
				setErrorMsg('');
				setModalStep('sku');
				break;
			case 'sku':
				if (isLoading) return;

				if (!sneakerSKU.trim()) {
					setErrorMsg(t('collection.modal.form.errors.sku.required'));
					return;
				}

				if (fetchedSneaker) {
					setModalStep('addFormImages');
					return;
				}

				showInfoToast(
					t('collection.messages.searching.title'),
					t('collection.messages.searching.description')
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
							t('collection.messages.found.title'),
							t('collection.messages.found.description')
						);
					})
					.finally(() => {
						setIsLoading(false);
					});
				break;
			case 'barcode':
				break;
			case 'addFormImages':
				const { sneakerToAdd } = useModalStore.getState();
				if (!sneakerToAdd?.images || sneakerToAdd.images.length === 0) {
					setErrorMsg(
						t('collection.modal.form.errors.images.required')
					);
					return;
				}
				setErrorMsg('');
				setModalStep('addFormDetails');
				break;
			case 'addFormDetails':
				if (isLoading) return;

				if (validateForm) {
					showInfoToast(
						t('collection.messages.adding.title'),
						t('collection.messages.adding.description')
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
									sku,
									useModalStore
										.getState()
										.sneakerToAdd?.images?.find(
											(img) => img.id === ''
										)?.uri
								);
							} else {
								setErrorMsg(result.errorMsg);
							}
						})
						.catch((error) => {
							setErrorMsg(
								t(
									'collection.modal.form.errors.sneaker.error'
								) + error
							);
						})
						.finally(() => setIsLoading(false));
				}
				break;
			case 'editFormImages':
				const { sneakerToAdd: currentSneakerToAdd } =
					useModalStore.getState();
				if (
					!currentSneakerToAdd?.images ||
					currentSneakerToAdd.images.length === 0
				) {
					setErrorMsg(
						t('collection.modal.form.errors.images.required')
					);
					return;
				}
				setErrorMsg('');
				setModalStep('editForm');
				break;
			case 'editForm':
				if (isLoading) return;

				if (validateForm && currentSneaker) {
					showInfoToast(
						t('collection.messages.updating.title'),
						t('collection.messages.updating.description')
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
							setErrorMsg(error.message);
						})
						.finally(() => {
							setIsLoading(false);
						});
				} else {
					if (!validateForm) {
						setErrorMsg(
							t(
								'collection.modal.form.errors.validateForm.missing'
							)
						);
					}
					if (!currentSneaker) {
						setErrorMsg(
							t(
								'collection.modal.form.errors.currentSneaker.missing'
							)
						);
					}
				}
				break;
			case 'view':
				if (nextSneaker) {
					if (isAnonymous) {
						setCurrentSneaker(nextSneaker);
					} else {
						handleNext(nextSneaker, setCurrentSneaker);
					}
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
			case 'barcode':
				setErrorMsg('');
				setModalStep('index');
				break;
			case 'addFormImages':
				resetModalData();
				setModalStep('index');
				break;
			case 'addFormDetails':
				setErrorMsg('');
				setModalStep('addFormImages');
				break;
			case 'editFormImages':
				setErrorMsg('');
				setModalStep('editForm');
				break;
			case 'editForm':
				setErrorMsg('');
				setModalStep('view');
				break;
			case 'view':
				if (prevSneaker) {
					if (isAnonymous) {
						setCurrentSneaker(prevSneaker);
					} else {
						handlePrevious(prevSneaker, setCurrentSneaker);
					}
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
		isLoading,
	};
};
