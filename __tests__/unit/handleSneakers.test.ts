import { mockHandleSneakers } from '../../__mocks__/api/handleSneakers';
import { mockSneaker } from '../../__mocks__/context/mockData';

jest.mock('@/scripts/handleSneakers/addSneaker', () => mockHandleSneakers);
jest.mock('@/scripts/handleSneakers/deleteSneaker', () => mockHandleSneakers);
jest.mock('@/scripts/handleSneakers/skuLookUp', () => mockHandleSneakers);

describe('Handle Sneakers', () => {
    const mockSessionToken = 'fake-token';
    const mockUserId = '123';
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('sneaker add and update', () => {
        it('should create a new sneaker with success', async () => {
            const result = await mockHandleSneakers.handleSneakerSubmit(mockSneaker, null, mockSessionToken);
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('model');
            expect(result).toHaveProperty('brand');
            expect(mockHandleSneakers.handleSneakerSubmit).toHaveBeenCalledWith(
                mockSneaker,
                null,
                mockSessionToken
            );
        });

        it('should update an existing sneaker', async () => {
            const sneakerId = '1';
            const updatedSneaker = {
                ...mockSneaker,
                model: 'Air Jordan Updated',
                brand: 'Nike Updated',
                condition: 8
            };

            const result = await mockHandleSneakers.handleSneakerSubmit(updatedSneaker, sneakerId, mockSessionToken);

            expect(result).toHaveProperty('id', sneakerId);
            expect(result.model).toBe('Air Jordan Updated');
            expect(result.brand).toBe('Nike Updated');
            expect(result.condition).toBe(8);
        });

        it('should handle JSON parsing errors', async () => {
            const invalidJsonSneaker = {
                ...mockSneaker,
                model: 'InvalidJSON'
            };

            await expect(mockHandleSneakers.handleSneakerSubmit(invalidJsonSneaker, null, mockSessionToken))
                .rejects.toThrow(SyntaxError);
        });

        it('should handle HTTP errors', async () => {
            const validationErrorSneaker = {
                ...mockSneaker,
                model: 'ValidationError'
            };

            await expect(mockHandleSneakers.handleSneakerSubmit(validationErrorSneaker, null, mockSessionToken))
                .rejects.toThrow('Validation failed');
        });

        it('should correctly handle the image in the FormData', async () => {
            const sneakerWithImage = {
                ...mockSneaker,
                image: 'test-image.jpeg'
            };

            await mockHandleSneakers.handleSneakerSubmit(sneakerWithImage, null, mockSessionToken);

            const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
            const formData = fetchCall[1].body as FormData;
            
            expect(formData.get('sneaker[images][]')).toEqual({
                uri: 'test-image.jpeg',
                type: 'image/jpeg',
                name: 'photo.jpeg'
            });
        });

        it('should handle an image without an extension', async () => {
            const sneakerWithInvalidImage = {
                ...mockSneaker,
                image: 'test-image'
            };

            await mockHandleSneakers.handleSneakerSubmit(sneakerWithInvalidImage, null, mockSessionToken);

            const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
            const formData = fetchCall[1].body as FormData;
            
            expect(formData.get('sneaker[images][]')).toEqual({
                uri: 'test-image',
                type: 'image/jpeg',
                name: 'photo.test-image'
            });
        });
    });

    describe('handleSneakerDelete', () => {
        it('should delete a sneaker with success', async () => {
            const result = await mockHandleSneakers.handleSneakerDelete('1', mockUserId, mockSessionToken);
            expect(result).toBe(true);
        });

        it('should fail if the sneaker does not exist', async () => {
            await expect(mockHandleSneakers.handleSneakerDelete('999', mockUserId, mockSessionToken))
                .rejects.toThrow('HTTP error! status: 404');
        });
    });

    describe('fetchSkuSneakerData', () => {
        it('should fetch the SKU data with success', async () => {
            const result = await mockHandleSneakers.fetchSkuSneakerData('CJ5482-100', mockSessionToken);
            expect(result).toHaveProperty('name');
            expect(result).toHaveProperty('brand');
        });

        it('should fail if the SKU does not exist', async () => {
            await expect(mockHandleSneakers.fetchSkuSneakerData('INVALID', mockSessionToken))
                .rejects.toThrow('HTTP error! status: 404');
        });

        it('should fail if no data is found', async () => {
            await expect(mockHandleSneakers.fetchSkuSneakerData('ABC123', mockSessionToken))
                .rejects.toThrow('No data found for this SKU');
        });
    });

    describe('Tests with missing token', () => {
        it('should return undefined for all functions with a null token', async () => {
            const result1 = await mockHandleSneakers.handleSneakerSubmit(mockSneaker, null, null);
            const result2 = await mockHandleSneakers.handleSneakerDelete('1', mockUserId, null);
            const result3 = await mockHandleSneakers.fetchSkuSneakerData('ABC123', null);

            expect(result1).toBeUndefined();
            expect(result2).toBeUndefined();
            expect(result3).toBeUndefined();
        });
    });
});