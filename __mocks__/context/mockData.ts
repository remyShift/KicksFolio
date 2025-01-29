export const mockUser = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    first_name: 'John',
    last_name: 'Doe',
    sneaker_size: 42,
    profile_picture: {
        url: 'https://example.com/image.jpg'
    }
};

export const mockSneaker = {
    id: '1',
    model: 'Air Max',
    brand: 'Nike',
    size: 42,
    condition: 9,
    status: 'rocking',
    price_paid: 100,
    description: 'Test sneaker',
    estimated_value: 150,
    purchase_date: '2024-01-01',
    images: ['https://example.com/sneaker.jpg']
};

export const mockCollection = {
    id: '1',
    name: 'Ma Collection',
    sneakers: [mockSneaker]
}; 