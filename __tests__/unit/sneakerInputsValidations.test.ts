import { SneakerValidationService } from '@/services/SneakerValidationService';

describe('Checking sneaker inputs', () => {
    const validationService = new SneakerValidationService(
        () => {},
        () => {}
    );
    
    describe('Checking sneaker status', () => {
        it('should return true if the status is valid if its one of the following: rocking, stocking, selling', () => {
            expect(validationService.validateStatus('rocking')).toBe(true);
            expect(validationService.validateStatus('stocking')).toBe(true);
            expect(validationService.validateStatus('selling')).toBe(true);
        });

        it('should return false if the status is not valid if its not one of the following: rocking, stocking, selling', () => {
            expect(validationService.validateStatus('other')).toBe(false);
        });

        it('should return false if the status is not provided', () => {
            expect(validationService.validateStatus('')).toBe(false);
        });
    });

    describe('Checking sneaker price paid', () => {
        it('should return true if the price paid is valid if its a positive number', () => {
            expect(validationService.validatePrice('100')).toBe(true);
        });

        it('should return false if the price paid is not valid if its not a positive number', () => {
            expect(validationService.validatePrice('-100')).toBe(false);
        });

        it('should return false if the price paid is not valid if its not a number', () => {
            expect(validationService.validatePrice('a')).toBe(false);
        });

        it('should return false if the price paid is not provided', () => {
            expect(validationService.validatePrice('')).toBe(false);
        });
    });

    describe('Checking sneaker image', () => {
        it('should return true if the image is valid if its provided', () => {
            expect(validationService.validateImage('image.jpg')).toBe(true);
        });

        it('should return false if the image is not provided', () => {
            expect(validationService.validateImage('')).toBe(false);
        });
    });

    describe('Checking sneaker name', () => {
        it('should return true if the name is valid if its provided', () => {
            expect(validationService.validateName('name')).toBe(true);
        });

        it('should return false if the name is not provided', () => {
            expect(validationService.validateName('')).toBe(false);
        });
    });

    describe('Checking sneaker brand', () => {
        it('should return true if the brand is valid if its provided', () => {
            expect(validationService.validateBrand('brand')).toBe(true);
        });

        it('should return false if the brand is not provided', () => {
            expect(validationService.validateBrand('')).toBe(false);
        });
    });

    describe('Checking sneaker condition', () => {
        it('should return true if the condition is valid if its provided', () => {
            expect(validationService.validateCondition('10')).toBe(true);
        });

        it('should return false if the condition is not provided', () => {
            expect(validationService.validateCondition('')).toBe(false);
        });

        it('should return false if the condition is not valid if its not a number', () => {
            expect(validationService.validateCondition('a')).toBe(false);
        });

        it('should return false if the condition is not valid if its not a number between 0 and 10', () => {
            expect(validationService.validateCondition('11')).toBe(false);
        });

        it('should return false if the condition is not valid if its not a multiple of 0.5', () => {
            expect(validationService.validateCondition('1.6')).toBe(false);
        });
    });

    describe('Checking sneaker size', () => {
        it('should return true if the size is valid if its provided', () => {
            expect(validationService.validateSize('10')).toBe(true);
        });

        it('should return false if the size is not provided', () => {
            expect(validationService.validateSize('')).toBe(false);
        });

        it('should return false if the size is not valid if its not a number', () => {
            expect(validationService.validateSize('a')).toBe(false);
        });

        it('should return false if the size is not valid if its not a number between 7 and 16', () => {
            expect(validationService.validateSize('17')).toBe(false);
        });

        it('should return false if the size is not valid if its not a multiple of 0.5', () => {
            expect(validationService.validateSize('1.6')).toBe(false);
        });
    });
});