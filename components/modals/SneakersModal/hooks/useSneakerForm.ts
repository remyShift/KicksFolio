import { useState } from 'react';
import { InputType } from '../types';
import { SneakerValidationService } from '@/services/SneakerValidationService';

export const useSneakerForm = () => {
    // Form states
    const [sneakerName, setSneakerName] = useState('');
    const [sneakerBrand, setSneakerBrand] = useState('');
    const [sneakerStatus, setSneakerStatus] = useState('');
    const [sneakerSize, setSneakerSize] = useState('');
    const [sneakerCondition, setSneakerCondition] = useState('');
    const [sneakerImage, setSneakerImage] = useState('');
    const [sneakerPricePaid, setSneakerPricePaid] = useState('');
    const [sneakerDescription, setSneakerDescription] = useState('');
    const [sneakerSKU, setSneakerSKU] = useState('');

    // Error states
    const [errorMsg, setErrorMsg] = useState('');
    const [isSneakerNameError, setIsSneakerNameError] = useState(false);
    const [isSneakerBrandError, setIsSneakerBrandError] = useState(false);
    const [isSneakerStatusError, setIsSneakerStatusError] = useState(false);
    const [isSneakerSizeError, setIsSneakerSizeError] = useState(false);
    const [isSneakerConditionError, setIsSneakerConditionError] = useState(false);
    const [isPricePaidError, setIsPricePaidError] = useState(false);
    const [isSneakerImageError, setIsSneakerImageError] = useState(false);
    const [isSneakerSKUError, setIsSneakerSKUError] = useState(false);

    // Focus states
    const [isSneakerNameFocused, setIsSneakerNameFocused] = useState(false);
    const [isSneakerBrandFocused, setIsSneakerBrandFocused] = useState(false);
    const [isSneakerStatusFocused, setIsSneakerStatusFocused] = useState(false);
    const [isSneakerSizeFocused, setIsSneakerSizeFocused] = useState(false);
    const [isSneakerConditionFocused, setIsSneakerConditionFocused] = useState(false);
    const [isPricePaidFocused, setIsPricePaidFocused] = useState(false);
    const [isSneakerImageFocused, setIsSneakerImageFocused] = useState(false);
    const [isSneakerSKUFocused, setIsSneakerSKUFocused] = useState(false);

    const validationService = new SneakerValidationService(setErrorMsg, () => {});

    const handleInputFocus = (inputType: InputType) => {
        switch(inputType) {
            case 'name':
                setIsSneakerNameFocused(true);
                break;
            case 'brand':
                setIsSneakerBrandFocused(true);
                break;
            case 'size':
                setIsSneakerSizeFocused(true);
                break;
            case 'condition':
                setIsSneakerConditionFocused(true);
                break;
            case 'status':
                setIsSneakerStatusFocused(true);
                break;
            case 'pricePaid':
                setIsPricePaidFocused(true);
                break;
            case 'sku':
                setIsSneakerSKUFocused(true);
                break;
        }
        resetErrors();
    };

    const handleInputBlur = (inputType: InputType, value: string) => {
        resetErrors();
        switch(inputType) {
            case 'name':
                setIsSneakerNameFocused(false);
                if (!validationService.validateName(value)) {
                    setIsSneakerNameError(true);
                }
                break;
            case 'brand':
                setIsSneakerBrandFocused(false);
                if (!validationService.validateBrand(value)) {
                    setIsSneakerBrandError(true);
                }
                break;
            case 'size':
                setIsSneakerSizeFocused(false);
                if (!validationService.validateSize(value)) {
                    setIsSneakerSizeError(true);
                }
                break;
            case 'condition':
                setIsSneakerConditionFocused(false);
                if (!validationService.validateCondition(value)) {
                    setIsSneakerConditionError(true);
                }
                break;
            case 'status':
                setIsSneakerStatusFocused(false);
                if (!validationService.validateStatus(value)) {
                    setIsSneakerStatusError(true);
                }
                break;
            case 'pricePaid':
                setIsPricePaidFocused(false);
                if (!validationService.validatePrice(value)) {
                    setIsPricePaidError(true);
                }
                break;
            case 'sku':
                setIsSneakerSKUFocused(false);
                if (!value) {
                    setErrorMsg('Please enter a SKU');
                    setIsSneakerSKUError(true);
                }
                break;
        }
    };

    const resetErrors = () => {
        setErrorMsg('');
        setIsSneakerNameError(false);
        setIsSneakerBrandError(false);
        setIsSneakerStatusError(false);
        setIsSneakerSizeError(false);
        setIsSneakerConditionError(false);
        setIsPricePaidError(false);
        setIsSneakerImageError(false);
        setIsSneakerSKUError(false);
    };

    const resetForm = () => {
        setSneakerName('');
        setSneakerBrand('');
        setSneakerStatus('');
        setSneakerSize('');
        setSneakerCondition('');
        setSneakerImage('');
        setSneakerPricePaid('');
        setSneakerDescription('');
        setSneakerSKU('');
        resetErrors();
    };

    return {
        // Form values
        sneakerName,
        setSneakerName,
        sneakerBrand,
        setSneakerBrand,
        sneakerStatus,
        setSneakerStatus,
        sneakerSize,
        setSneakerSize,
        sneakerCondition,
        setSneakerCondition,
        sneakerImage,
        setSneakerImage,
        sneakerPricePaid,
        setSneakerPricePaid,
        sneakerDescription,
        setSneakerDescription,
        sneakerSKU,
        setSneakerSKU,

        // Error states
        errorMsg,
        setErrorMsg,
        isSneakerNameError,
        setIsSneakerNameError,
        isSneakerBrandError,
        setIsSneakerBrandError,
        isSneakerStatusError,
        setIsSneakerStatusError,
        isSneakerSizeError,
        setIsSneakerSizeError,
        isSneakerConditionError,
        setIsSneakerConditionError,
        isPricePaidError,
        setIsPricePaidError,
        isSneakerImageError,
        setIsSneakerImageError,
        isSneakerSKUError,
        setIsSneakerSKUError,

        // Focus states
        isSneakerNameFocused,
        setIsSneakerNameFocused,
        isSneakerBrandFocused,
        setIsSneakerBrandFocused,
        isSneakerStatusFocused,
        setIsSneakerStatusFocused,
        isSneakerSizeFocused,
        setIsSneakerSizeFocused,
        isSneakerConditionFocused,
        setIsSneakerConditionFocused,
        isPricePaidFocused,
        setIsPricePaidFocused,
        isSneakerImageFocused,
        setIsSneakerImageFocused,
        isSneakerSKUFocused,
        setIsSneakerSKUFocused,

        // Handlers
        handleInputFocus,
        handleInputBlur,
        resetForm,
    };
};
