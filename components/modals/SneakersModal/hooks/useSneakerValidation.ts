import { useState } from 'react';
import { SneakerValidationService } from '@/services/SneakerValidationService';
import { SneakerFormData, ValidationResult } from '../types';

export const useSneakerValidation = () => {
	const [errorMsg, setErrorMsg] = useState('');
	const [isError, setIsError] = useState(false);

	const sneakerValidationService = new SneakerValidationService(
		setErrorMsg,
		setIsError
	);

	const validateSneakerForm = (
		formData: SneakerFormData
	): ValidationResult => {
		const errors: { [key: string]: string } = {};
		let isValid = true;

		// Validation du nom
		if (!formData.model) {
			errors.sneakerName = 'Le nom de la sneaker est requis';
			isValid = false;
		}

		// Validation de la marque
		if (!formData.brand) {
			errors.sneakerBrand = 'La marque est requise';
			isValid = false;
		}

		// Validation de la taille
		if (!formData.size) {
			errors.sneakerSize = 'La taille est requise';
			isValid = false;
		} else if (isNaN(Number(formData.size))) {
			errors.sneakerSize = 'La taille doit être un nombre';
			isValid = false;
		}

		// Validation de l'état
		if (!formData.condition) {
			errors.sneakerCondition = "L'état est requis";
			isValid = false;
		} else if (isNaN(Number(formData.condition))) {
			errors.sneakerCondition = "L'état doit être un nombre";
			isValid = false;
		}

		// Validation du statut
		if (!formData.status) {
			errors.sneakerStatus = 'Le statut est requis';
			isValid = false;
		}

		// Validation du prix
		if (!formData.price_paid) {
			errors.sneakerPricePaid = 'Le prix est requis';
			isValid = false;
		} else if (isNaN(Number(formData.price_paid))) {
			errors.sneakerPricePaid = 'Le prix doit être un nombre';
			isValid = false;
		}

		// Validation de l'image
		if (!formData.images || formData.images.length === 0) {
			errors.sneakerImage = 'Une image est requise';
			isValid = false;
		}

		return {
			isValid,
			errors,
		};
	};

	return {
		errorMsg,
		isError,
		validateSneakerForm,
	};
};
