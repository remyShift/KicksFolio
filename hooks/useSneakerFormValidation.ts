import { useState } from 'react';
import { SneakerValidationService } from '@/services/SneakerValidationService';

interface SneakerFieldValidation {
	value: string;
	fieldType: string;
	isRequired?: boolean;
}

interface ErrorSetters {
	[key: string]: (isError: boolean) => void;
}

interface UseSneakerFormValidationProps {
	errorSetters: ErrorSetters;
}

export const useSneakerFormValidation = ({
	errorSetters,
}: UseSneakerFormValidationProps) => {
	const [globalErrorMsg, setGlobalErrorMsg] = useState('');
	const sneakerValidationService = new SneakerValidationService();

	const validateSneakerForm = async (
		fields: SneakerFieldValidation[]
	): Promise<{ isValid: boolean; errorMsg: string }> => {
		let hasErrors = false;
		const errorFields: string[] = [];
		let singleFieldErrorMsg = '';

		// Reset tous les états d'erreur d'abord
		Object.values(errorSetters).forEach((setter) => setter(false));
		setGlobalErrorMsg('');

		// Valider chaque champ
		for (const field of fields) {
			if (field.isRequired && (!field.value || field.value === '')) {
				hasErrors = true;
				errorFields.push(field.fieldType);
				if (errorSetters[field.fieldType]) {
					errorSetters[field.fieldType](true);
				}
				// Pour un champ vide requis, on utilise un message générique
				if (errorFields.length === 1) {
					singleFieldErrorMsg = `Please enter a value for ${field.fieldType
						.replace('sneaker', '')
						.toLowerCase()}`;
				}
			} else if (field.value && field.value !== '') {
				const result = sneakerValidationService.validateField(
					field.fieldType,
					field.value
				);
				if (!result.isValid) {
					hasErrors = true;
					errorFields.push(field.fieldType);
					if (errorSetters[field.fieldType]) {
						errorSetters[field.fieldType](true);
					}
					// Pour un champ avec valeur invalide, on utilise le message du service
					if (errorFields.length === 1) {
						singleFieldErrorMsg = result.errorMsg;
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
		validateSneakerForm,
		clearErrors,
		globalErrorMsg,
		sneakerValidationService,
	};
};
