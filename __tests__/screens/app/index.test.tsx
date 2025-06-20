import Index from '@/app/(app)/(tabs)/index';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ReactTestInstance } from 'react-test-renderer';
import { router } from 'expo-router';
import { useSession } from '@/context/authContext';

jest.mock('@/context/authContext', () => ({
	useSession: jest.fn()
}));


jest.mock('@/store/useModalStore', () => ({
	useModalStore: () => ({
		modalStep: 'index',
		isVisible: false,
		setModalStep: jest.fn(),
		setIsVisible: jest.fn(),
		resetModal: jest.fn(),
	})
}));

describe('Index', () => {
	let collectionCard: ReactTestInstance;
	let mainButton: ReactTestInstance;

	beforeEach(() => {
		jest.clearAllMocks();
		(useSession as jest.Mock).mockReturnValue({
			user: { id: 'test-user-id' },
			userCollection: { name: 'Test Collection' },
			userSneakers: []
		});
		render(<Index />);
		collectionCard = screen.getByTestId('collection-card');
		mainButton = screen.getByTestId('main-button');
	});

	it('should render index page', () => {
		const pageTitle = screen.getByTestId('page-title');

		expect(pageTitle).toBeTruthy();
		expect(pageTitle.props.children).toBe('KicksFolio');
		expect(collectionCard).toBeTruthy();
	});

	it('should render the browse button if user havent friends', () => {
		expect(mainButton).toBeTruthy();
		expect(mainButton.props.children[0].props.children).toBe('Browse');
	});

	it('should navigate to user page when collection card is pressed', () => {
		fireEvent.press(collectionCard);
		expect(router.push).toHaveBeenCalledWith('/(app)/(tabs)/user');
	});

	describe('CollectionCard display', () => {
		it('should display empty slots when no sneakers', () => {
			const emptySlots = screen.getAllByTestId('empty-slot');
			expect(emptySlots).toHaveLength(4);
		});

		it('should display 1 sneaker and 3 empty slots', () => {
			(useSession as jest.Mock).mockReturnValue({
				user: { id: 'test-user-id' },
				userCollection: { name: 'Test Collection' },
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
				userCollection: { name: 'Test Collection' },
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
				userCollection: { name: 'Test Collection' },
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
				userCollection: { name: 'Test Collection' },
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
				userCollection: { name: 'Test Collection' },
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

	describe('SneakersModal display', () => {
		let setModalStep: jest.Mock;
		let setIsVisible: jest.Mock;

		afterEach(() => {
			jest.restoreAllMocks();
		});

		it('should display the sneakers modal if a new user come on the page', () => {
			setModalStep = jest.fn();
			setIsVisible = jest.fn();

			jest.spyOn(require('@/store/useModalStore'), 'useModalStore').mockImplementation(() => ({
				modalStep: 'index',
				isVisible: true,
				setModalStep,
				setIsVisible,
				resetModal: jest.fn(),
			}));

			(useSession as jest.Mock).mockReturnValue({
				user: { id: 'test-user-id' },
				userCollection: { name: 'Test Collection' },
				userSneakers: []
			});

			render(<Index />);

			expect(setModalStep).toHaveBeenCalledWith('index');
			expect(setIsVisible).toHaveBeenCalledWith(true);
			expect(screen.getByTestId('sneakers-modal')).toBeOnTheScreen();
		});

		it('should not display the sneakers modal if a user with sneakers come on the page', () => {
			setModalStep = jest.fn();
			setIsVisible = jest.fn();

			jest.spyOn(require('@/store/useModalStore'), 'useModalStore').mockImplementation(() => ({
				modalStep: 'index',
				isVisible: false,
				setModalStep,
				setIsVisible,
				resetModal: jest.fn(),
			}));

			(useSession as jest.Mock).mockReturnValue({
				user: { id: 'test-user-id' },
				userCollection: { name: 'Test Collection' },
				userSneakers: [{ images: [{ url: 'test-url-1' }] }]
			});

			render(<Index />);
			expect(screen.queryByTestId('sneakers-modal')).toBeNull();
		});

		it('should display the sneaker modal if a user without sneakers come on the page', () => {
			setModalStep = jest.fn();
			setIsVisible = jest.fn();

			jest.spyOn(require('@/store/useModalStore'), 'useModalStore').mockImplementation(() => ({
				modalStep: 'index',
				isVisible: true,
				setModalStep,
				setIsVisible,
				resetModal: jest.fn(),
			}));

			(useSession as jest.Mock).mockReturnValue({
				user: { id: 'test-user-id' },
				userCollection: { name: 'Test Collection' },
				userSneakers: []
			});

			render(<Index />);
			expect(setModalStep).toHaveBeenCalledWith('index');
			expect(setIsVisible).toHaveBeenCalledWith(true);
			expect(screen.getByTestId('sneakers-modal')).toBeOnTheScreen();
		});
	});
});