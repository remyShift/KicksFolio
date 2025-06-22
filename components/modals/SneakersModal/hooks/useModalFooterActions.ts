import { useModalStore } from '@/store/useModalStore';
import { useSneakerAPI } from './useSneakerAPI';
import { useSession } from '@/context/authContext';
import { Sneaker } from '@/types/Sneaker';
import SupabaseImageService from '@/services/SupabaseImageService';
import { useState } from 'react';
import { Alert } from 'react-native';

export const useModalFooterActions = () => {
	const { user, userCollection } = useSession();
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

	if (!user) {
		throw new Error('User is not authenticated');
	}

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
						.then(async (result) => {
							if (result.isValid && result.data) {
								let sneakerData = { ...result.data };

								const localImages =
									sneakerData.images?.filter((img) =>
										img.url.startsWith('file://')
									) || [];

								const externalApiImages =
									sneakerData.images?.filter(
										(img) =>
											img.url.startsWith('https://') &&
											!img.url.includes('supabase')
									) || [];

								const supabaseImages =
									sneakerData.images?.filter(
										(img) =>
											img.url.includes('supabase') ||
											(!img.url.startsWith('file://') &&
												!img.url.startsWith('https://'))
									) || [];

								const allUploadPromises: Promise<any>[] = [];

								if (localImages.length > 0) {
									allUploadPromises.push(
										SupabaseImageService.uploadSneakerImages(
											localImages,
											user!.id
										)
									);
								}

								if (externalApiImages.length > 0) {
									const migrationPromises =
										externalApiImages.map((img) =>
											SupabaseImageService.migrateImageFromUrl(
												img.url,
												{
													bucket: 'sneakers',
													userId: user!.id,
												}
											)
										);
									allUploadPromises.push(
										Promise.all(migrationPromises)
									);
								}

								if (allUploadPromises.length > 0) {
									const allResults = await Promise.all(
										allUploadPromises
									);

									const localUploadResults =
										localImages.length > 0
											? allResults[0]
											: [];
									const localSuccessfulUploads =
										localUploadResults
											.filter(
												(result: any) =>
													result.success && result.url
											)
											.map((result: any) => result.url);

									const migrationResults =
										externalApiImages.length > 0
											? localImages.length > 0
												? allResults[1]
												: allResults[0]
											: [];
									const migratedSuccessfulUploads =
										migrationResults
											.filter(
												(result: any) =>
													result.success && result.url
											)
											.map((result: any) => result.url);

									const finalImages = [];

									finalImages.push(...supabaseImages);

									finalImages.push(
										...localSuccessfulUploads.map(
											(url: string) => ({ url })
										)
									);

									finalImages.push(
										...migratedSuccessfulUploads.map(
											(url: string) => ({ url })
										)
									);

									sneakerData.images = finalImages;
								}

								handleFormSubmit(
									sneakerData,
									{
										setCurrentSneaker,
										setModalStep,
										setErrorMsg,
									},
									userCollection!.id
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
						.then(async (result) => {
							if (result.isValid && result.data) {
								let sneakerData = { ...result.data };

								// Séparer les différents types d'images
								const localImages =
									sneakerData.images?.filter((img) =>
										img.url.startsWith('file://')
									) || [];

								const externalApiImages =
									sneakerData.images?.filter(
										(img) =>
											img.url.startsWith('https://') &&
											!img.url.includes('supabase')
									) || [];

								const supabaseImages =
									sneakerData.images?.filter(
										(img) =>
											img.url.includes('supabase') ||
											(!img.url.startsWith('file://') &&
												!img.url.startsWith('https://'))
									) || [];

								const allUploadPromises: Promise<any>[] = [];

								// Upload des images locales
								if (localImages.length > 0) {
									allUploadPromises.push(
										SupabaseImageService.uploadSneakerImages(
											localImages,
											user!.id,
											currentSneaker.id
										)
									);
								}

								// Migration des images de l'API externe vers Supabase
								if (externalApiImages.length > 0) {
									const migrationPromises =
										externalApiImages.map((img) =>
											SupabaseImageService.migrateImageFromUrl(
												img.url,
												{
													bucket: 'sneakers',
													userId: user!.id,
													entityId: currentSneaker.id,
												}
											)
										);
									allUploadPromises.push(
										Promise.all(migrationPromises)
									);
								}

								if (allUploadPromises.length > 0) {
									const allResults = await Promise.all(
										allUploadPromises
									);

									// Traiter les résultats des uploads locaux
									const localUploadResults =
										localImages.length > 0
											? allResults[0]
											: [];
									const localSuccessfulUploads =
										localUploadResults
											.filter(
												(result: any) =>
													result.success && result.url
											)
											.map((result: any) => ({
												url: result.url,
											}));

									// Traiter les résultats des migrations d'API
									const migrationResults =
										externalApiImages.length > 0
											? localImages.length > 0
												? allResults[1]
												: allResults[0]
											: [];
									const migratedSuccessfulUploads =
										migrationResults
											.filter(
												(result: any) =>
													result.success && result.url
											)
											.map((result: any) => ({
												url: result.url,
											}));

									// Combiner toutes les images
									sneakerData.images = [
										...supabaseImages,
										...localSuccessfulUploads,
										...migratedSuccessfulUploads,
									];
								}

								handleFormUpdate(
									currentSneaker.id,
									sneakerData,
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
