import { useState } from 'react';
import { SneakerValidationService } from '@/services/SneakerValidationService';

export const useSneakerFieldValidation = () => {
    const [errorMsg, setErrorMsg] = useState('');
    const [isError, setIsError] = useState(false);

    const validationService = new SneakerValidationService(setErrorMsg, setIsError);

    const validateName = (name: string) => {
        return validationService.validateName(name);
    };

    const validateBrand = (brand: string) => {
        return validationService.validateBrand(brand);
    };

    const validateSize = (size: string) => {
        return validationService.validateSize(size);
    };

    const validateCondition = (condition: string) => {
        return validationService.validateCondition(condition);
    };

    const validateStatus = (status: string) => {
        return validationService.validateStatus(status);
    };

    const validatePrice = (price: string) => {
        return validationService.validatePrice(price);
    };

    const validateImage = (image: string) => {
        return validationService.validateImage(image);
    };

    const clearErrors = () => {
        setErrorMsg('');
        setIsError(false);
    };

    return {
        errorMsg,
        isError,
        validateName,
        validateBrand,
        validateSize,
        validateCondition,
        validateStatus,
        validatePrice,
        validateImage,
        clearErrors
    };
}; 