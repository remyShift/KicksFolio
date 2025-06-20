import { useModalStore } from '@/store/useModalStore';
import { useSneakerAPI } from './useSneakerAPI';
import { useSession } from '@/context/authContext';
import { Sneaker } from '@/types/Sneaker';
import { useState } from 'react';
import { Alert } from 'react-native';

export const useModalFooterActions = () => {
	const { user } = useSession();
	const [nextSneaker, setNextSneaker] = useState<Sneaker | null>(null);
	const [prevSneaker, setPrevSneaker] = useState<Sneaker | null>(null);

	const {
		modalStep,
		sneakerSKU,
		setModalStep,
		setErrorMsg,
		setFetchedSneaker,
		validateForm,
		resetModalData,
		setCurrentSneaker,
		setIsVisible,
		currentSneaker,
	} = useModalStore();
	const {
		handleSkuSearch,
		handleFormSubmit,
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
							handleSneakerDelete(currentSneaker.id)
								.then(() => {
									resetModalData();
									setModalStep('index');
									setIsVisible(false);
									setCurrentSneaker(null);
								})
								.catch(() => {
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
				if (!sneakerSKU.trim()) {
					setErrorMsg('Please enter a SKU.');
					return;
				}
				setErrorMsg('');
				handleSkuSearch(sneakerSKU, {
					setFetchedSneaker,
					setModalStep,
					setErrorMsg,
				});
				break;
			case 'addForm':
				if (validateForm) {
					validateForm()
						.then((result) => {
							if (result.isValid && result.data) {
								handleFormSubmit(
									{
										model: result.data.model,
										brand: result.data.brand,
										status: result.data.status,
										size: result.data.size,
										condition: result.data.condition,
										images:
											result.data.images &&
											result.data.images.length > 0
												? [
														{
															url:
																result.data
																	.images[0]
																	?.url || '',
														},
												  ]
												: [],
										price_paid:
											result.data?.price_paid || '',
										description:
											result.data?.description || '',
									},
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
						});
				}
				break;
			case 'editForm':
				if (validateForm && currentSneaker) {
					validateForm()
						.then((result) => {
							if (result.isValid && result.data) {
								handleFormUpdate(
									currentSneaker.id,
									{
										model: result.data.model,
										brand: result.data.brand,
										status: result.data.status,
										size: result.data.size,
										condition: result.data.condition,
										images:
											result.data.images &&
											result.data.images.length > 0
												? [
														{
															url:
																result.data
																	.images[0]
																	?.url || '',
														},
												  ]
												: [],
										price_paid:
											result.data?.price_paid || '',
										description:
											result.data?.description || '',
									},
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
						});
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
	};
};
