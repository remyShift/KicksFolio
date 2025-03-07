type ValidStatus = 'rocking' | 'stocking' | 'selling';

export class SneakerValidationService {
    private setErrorMsg: (msg: string) => void;
    private setIsError: (isError: boolean) => void;

    constructor(
        setErrorMsg: (msg: string) => void,
        setIsError: (isError: boolean) => void
    ) {
        this.setErrorMsg = setErrorMsg;
        this.setIsError = setIsError;
    }

    public validateName(name: string): boolean {
        if (!name) {
            this.setErrorMsg('Please enter a sneaker name.');
            this.setIsError(true);
            return false;
        }

        this.clearErrors();
        return true;
    }

    public validateBrand(brand: string): boolean {
        if (!brand) {
            this.setErrorMsg('Please select a brand.');
            this.setIsError(true);
            return false;
        }

        const brandRegex = /^[a-zA-Z\s]+$/;
        if (!brandRegex.test(brand)) {
            this.setErrorMsg('Brand invalid, brand must contain only letters and spaces.');
            this.setIsError(true);
            return false;
        }

        this.clearErrors();
        return true;
    }

    public validateSize(size: string): boolean {
        if (!size || isNaN(parseFloat(size))) {
            this.setErrorMsg('Please enter a size.');
            this.setIsError(true);
            return false;
        }

        const sizeNum = parseFloat(size);
        if (isNaN(sizeNum) || sizeNum < 7 || sizeNum > 16) {
            this.setErrorMsg('Size invalid, size must be between 7 and 16.');
            this.setIsError(true);
            return false;
        }

        if (sizeNum % 0.5 !== 0) {
            this.setErrorMsg('Size invalid, size must be a multiple of 0.5.');
            this.setIsError(true);
            return false;
        }

        this.clearErrors();
        return true;
    }

    public validateCondition(condition: string): boolean {
        if (!condition) {
            this.setErrorMsg('Please enter a condition.');
            this.setIsError(true);
            return false;
        }

        const conditionNum = Number(condition);
        if (isNaN(conditionNum) || conditionNum < 0 || conditionNum > 10) {
            this.setErrorMsg('Condition invalid, condition must be between 0 and 10.');
            this.setIsError(true);
            return false;
        }

        if (conditionNum % 0.5 !== 0) {
            this.setErrorMsg('Condition invalid, condition must be a multiple of 0.5.');
            this.setIsError(true);
            return false;
        }

        this.clearErrors();
        return true;
    }

    public validateStatus(status: string): boolean {
        const validStatuses: ValidStatus[] = ['rocking', 'stocking', 'selling'];

        if (!status) {
            this.setErrorMsg('Status invalid, status must be one of the following: rocking, stocking, selling.');
            this.setIsError(true);
            return false;
        }

        const statusRegex = /^[a-zA-Z\s]+$/;
        if (!statusRegex.test(status)) {
            this.setErrorMsg('Status invalid, status must contain only letters.');
            this.setIsError(true);
            return false;
        }

        if (!validStatuses.includes(status.toLowerCase() as ValidStatus)) {
            this.setErrorMsg('Status invalid, status must be one of the following: rocking, stocking, selling.');
            this.setIsError(true);
            return false;
        }

        this.clearErrors();
        return true;
    }

    public validatePrice(price: string): boolean {
        if (!price) {
            this.setErrorMsg('Veuillez entrer un prix.');
            this.setIsError(true);
            return false;
        }

        if (isNaN(Number(price)) || Number(price) < 0) {
            this.setErrorMsg('Le prix doit être un nombre positif.');
            this.setIsError(true);
            return false;
        }

        this.clearErrors();
        return true;
    }

    public validateImage(image: string): boolean {
        if (!image) {
            this.setErrorMsg('Please select an image.');
            this.setIsError(true);
            return false;
        }

        this.clearErrors();
        return true;
    }

    public validateAllFields(
        sneakerData: {
            name: string;
            brand: string;
            size: string;
            condition: string;
            status: string;
            price: string;
            image: string;
        },
        errorSetters: {
            setNameError: (isError: boolean) => void;
            setBrandError: (isError: boolean) => void;
            setSizeError: (isError: boolean) => void;
            setConditionError: (isError: boolean) => void;
            setStatusError: (isError: boolean) => void;
            setImageError: (isError: boolean) => void;
        }
    ): boolean {
        const validations = [
            {
                value: sneakerData.image,
                validate: () => this.validateImage(sneakerData.image),
                setError: errorSetters.setImageError
            },
            {
                value: sneakerData.name,
                validate: () => this.validateName(sneakerData.name),
                setError: errorSetters.setNameError
            },
            {
                value: sneakerData.brand,
                validate: () => this.validateBrand(sneakerData.brand),
                setError: errorSetters.setBrandError
            },
            {
                value: sneakerData.status,
                validate: () => this.validateStatus(sneakerData.status),
                setError: errorSetters.setStatusError
            },
            {
                value: sneakerData.size,
                validate: () => this.validateSize(sneakerData.size),
                setError: errorSetters.setSizeError
            },
            {
                value: sneakerData.condition,
                validate: () => this.validateCondition(sneakerData.condition),
                setError: errorSetters.setConditionError
            }
        ];

        return validations.every(({ validate, setError }) => {
            const isValid = validate();
            setError(!isValid);
            return isValid;
        });
    }

    private clearErrors(): void {
        this.setErrorMsg('');
        this.setIsError(false);
    }
} 