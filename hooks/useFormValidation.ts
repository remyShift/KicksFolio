import { useState } from 'react';
import { FormValidationService } from '@/services/FormValidationService';
import { FieldName } from '@/services/FormService';

interface FieldValidation {
	value: string | number;
	fieldType: FieldName;
	isRequired?: boolean;
	customValidation?: string;
	isLoginPage?: boolean;
}

interface ErrorSetters {
	[key: string]: (isError: boolean) => void;
}

interface UseFormValidationProps {
	errorSetters: ErrorSetters;
}

export const useFormValidation = ({ errorSetters }: UseFormValidationProps) => {
	const [globalErrorMsg, setGlobalErrorMsg] = useState('');
	const [capturedErrorMsg, setCapturedErrorMsg] = useState('');

	// Service de validation avec capture du message d'erreur
	const formValidation = new FormValidationService(
		setCapturedErrorMsg,
		errorSetters
	);

	const validateForm = async (
		fields: FieldValidation[]
	): Promise<{ isValid: boolean; errorMsg: string }> => {
		let hasErrors = false;
		const errorFields: string[] = [];
		let singleFieldErrorMsg = '';

		Object.values(errorSetters).forEach((setter) => setter(false));
		setGlobalErrorMsg('');
		setCapturedErrorMsg('');

		for (const field of fields) {
			if (field.isRequired && (!field.value || field.value === '')) {
				hasErrors = true;
				errorFields.push(field.fieldType);
				if (errorSetters[field.fieldType]) {
					errorSetters[field.fieldType](true);
				}
				// Pour un champ vide requis, on utilise un message générique
				if (errorFields.length === 1) {
					singleFieldErrorMsg = `Please enter your ${field.fieldType.toLowerCase()}`;
				}
			} else if (field.value && field.value !== '') {
				// Reset le message capturé avant la validation
				setCapturedErrorMsg('');
				const isValid = await formValidation.validateField(
					field.value.toString(),
					field.fieldType,
					field.isLoginPage || false,
					null,
					field.customValidation
				);
				if (!isValid) {
					hasErrors = true;
					errorFields.push(field.fieldType);
					// Pour un champ avec valeur invalide, on utilise le message du service
					if (errorFields.length === 1) {
						singleFieldErrorMsg =
							capturedErrorMsg ||
							`Please correct your ${field.fieldType.toLowerCase()}`;
					}
				}
			}
		}

		if (hasErrors) {
			const errorMessage =
				errorFields.length === 1
					? singleFieldErrorMsg
					: 'Please correct the fields in red before continuing';

			setGlobalErrorMsg(errorMessage);
			return { isValid: false, errorMsg: errorMessage };
		}

		return { isValid: true, errorMsg: '' };
	};

	const clearErrors = () => {
		Object.values(errorSetters).forEach((setter) => setter(false));
		setGlobalErrorMsg('');
	};

	return {
		validateForm,
		clearErrors,
		globalErrorMsg,
		formValidation,
	};
};
