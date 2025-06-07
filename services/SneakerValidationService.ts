type ValidStatus = 'rocking' | 'stocking' | 'selling';

export class SneakerValidationService {
	public validateField(
		field: string,
		value: string
	): { isValid: boolean; errorMsg: string } {
		switch (field) {
			case 'sneakerName':
				return this.validateName(value);
			case 'sneakerBrand':
				return this.validateBrand(value);
			case 'sneakerStatus':
				return this.validateStatus(value);
			case 'sneakerSize':
				return this.validateSize(value);
			case 'sneakerCondition':
				return this.validateCondition(value);
			case 'sneakerPrice':
				return this.validatePrice(value);
			case 'sneakerImage':
				return this.validateImage(value);
			default:
				return { isValid: true, errorMsg: '' };
		}
	}

	public validateName(name: string): { isValid: boolean; errorMsg: string } {
		if (!name) {
			return { isValid: false, errorMsg: 'Please enter a sneaker name.' };
		}
		return { isValid: true, errorMsg: '' };
	}

	public validateBrand(brand: string): {
		isValid: boolean;
		errorMsg: string;
	} {
		if (!brand) {
			return { isValid: false, errorMsg: 'Please select a brand.' };
		}

		const brandRegex = /^[a-zA-Z\s]+$/;
		if (!brandRegex.test(brand)) {
			return {
				isValid: false,
				errorMsg:
					'Brand invalid, brand must contain only letters and spaces.',
			};
		}

		return { isValid: true, errorMsg: '' };
	}

	public validateSize(size: string): { isValid: boolean; errorMsg: string } {
		if (!size || isNaN(parseFloat(size))) {
			return { isValid: false, errorMsg: 'Please enter a size.' };
		}

		const sizeNum = parseFloat(size);
		if (isNaN(sizeNum) || sizeNum < 7 || sizeNum > 16) {
			return {
				isValid: false,
				errorMsg: 'Size invalid, size must be between 7 and 16.',
			};
		}

		if (sizeNum % 0.5 !== 0) {
			return {
				isValid: false,
				errorMsg: 'Size invalid, size must be a multiple of 0.5.',
			};
		}

		return { isValid: true, errorMsg: '' };
	}

	public validateCondition(condition: string): {
		isValid: boolean;
		errorMsg: string;
	} {
		if (!condition) {
			return { isValid: false, errorMsg: 'Please enter a condition.' };
		}

		const conditionNum = Number(condition);
		if (isNaN(conditionNum) || conditionNum < 0 || conditionNum > 10) {
			return {
				isValid: false,
				errorMsg:
					'Condition invalid, condition must be between 0 and 10.',
			};
		}

		if (conditionNum % 0.5 !== 0) {
			return {
				isValid: false,
				errorMsg:
					'Condition invalid, condition must be a multiple of 0.5.',
			};
		}

		return { isValid: true, errorMsg: '' };
	}

	public validateStatus(status: string): {
		isValid: boolean;
		errorMsg: string;
	} {
		const validStatuses: ValidStatus[] = ['rocking', 'stocking', 'selling'];

		if (!status) {
			return {
				isValid: false,
				errorMsg:
					'Status invalid, status must be one of the following: rocking, stocking, selling.',
			};
		}

		const statusRegex = /^[a-zA-Z\s]+$/;
		if (!statusRegex.test(status)) {
			return {
				isValid: false,
				errorMsg: 'Status invalid, status must contain only letters.',
			};
		}

		if (!validStatuses.includes(status.toLowerCase() as ValidStatus)) {
			return {
				isValid: false,
				errorMsg:
					'Status invalid, status must be one of the following: rocking, stocking, selling.',
			};
		}

		return { isValid: true, errorMsg: '' };
	}

	public validatePrice(price: string): {
		isValid: boolean;
		errorMsg: string;
	} {
		if (!price) {
			return { isValid: false, errorMsg: 'Veuillez entrer un prix.' };
		}

		if (isNaN(Number(price)) || Number(price) < 0) {
			return {
				isValid: false,
				errorMsg: 'Le prix doit être un nombre positif.',
			};
		}

		return { isValid: true, errorMsg: '' };
	}

	public validateImage(image: string): {
		isValid: boolean;
		errorMsg: string;
	} {
		if (!image) {
			return { isValid: false, errorMsg: 'Please select an image.' };
		}

		return { isValid: true, errorMsg: '' };
	}

	public validateAllFields(sneakerData: {
		name: string;
		brand: string;
		size: string;
		condition: string;
		status: string;
		price: string;
		image: string;
	}): { isValid: boolean; errors: { [key: string]: string } } {
		const validations = [
			{ field: 'sneakerImage', value: sneakerData.image },
			{ field: 'sneakerName', value: sneakerData.name },
			{ field: 'sneakerBrand', value: sneakerData.brand },
			{ field: 'sneakerStatus', value: sneakerData.status },
			{ field: 'sneakerSize', value: sneakerData.size },
			{ field: 'sneakerCondition', value: sneakerData.condition },
			{ field: 'sneakerPrice', value: sneakerData.price },
		];

		const errors: { [key: string]: string } = {};
		let isValid = true;

		validations.forEach(({ field, value }) => {
			const result = this.validateField(field, value);
			if (!result.isValid) {
				errors[field] = result.errorMsg;
				isValid = false;
			}
		});

		return { isValid, errors };
	}
}
