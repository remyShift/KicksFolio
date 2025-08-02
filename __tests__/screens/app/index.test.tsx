import Index from '@/app/(app)/(tabs)/index';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ReactTestInstance } from 'react-test-renderer';
import { router } from 'expo-router';
import { useSession } from '@/context/authContext';

describe('Index', () => {
	let collectionCard: ReactTestInstance;
	let mainButton: ReactTestInstance;

	beforeEach(() => {
		jest.clearAllMocks();
		(useSession as jest.Mock).mockReturnValue({
			user: { id: 'test-user-id' },
			userSneakers: []
		});
		render(<Index />);
		collectionCard = screen.getByTestId('collection-card');
		mainButton = screen.getByTestId('main-button');
	});

	it('should render index page', () => {
		expect(collectionCard).toBeTruthy();
	});

	it('should render the browse button if user havent friends', () => {
		expect(mainButton).toBeTruthy();
		expect(screen.getByText('Browse')).toBeTruthy();
	});

	it('should navigate to user page when collection card is pressed', () => {
		fireEvent.press(collectionCard);
		expect(router.push).toHaveBeenCalledWith('/(app)/(tabs)/profile');
	});

	describe('CollectionCard display', () => {
		it('should display empty slots when no sneakers', () => {
			const emptySlots = screen.getAllByTestId('empty-slot');
			expect(emptySlots).toHaveLength(4);
		});

		it('should display 1 sneaker and 3 empty slots', () => {
			(useSession as jest.Mock).mockReturnValue({
				user: { id: 'test-user-id' },
				userSneakers: [{
					images: [{ url: 'test-url-1' }]
				}]
			});
			render(<Index />);
			
			const images = screen.getAllByTestId('sneaker-image');
			const emptySlots = screen.getAllByTestId('empty-slot');
			
			expect(images).toHaveLength(1);
			expect(emptySlots).toHaveLength(3);
		});

		it('should display 2 sneakers and 2 empty slots', () => {
			(useSession as jest.Mock).mockReturnValue({
				user: { id: 'test-user-id' },
				userSneakers: [
					{ images: [{ url: 'test-url-1' }] },
					{ images: [{ url: 'test-url-2' }] }
				]
			});
			render(<Index />);
			
			const images = screen.getAllByTestId('sneaker-image');
			const emptySlots = screen.getAllByTestId('empty-slot');
			
			expect(images).toHaveLength(2);
			expect(emptySlots).toHaveLength(2);
		});

		it('should display 3 sneakers and 1 empty slot', () => {
			(useSession as jest.Mock).mockReturnValue({
				user: { id: 'test-user-id' },
				userSneakers: [
					{ images: [{ url: 'test-url-1' }] },
					{ images: [{ url: 'test-url-2' }] },
					{ images: [{ url: 'test-url-3' }] }
				]
			});
			render(<Index />);
			
			const images = screen.getAllByTestId('sneaker-image');
			const emptySlots = screen.getAllByTestId('empty-slot');
			
			expect(images).toHaveLength(3);
			expect(emptySlots).toHaveLength(1);
		});

		it('should display 4 sneakers and no empty slots', () => {
			(useSession as jest.Mock).mockReturnValue({
				user: { id: 'test-user-id' },
				userSneakers: [
					{ images: [{ url: 'test-url-1' }] },
					{ images: [{ url: 'test-url-2' }] },
					{ images: [{ url: 'test-url-3' }] },
					{ images: [{ url: 'test-url-4' }] }
				]
			});
			render(<Index />);
			
			const images = screen.getAllByTestId('sneaker-image');
			const emptySlots = screen.queryAllByTestId('empty-slot');
			
			expect(images).toHaveLength(4);
			expect(emptySlots).toHaveLength(0);
		});

		it('should display only first 4 sneakers when more than 4 sneakers', () => {
			(useSession as jest.Mock).mockReturnValue({
				user: { id: 'test-user-id' },
				userSneakers: [
					{ images: [{ url: 'test-url-1' }] },
					{ images: [{ url: 'test-url-2' }] },
					{ images: [{ url: 'test-url-3' }] },
					{ images: [{ url: 'test-url-4' }] },
					{ images: [{ url: 'test-url-5' }] }
				]
			});
			render(<Index />);
			
			const images = screen.getAllByTestId('sneaker-image');
			const emptySlots = screen.queryAllByTestId('empty-slot');
			
			expect(images).toHaveLength(4);
			expect(emptySlots).toHaveLength(0);
		});
	});
});