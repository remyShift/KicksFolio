import { collectionService } from '@/services/CollectionService';
import { mockUser } from '../../__mocks__/context/mockData';

describe('Handle Collection', () => {
    const mockSessionToken = 'fake-token';
    
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
    });

    describe('Collection creation', () => {
        it('should create a collection successfully', async () => {
            const mockCollection = {
                id: '1',
                name: 'Ma Collection',
                user_id: mockUser.id,
                created_at: '2024-01-01',
                updated_at: '2024-01-01'
            };

            global.fetch = jest.fn().mockImplementationOnce(() => 
                Promise.resolve({
                    ok: true,
                    headers: {
                        get: () => 'application/json'
                    },
                    json: () => Promise.resolve({ collection: mockCollection })
                })
            );

            const result = await collectionService.create('Ma Collection', mockUser.id, mockSessionToken);
            expect(result.collection).toEqual(mockCollection);
        });

        it('should return an error if the collection name is empty', async () => {
            global.fetch = jest.fn().mockImplementationOnce(() => 
                Promise.resolve({
                    ok: false,
                    headers: {
                        get: () => 'application/json'
                    },
                    json: () => Promise.resolve({ errors: ["Name can't be blank"] })
                })
            );

            await expect(collectionService.create('', mockUser.id, mockSessionToken))
                .rejects
                .toThrow("Name can't be blank");
        });

        it('should return an error if the user already has a collection', async () => {
            global.fetch = jest.fn().mockImplementationOnce(() => 
                Promise.resolve({
                    ok: false,
                    headers: {
                        get: () => 'application/json'
                    },
                    json: () => Promise.resolve({ error: 'User already has a collection' })
                })
            );

            await expect(collectionService.create('Ma Collection', mockUser.id, mockSessionToken))
                .rejects
                .toThrow('User already has a collection');
        });

        it('should return an error if the token is invalid', async () => {
            global.fetch = jest.fn().mockImplementationOnce(() => 
                Promise.resolve({
                    ok: false,
                    headers: {
                        get: () => 'application/json'
                    },
                    json: () => Promise.resolve({ error: 'Error when creating collection' })
                })
            );

            await expect(collectionService.create('Ma Collection', mockUser.id, 'invalid-token'))
                .rejects
                .toThrow('Error when creating collection');
        });

        it('should return an error if the token is not provided', async () => {
            global.fetch = jest.fn().mockImplementationOnce(() => 
                Promise.resolve({
                    ok: false,
                    headers: {
                        get: () => 'application/json'
                    },
                    json: () => Promise.resolve({ error: 'Token is required' })
                })
            );

            await expect(collectionService.create('Ma Collection', mockUser.id, ''))
                .rejects
                .toThrow('Token is required');
        });
    });
}); 