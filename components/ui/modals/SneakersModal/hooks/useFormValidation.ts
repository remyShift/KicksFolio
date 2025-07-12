import { useEffect, useCallback, useRef } from 'react';
import { useModalStore } from '@/store/useModalStore';
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

	const watchRef = useRef(watch);
	const resetRef = useRef(reset);
	const triggerRef = useRef(trigger);
	const getFieldErrorRef = useRef(getFieldError);

	watchRef.current = watch;
	resetRef.current = reset;
	triggerRef.current = trigger;
	getFieldErrorRef.current = getFieldError;

	const handleValidateAndSubmit = useCallback(async () => {
		setErrorMsg('');

		const isFormValid = await triggerRef.current();

		if (isFormValid) {
			const updatedFormValues = watchRef.current();

			if (
				!updatedFormValues.images ||
				updatedFormValues.images.length === 0
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
				og_box: updatedFormValues.og_box || false,
				ds: updatedFormValues.ds || false,
				images: updatedFormValues.images,
			} as SneakerFormData;

			setSneakerToAdd(finalData);
			return { isValid: true, errorMsg: '', data: finalData };
		} else {
			const firstError =
				getFieldErrorRef.current('model') ||
				getFieldErrorRef.current('brand') ||
				getFieldErrorRef.current('status') ||
				getFieldErrorRef.current('size') ||
				getFieldErrorRef.current('condition') ||
				getFieldErrorRef.current('price_paid') ||
				getFieldErrorRef.current('images') ||
				'Please correct the errors in the form';

			return { isValid: false, errorMsg: firstError };
		}
	}, [setErrorMsg, setSneakerToAdd]);

	const clearFormErrors = useCallback(() => {
		resetRef.current({});
		setErrorMsg('');
	}, [setErrorMsg]);

	useEffect(() => {
		setValidateForm(handleValidateAndSubmit);
		setClearFormErrors(clearFormErrors);

		return () => {
			setValidateForm(null);
			setClearFormErrors(null);
		};
	}, [
		handleValidateAndSubmit,
		clearFormErrors,
		setValidateForm,
		setClearFormErrors,
	]);
};
