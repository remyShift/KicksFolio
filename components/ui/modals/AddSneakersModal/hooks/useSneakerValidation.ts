import { InputType, ValidationError } from '../types';
import { ERROR_MESSAGES } from '../constants';

export const useSneakerValidation = () => {
    const validateField = (type: InputType, value: string): ValidationError | null => {
        switch (type) {
            case 'name':
                return !value ? { field: 'name', message: ERROR_MESSAGES.REQUIRED_FIELD } : null;
            
            case 'brand':
                return !value ? { field: 'brand', message: ERROR_MESSAGES.REQUIRED_FIELD } : null;
            
            case 'size':
                const size = parseFloat(value);
                return !value || isNaN(size) || size < 1 || size > 20
                    ? { field: 'size', message: ERROR_MESSAGES.INVALID_SIZE }
                    : null;
            
            case 'condition':
                const condition = parseFloat(value);
                return !value || isNaN(condition) || condition < 0 || condition > 10
                    ? { field: 'condition', message: ERROR_MESSAGES.INVALID_CONDITION }
                    : null;
            
            case 'status':
                return !value ? { field: 'status', message: ERROR_MESSAGES.REQUIRED_FIELD } : null;
            
            case 'pricePaid':
                const price = parseFloat(value);
                return !value || isNaN(price) || price < 0
                    ? { field: 'pricePaid', message: ERROR_MESSAGES.INVALID_PRICE }
                    : null;
            
            case 'sku':
                return !value ? { field: 'sku', message: ERROR_MESSAGES.INVALID_SKU } : null;
            
            default:
                return null;
        }
    };

    const validateAllFields = (
        name: string,
        brand: string,
        size: string,
        condition: string,
        status: string,
        image: string,
        setErrorMsg: (msg: string) => void,
        setIsNameError: (isError: boolean) => void,
        setIsBrandError: (isError: boolean) => void,
        setIsSizeError: (isError: boolean) => void,
        setIsConditionError: (isError: boolean) => void,
        setIsStatusError: (isError: boolean) => void,
        setIsImageError: (isError: boolean) => void,
    ): boolean => {
        const errors: ValidationError[] = [];

        const nameError = validateField('name', name);
        if (nameError) {
            errors.push(nameError);
            setIsNameError(true);
        }

        const brandError = validateField('brand', brand);
        if (brandError) {
            errors.push(brandError);
            setIsBrandError(true);
        }

        const sizeError = validateField('size', size);
        if (sizeError) {
            errors.push(sizeError);
            setIsSizeError(true);
        }

        const conditionError = validateField('condition', condition);
        if (conditionError) {
            errors.push(conditionError);
            setIsConditionError(true);
        }

        const statusError = validateField('status', status);
        if (statusError) {
            errors.push(statusError);
            setIsStatusError(true);
        }

        if (!image) {
            errors.push({ field: 'name', message: ERROR_MESSAGES.INVALID_IMAGE });
            setIsImageError(true);
        }

        if (errors.length > 0) {
            setErrorMsg(errors[0].message);
            return false;
        }

        return true;
    };

    return {
        validateField,
        validateAllFields,
    };
};
