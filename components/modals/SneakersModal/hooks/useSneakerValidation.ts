import { useState } from 'react';
import { SneakerValidationService } from '@/services/SneakerValidationService';
import { SneakerFormData } from '../types';

export const useSneakerValidation = () => {
    const [errorMsg, setErrorMsg] = useState('');
    const [isError, setIsError] = useState(false);

    const sneakerValidationService = new SneakerValidationService(setErrorMsg, setIsError);

    const validateSneakerForm = (formData: SneakerFormData) => {
        return sneakerValidationService.validateAllFields(
            {
                name: formData.model,
                brand: formData.brand,
                size: formData.size.toString(),
                condition: formData.condition.toString(),
                status: formData.status,
                price: formData.price_paid.toString(),
                image: formData.image
            },
            {
                setNameError: () => {},
                setBrandError: () => {},
                setSizeError: () => {},
                setConditionError: () => {},
                setStatusError: () => {},
                setImageError: () => {}
            }
        );
    };

    return {
        errorMsg,
        isError,
        validateSneakerForm
    };
};
