import { useEffect, useCallback, useRef } from 'react';
import {
	UseFormWatch,
	UseFormReset,
	UseFormTrigger,
	UseFormGetValues,
	Path,
} from 'react-hook-form';
import { useModalStore } from '@/store/useModalStore';
import { SneakerFormData } from '@/validation/sneaker';

export const useFormValidation = (
	watch: UseFormWatch<SneakerFormData>,
	reset: UseFormReset<SneakerFormData>,
	trigger: UseFormTrigger<SneakerFormData>,
	getFieldError: (fieldName: Path<SneakerFormData>) => string | undefined,
	getValues: UseFormGetValues<SneakerFormData>
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
	const getValuesRef = useRef(getValues);

	watchRef.current = watch;
	resetRef.current = reset;
	triggerRef.current = trigger;
	getFieldErrorRef.current = getFieldError;
	getValuesRef.current = getValues;

	const handleValidateAndSubmit = useCallback(async () => {
		setErrorMsg('');

		const currentFormData = getValuesRef.current();
		let isFormValid = false;

		const trigger = triggerRef.current;

		if (!trigger || typeof trigger !== 'function') {
			isFormValid = true;
		} else {
			const result = await trigger();

			if (result === undefined) {
				isFormValid = !!(
					currentFormData?.model &&
					currentFormData?.brand &&
					currentFormData?.status &&
					currentFormData?.size &&
					currentFormData?.images?.length > 0
				);
			} else {
				isFormValid = result === true;
			}
		}

		if (isFormValid) {
			const updatedFormValues = getValuesRef.current();

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
				is_women: updatedFormValues.is_women || false,
				images: updatedFormValues.images,
			} as SneakerFormData;

			setSneakerToAdd(finalData);
			return { isValid: true, errorMsg: '', data: finalData };
		} else {
			const getErrorSafe = (fieldName: Path<SneakerFormData>) => {
				const error = getFieldErrorRef.current(fieldName);
				return typeof error === 'string' ? error : null;
			};

			const firstError =
				getErrorSafe('model') ||
				getErrorSafe('brand') ||
				getErrorSafe('status') ||
				getErrorSafe('size') ||
				getErrorSafe('condition') ||
				getErrorSafe('price_paid') ||
				getErrorSafe('images') ||
				'Please correct the errors in the form';

			const errorMsg =
				typeof firstError === 'string'
					? firstError
					: 'Please correct the errors in the form';
			return { isValid: false, errorMsg };
		}
	}, [setErrorMsg, setSneakerToAdd]);

	const clearFormErrors = useCallback(() => {
		resetRef.current();
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
