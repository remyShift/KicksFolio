export const checkSneakerName = (name: string, setErrorMsg: (msg: string) => void, setIsError: (isError: boolean) => void): boolean => {
    if (!name) {
        setErrorMsg('Please enter a sneaker name.');
        setIsError(true);
        return false;
    }

    setErrorMsg('');
    setIsError(false);
    return true;
};

export const checkSneakerBrand = (value: string, setErrorMsg: (msg: string) => void, setIsError: (isError: boolean) => void): boolean => {
    if (!value) {
        setErrorMsg('Please select a brand.');
        setIsError(true);
        return false;
    }
    
    const brandRegex = /^[a-zA-Z\s]+$/;

    if (!brandRegex.test(value)) {
        setErrorMsg('Brand invalid, brand must contain only letters and spaces.');
        setIsError(true);
        return false;
    }
    
    setErrorMsg('');
    setIsError(false);
    return true;
};

export const checkSneakerSize = (size: string, setErrorMsg: (msg: string) => void, setIsError: (isError: boolean) => void): boolean => {
    if (!size || isNaN(parseFloat(size))) {
        setErrorMsg('Please enter a size.');
        setIsError(true);
        return false;
    }

    const sizeNum = parseFloat(size);
    if (isNaN(sizeNum) || sizeNum < 7 || sizeNum > 16) {
        setErrorMsg('Size invalid, size must be between 7 and 16.');
        setIsError(true);
        return false;
    }

    if (sizeNum % 0.5 !== 0) {
        setErrorMsg('Size invalid, size must be a multiple of 0.5.');
        setIsError(true);
        return false;
    }

    setErrorMsg('');
    setIsError(false);
    return true;
};

export const checkSneakerCondition = (condition: string, setErrorMsg: (msg: string) => void, setIsError: (isError: boolean) => void): boolean => {
    
    if (!condition) {
        setErrorMsg('Please enter a condition.');
        setIsError(true);
        return false;
    }

    const conditionNum = Number(condition);
    if (isNaN(conditionNum) || conditionNum < 0 || conditionNum > 10) {
        setErrorMsg('Condition invalid, condition must be between 0 and 10.');
        setIsError(true);
        return false;
    }

    if (conditionNum % 0.5 !== 0) {
        setErrorMsg('Condition invalid, condition must be a multiple of 0.5.');
        setIsError(true);
        return false;
    }

    setErrorMsg('');
    setIsError(false);
    return true;
};

export const checkSneakerStatus = (status: string, setErrorMsg: (msg: string) => void, setIsError: (isError: boolean) => void): boolean => {
    const validStatuses = ['rocking', 'stocking', 'selling'];

    if (!status) {
        setErrorMsg('Status invalid, status must be one of the following: rocking, stocking, selling.');
        setIsError(true);
        return false;
    }

    const statusRegex = /^[a-zA-Z\s]+$/;

    if (!statusRegex.test(status)) {
        setErrorMsg('Status invalid, status must contain only letters.');
        setIsError(true);
        return false;
    }

    if (!validStatuses.includes(status.toLowerCase())) {
        setErrorMsg('Status invalid, status must be one of the following: rocking, stocking, selling.');
        setIsError(true);
        return false;
    }

    setErrorMsg('');
    setIsError(false);
    return true;
};

export const checkPricePaid = (pricePaid: string, setErrorMsg: (msg: string) => void, setIsError: (isError: boolean) => void): boolean => {
    if (!pricePaid) {
        setErrorMsg('Veuillez entrer un prix.');
        setIsError(true);
        return false;
    }

    if (isNaN(Number(pricePaid)) || Number(pricePaid) < 0) {
        setErrorMsg('Le prix doit être un nombre positif.');
        setIsError(true);
        return false;
    }

    setErrorMsg('');
    setIsError(false);
    return true;
};

export const checkSneakerImage = (image: string, setErrorMsg: (msg: string) => void, setIsSneakerImageError: (isError: boolean) => void): boolean => {
    if (!image) {
        setErrorMsg('Please select an image.');
        setIsSneakerImageError(true);
        return false;
    }
    return true;
};

export const validateAllFields = (sneakerName: string, sneakerBrand: string, sneakerSize: string, sneakerCondition: string, sneakerStatus: string, sneakerImage: string, setErrorMsg: (msg: string) => void, setIsSneakerNameError: (isError: boolean) => void, setIsSneakerBrandError: (isError: boolean) => void, setIsSneakerSizeError: (isError: boolean) => void, setIsSneakerConditionError: (isError: boolean) => void, setIsSneakerStatusError: (isError: boolean) => void, setIsSneakerImageError: (isError: boolean) => void) => {
    const isImageValid = checkSneakerImage(sneakerImage, setErrorMsg, setIsSneakerImageError);
    const isNameValid = checkSneakerName(sneakerName, setErrorMsg, setIsSneakerNameError);
    const isBrandValid = checkSneakerBrand(sneakerBrand, setErrorMsg, setIsSneakerBrandError);
    const isStatusValid = checkSneakerStatus(sneakerStatus, setErrorMsg, setIsSneakerStatusError);
    const isSizeValid = checkSneakerSize(sneakerSize, setErrorMsg, setIsSneakerSizeError);
    const isConditionValid = checkSneakerCondition(sneakerCondition, setErrorMsg, setIsSneakerConditionError);

    return isNameValid && isBrandValid && isSizeValid && isConditionValid && isStatusValid && isImageValid;
};