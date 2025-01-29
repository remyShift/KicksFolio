import { checkPricePaid, checkSneakerBrand, checkSneakerCondition, checkSneakerImage, checkSneakerName, checkSneakerSize, checkSneakerStatus } from '../../scripts/validatesSneakersForm';

describe('Checking sneaker inputs', () => {
    
    describe('Checking sneaker status', () => {
        it('should return true if the status is valid if its one of the following: rocking, stocking, selling', () => {
            expect(checkSneakerStatus('rocking', () => {}, () => {})).toBe(true);
            expect(checkSneakerStatus('stocking', () => {}, () => {})).toBe(true);
            expect(checkSneakerStatus('selling', () => {}, () => {})).toBe(true);
        });

        it('should return false if the status is not valid if its not one of the following: rocking, stocking, selling', () => {
            expect(checkSneakerStatus('other', () => {}, () => {})).toBe(false);
        });

        it('should return false if the status is not provided', () => {
            expect(checkSneakerStatus('', () => {}, () => {})).toBe(false);
        });
    });

    describe('Checking sneaker price paid', () => {
        it('should return true if the price paid is valid if its a positive number', () => {
            expect(checkPricePaid('100', () => {}, () => {})).toBe(true);
        });

        it('should return false if the price paid is not valid if its not a positive number', () => {
            expect(checkPricePaid('-100', () => {}, () => {})).toBe(false);
        });

        it('should return false if the price paid is not valid if its not a number', () => {
            expect(checkPricePaid('a', () => {}, () => {})).toBe(false);
        });

        it('should return false if the price paid is not provided', () => {
            expect(checkPricePaid('', () => {}, () => {})).toBe(false);
        });
    });

    describe('Checking sneaker image', () => {
        it('should return true if the image is valid if its provided', () => {
            expect(checkSneakerImage('image.jpg', () => {}, () => {})).toBe(true);
        });

        it('should return false if the image is not provided', () => {
            expect(checkSneakerImage('', () => {}, () => {})).toBe(false);
        });
    });

    describe('Checking sneaker name', () => {
        it('should return true if the name is valid if its provided', () => {
            expect(checkSneakerName('name', () => {}, () => {})).toBe(true);
        });

        it('should return false if the name is not provided', () => {
            expect(checkSneakerName('', () => {}, () => {})).toBe(false);
        });
    });

    describe('Checking sneaker brand', () => {
        it('should return true if the brand is valid if its provided', () => {
            expect(checkSneakerBrand('brand', () => {}, () => {})).toBe(true);
        });

        it('should return false if the brand is not provided', () => {
            expect(checkSneakerBrand('', () => {}, () => {})).toBe(false);
        });
    });

    describe('Checking sneaker condition', () => {
        it('should return true if the condition is valid if its provided', () => {
            expect(checkSneakerCondition('10', () => {}, () => {})).toBe(true);
        });

        it('should return false if the condition is not provided', () => {
            expect(checkSneakerCondition('', () => {}, () => {})).toBe(false);
        });

        it('should return false if the condition is not valid if its not a number', () => {
            expect(checkSneakerCondition('a', () => {}, () => {})).toBe(false);
        });

        it('should return false if the condition is not valid if its not a number between 0 and 10', () => {
            expect(checkSneakerCondition('11', () => {}, () => {})).toBe(false);
        });

        it('should return false if the condition is not valid if its not a multiple of 0.5', () => {
            expect(checkSneakerCondition('1.6', () => {}, () => {})).toBe(false);
        });
    });

    describe('Checking sneaker size', () => {
        it('should return true if the size is valid if its provided', () => {
            expect(checkSneakerSize('10', () => {}, () => {})).toBe(true);
        });

        it('should return false if the size is not provided', () => {
            expect(checkSneakerSize('', () => {}, () => {})).toBe(false);
        });

        it('should return false if the size is not valid if its not a number', () => {
            expect(checkSneakerSize('a', () => {}, () => {})).toBe(false);
        });

        it('should return false if the size is not valid if its not a number between 7 and 16', () => {
            expect(checkSneakerSize('17', () => {}, () => {})).toBe(false);
        });

        it('should return false if the size is not valid if its not a multiple of 0.5', () => {
            expect(checkSneakerSize('1.6', () => {}, () => {})).toBe(false);
        });
    });
});