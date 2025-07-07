import { useEffect, useCallback, useRef } from 'react';
import {
	useBugReportStore,
	BugReportFormData,
} from '@/store/useBugReportStore';

export const useBugReportValidation = (
	control: any,
	watch: () => any,
	reset: (values: any) => void,
	trigger: () => Promise<boolean>,
	getFieldError: (fieldName: any) => string | undefined
) => {
	const { setValidateForm, setClearFormErrors, setErrorMsg, updateFormData } =
		useBugReportStore();

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

			const finalData: BugReportFormData = {
				title: updatedFormValues.title || '',
				description: updatedFormValues.description || '',
				stepsToReproduce: updatedFormValues.stepsToReproduce || '',
				expectedBehavior: updatedFormValues.expectedBehavior || '',
				actualBehavior: updatedFormValues.actualBehavior || '',
				deviceInfo: '',
				priority: updatedFormValues.priority || 'medium',
			};

			updateFormData(finalData);
			return { isValid: true, errorMsg: '', data: finalData };
		} else {
			const firstError =
				getFieldErrorRef.current('title') ||
				getFieldErrorRef.current('description') ||
				getFieldErrorRef.current('stepsToReproduce') ||
				getFieldErrorRef.current('expectedBehavior') ||
				getFieldErrorRef.current('actualBehavior') ||
				getFieldErrorRef.current('priority') ||
				'Please correct the errors in the form';

			return { isValid: false, errorMsg: firstError };
		}
	}, [setErrorMsg, updateFormData]);

	const clearFormErrors = useCallback(() => {
		resetRef.current({
			title: '',
			description: '',
			stepsToReproduce: '',
			expectedBehavior: '',
			actualBehavior: '',
			priority: 'medium',
		});
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
