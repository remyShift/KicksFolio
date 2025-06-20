import { useEffect } from 'react';
import { useModalStore } from '@/store/useModalStore';
import { useFormController } from '@/hooks/useFormController';
import { SneakerFormData } from '../types';

export const useFormValidation = (
	control: any,
	watch: () => any,
	reset: (values: any) => void,
	trigger: () => Promise<boolean>,
	getFieldError: (fieldName: any) => string | undefined
) => {
	const {
		setValidateForm,
		setClearFormErrors,
		setErrorMsg,
		setSneakerToAdd,
	} = useModalStore();

	useEffect(() => {
		const handleValidateAndSubmit = async () => {
			setErrorMsg('');

			const currentSneakerToAdd = useModalStore.getState().sneakerToAdd;
			const currentFormValues = watch();

			if (
				currentSneakerToAdd?.images &&
				currentSneakerToAdd.images.length > 0
			) {
				reset({
					...currentFormValues,
					images: currentSneakerToAdd.images,
				});
			}

			await new Promise((resolve) => setTimeout(resolve, 100));

			const isFormValid = await trigger();

			if (isFormValid) {
				const updatedFormValues = watch();

				if (
					!currentSneakerToAdd?.images ||
					currentSneakerToAdd.images.length === 0
				) {
					return {
						isValid: false,
						errorMsg: 'Please upload at least one image.',
					};
				}

				const finalData = {
					model: updatedFormValues.model || '',
					brand: updatedFormValues.brand || 'Other',
					status: updatedFormValues.status || '',
					size: updatedFormValues.size || '',
					condition: updatedFormValues.condition || '',
					price_paid: updatedFormValues.price_paid || '',
					description: updatedFormValues.description || '',
					images: currentSneakerToAdd.images,
				} as SneakerFormData;

				setSneakerToAdd(finalData);
				return { isValid: true, errorMsg: '', data: finalData };
			} else {
				const firstError =
					getFieldError('model') ||
					getFieldError('brand') ||
					getFieldError('status') ||
					getFieldError('size') ||
					getFieldError('condition') ||
					getFieldError('price_paid') ||
					getFieldError('images') ||
					'Please correct the errors in the form';

				return { isValid: false, errorMsg: firstError };
			}
		};

		const clearFormErrors = () => {
			reset({});
			setErrorMsg('');
		};

		setValidateForm(handleValidateAndSubmit);
		setClearFormErrors(clearFormErrors);

		return () => {
			setValidateForm(null);
			setClearFormErrors(null);
		};
	}, [
		control,
		watch,
		reset,
		trigger,
		getFieldError,
		setValidateForm,
		setClearFormErrors,
		setErrorMsg,
		setSneakerToAdd,
	]);
};
