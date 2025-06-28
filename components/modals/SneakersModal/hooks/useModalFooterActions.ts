import { useModalStore } from '@/store/useModalStore';
import { useSneakerAPI } from './useSneakerAPI';
import { useSession } from '@/context/authContext';
import { Sneaker } from '@/types/Sneaker';
import { useState } from 'react';
import { Alert } from 'react-native';
import { SneakerFormData } from '@/validation/schemas';
import useToast from '@/hooks/useToast';

export const useModalFooterActions = () => {
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
		fetchedSneaker,
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
				'Are you sure you want to delete this sneaker?',
				'This action cannot be undone.',
				[
					{
						text: 'Cancel',
						style: 'cancel',
					},
					{
						text: 'Delete',
						style: 'destructive',
						onPress: () => {
							showInfoToast(
								'🔍 Deleting your sneaker...',
								'Please wait...'
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
										'🗑️ Sneaker deleted',
										'The sneaker has been deleted successfully.'
									);
								})
								.catch(() => {
									showErrorToast(
										'❌ Sneaker deletion failed',
										'An error occurred while deleting the sneaker.'
									);
									setErrorMsg(
										'An error occurred while deleting the sneaker.'
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
					setErrorMsg('Please enter a SKU.');
					return;
				}
				showInfoToast(
					'🔍 Searching for your sneaker...',
					'Please wait...'
				);
				setErrorMsg('');
				setIsLoading(true);
				handleSkuSearch(sneakerSKU, {
					setFetchedSneaker,
					setModalStep,
					setErrorMsg,
				}).finally(() => setIsLoading(false));
				break;
			case 'addForm':
				if (isLoading) return;

				if (validateForm) {
					showInfoToast(
						'🔍 Adding sneaker to your collection...',
						'Please wait...'
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
								'An error occurred while validating the sneaker : ' +
									error
							);
						})
						.finally(() => setIsLoading(false));
				}
				break;
			case 'editForm':
				if (isLoading) return;

				if (validateForm && currentSneaker) {
					showInfoToast(
						'🔍 Updating your sneaker...',
						'Please wait...'
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
								'An error occurred while validating the sneaker : ' +
									error
							);
						})
						.finally(() => setIsLoading(false));
				} else {
					if (!validateForm) setErrorMsg('validateForm is missing');
					if (!currentSneaker)
						setErrorMsg('currentSneaker is missing');
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
