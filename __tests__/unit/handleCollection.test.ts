import { createCollection } from '@/scripts/handleCollection/createCollection';
import { mockUser } from '../../__mocks__/context/mockData';

describe('Handle Collection', () => {
    const mockSessionToken = 'fake-token';
    
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
    });

    describe('Collection creation', () => {
        it('should create a collection successfully', async () => {
            const mockResponse = {
                collection: {
                    id: '1',
                    name: 'Ma Collection',
                    user_id: mockUser.id
                }
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await createCollection('Ma Collection', mockUser.id, mockSessionToken);

            expect(result).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith(
                `${process.env.EXPO_PUBLIC_BASE_API_URL}/users/${mockUser.id}/collection`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${mockSessionToken}`,
                    },
                    body: JSON.stringify({ collection: { name: 'Ma Collection' } }),
                }
            );
        });

        it('should return an error if the collection name is empty', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({ errors: ["Name can't be blank"] })
            });

            await expect(createCollection('', mockUser.id, mockSessionToken))
                .rejects
                .toThrow("Name can't be blank");
        });

        it('should return an error if the user already has a collection', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({ errors: ['User already has a collection'] })
            });

            await expect(createCollection('Ma Collection', mockUser.id, mockSessionToken))
                .rejects
                .toThrow('User already has a collection');
        });

        it('should return an error if the token is invalid', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: () => Promise.resolve({ error: 'Invalid token' })
            });

            await expect(createCollection('Ma Collection', mockUser.id, 'invalid-token'))
                .rejects
                .toThrow('Error when creating collection');
        });

        it('should return an error if the token is not provided', async () => {
            await expect(createCollection('Ma Collection', mockUser.id, ''))
                .rejects
                .toThrow();
        });
    });
}); 