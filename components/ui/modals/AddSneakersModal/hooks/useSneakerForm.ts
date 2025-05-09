import { useState } from 'react';
import { InputType } from '../types';
import { useSneakerValidation } from './useSneakerValidation';

export const useSneakerForm = () => {
    const { validateField } = useSneakerValidation();

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
                const nameError = validateField('name', value);
                if (nameError) {
                    setErrorMsg(nameError.message);
                    setIsSneakerNameError(true);
                }
                break;
            case 'brand':
                setIsSneakerBrandFocused(false);
                const brandError = validateField('brand', value);
                if (brandError) {
                    setErrorMsg(brandError.message);
                    setIsSneakerBrandError(true);
                }
                break;
            case 'size':
                setIsSneakerSizeFocused(false);
                const sizeError = validateField('size', value);
                if (sizeError) {
                    setErrorMsg(sizeError.message);
                    setIsSneakerSizeError(true);
                }
                break;
            case 'condition':
                setIsSneakerConditionFocused(false);
                const conditionError = validateField('condition', value);
                if (conditionError) {
                    setErrorMsg(conditionError.message);
                    setIsSneakerConditionError(true);
                }
                break;
            case 'status':
                setIsSneakerStatusFocused(false);
                const statusError = validateField('status', value);
                if (statusError) {
                    setErrorMsg(statusError.message);
                    setIsSneakerStatusError(true);
                }
                break;
            case 'pricePaid':
                setIsPricePaidFocused(false);
                const priceError = validateField('pricePaid', value);
                if (priceError) {
                    setErrorMsg(priceError.message);
                    setIsPricePaidError(true);
                }
                break;
            case 'sku':
                setIsSneakerSKUFocused(false);
                const skuError = validateField('sku', value);
                if (skuError) {
                    setErrorMsg(skuError.message);
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
