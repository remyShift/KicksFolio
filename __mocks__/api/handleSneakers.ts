const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

export const mockHandleSneakers = {
    handleSneakerSubmit: jest.fn().mockImplementation((sneaker, sneakerId, token) => {
        if (!token) return undefined;

        if (sneaker.model === 'InvalidJSON') {
            return Promise.reject(new SyntaxError('Invalid JSON'));
        }

        if (sneaker.model === 'ValidationError') {
            return Promise.reject(new Error('Validation failed'));
        }

        const response = {
            id: sneakerId || '1',
            ...sneaker
        };

        const url = sneakerId 
            ? `https://api.test.com/users/123/collection/sneakers/${sneakerId}`
            : 'https://api.test.com/users/123/collection/sneakers';

        const method = sneakerId ? 'PATCH' : 'POST';
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        };

        let requestBody;
        if (sneaker.image) {
            const formData = new Map();
            const imageData = {
                uri: sneaker.image,
                type: 'image/jpeg',
                name: sneaker.image.includes('.') ? 'photo.jpeg' : `photo.${sneaker.image}`
            };
            formData.set('sneaker[images][]', imageData);
            requestBody = {
                get: (key: string) => formData.get(key)
            };
        }

        mockFetch.mockImplementationOnce((_url: string | URL | Request, _options?: RequestInit) => {
            return Promise.resolve(new Response(JSON.stringify(response), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }));
        });

        global.fetch(url, {
            method,
            headers,
            body: requestBody as unknown as BodyInit
        });

        return Promise.resolve(response);
    }),

    handleSneakerDelete: jest.fn().mockImplementation((sneakerId, userId, token) => {
        if (!token) return undefined;

        if (sneakerId === '999') {
            return Promise.reject(new Error('HTTP error! status: 404'));
        }

        return Promise.resolve(true);
    }),

    fetchSkuSneakerData: jest.fn().mockImplementation((sku, token) => {
        if (!token) return undefined;

        if (sku === 'INVALID') {
            return Promise.reject(new Error('HTTP error! status: 404'));
        }

        if (sku === 'ABC123') {
            return Promise.reject(new Error('No data found for this SKU'));
        }

        return Promise.resolve({
            name: 'Nike Air Max 90 Be True (2019)',
            brand: 'Nike'
        });
    })
}; 