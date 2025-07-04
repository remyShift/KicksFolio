import Wishlist from '@/app/(app)/(tabs)/wishlist';
import { render, screen } from '@testing-library/react-native';
import { useSession } from '@/context/authContext';
import { Sneaker, SneakerBrand, SneakerStatus } from '@/types/Sneaker';

jest.mock('@/context/authContext');

describe('Wishlist', () => {
    const mockWishlistSneakers: Sneaker[] = [
        {
            id: '1',
            user_id: 'user1',
            model: 'Air Max 1',
            brand: SneakerBrand.Nike,
            size_us: 10,
            size_eu: 44,
            condition: 9,
            price_paid: 150,
            status: SneakerStatus.Rocking,
            images: [{ id: '1', uri: 'https://example.com/image1.jpg' }],
            description: 'Great sneaker',
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
            estimated_value: 200,
        }
    ];

    const mockRefreshUserData = jest.fn();
    const mockSetModalStep = jest.fn();
    const mockSetIsVisible = jest.fn();
    const mockSetCurrentSneaker = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        
        (useSession as jest.Mock).mockReturnValue({
            wishlistSneakers: mockWishlistSneakers,
            refreshUserData: mockRefreshUserData,
        });

        jest.spyOn(require('@/store/useModalStore'), 'useModalStore').mockReturnValue({
            modalStep: 'index',
            isVisible: false,
            currentSneaker: null,
            setModalStep: mockSetModalStep,
            setIsVisible: mockSetIsVisible,
            setCurrentSneaker: mockSetCurrentSneaker,
            resetModal: jest.fn(),
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should render wishlist page', () => {
        render(<Wishlist />);

        const scrollView = screen.getByTestId('wishlist-scroll-view');
        expect(scrollView).toBeOnTheScreen();
    });

    it('should render card view by default', () => {
        render(<Wishlist />);

        const cardViewContainer = screen.getByTestId('card-view-container');
        expect(cardViewContainer).toBeOnTheScreen();
    });

    it('should display empty state when no sneakers', () => {
        (useSession as jest.Mock).mockReturnValue({
            wishlistSneakers: [],
            refreshUserData: mockRefreshUserData,
        });

        render(<Wishlist />);

        const emptyContainer = screen.getByTestId('empty-wishlist-container');
        expect(emptyContainer).toBeOnTheScreen();
    });

    it('should display empty state when wishlistSneakers is null', () => {
        (useSession as jest.Mock).mockReturnValue({
            wishlistSneakers: null,
            refreshUserData: mockRefreshUserData,
        });

        render(<Wishlist />);

        const emptyContainer = screen.getByTestId('empty-wishlist-container');
        expect(emptyContainer).toBeOnTheScreen();
    });

    it('should render refresh control', () => {
        render(<Wishlist />);

        const scrollView = screen.getByTestId('wishlist-scroll-view');
        expect(scrollView).toBeOnTheScreen();
        
        expect(scrollView.props.scrollEnabled).toBe(true);
    });
}); 