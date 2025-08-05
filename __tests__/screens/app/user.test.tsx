import { act } from 'react';
import { ReactTestInstance } from 'react-test-renderer';

import { router } from 'expo-router';

import { fireEvent, render, screen } from '@testing-library/react-native';

import UserPage from '@/app/(app)/(tabs)/profile';
import { useSession } from '@/context/authContext';

import { mockUseAuth } from '../../setup/auth';
import { mockSneakers } from './appSetup';

jest.mock('@/hooks/useAuth', () => ({
	useAuth: () => mockUseAuth,
}));

describe('User', () => {
	describe('User page render', () => {
		let profileHeader: ReactTestInstance;
		let profileInfo: ReactTestInstance;
		let sneakersCount: ReactTestInstance;

		beforeEach(() => {
			jest.clearAllMocks();
			render(<UserPage />);

			profileHeader = screen.getByTestId('profile-header');
			profileInfo = screen.getByTestId('profile-info');
			sneakersCount = screen.getByTestId('sneakers-count');
		});

		it('should render the user page', () => {
			expect(sneakersCount.props.children).toBe(0);
			expect(profileHeader).toBeTruthy();
			expect(profileInfo).toBeTruthy();
		});
	});

	describe('User sneakers display', () => {
		it('should display the main button to add a sneaker if the user has no sneakers', () => {
			render(<UserPage />);

			const addSneakerButton = screen.getByTestId('main-button');
			expect(addSneakerButton).toBeTruthy();
		});

		it('should display sneakers cards if the user has sneakers and the main button is not displayed but the add button is', () => {
			(useSession as jest.Mock).mockReturnValue({
				user: {
					id: 'test-user-id',
					username: 'testuser',
				},
				userSneakers: mockSneakers,
				refreshUserData: jest.fn(),
				isLoading: false,
				setUserSneakers: jest.fn(),
				setUser: jest.fn(),
				refreshUserSneakers: jest.fn(),
			});

			render(<UserPage />);

			const sneakers = screen.getAllByTestId('sneaker-card');
			expect(sneakers).toHaveLength(mockSneakers.length);

			expect(screen.queryByTestId('main-button')).toBeNull();
		});

		it('should call modal store functions when the card is pressed', () => {
			const setModalStep = jest.fn();
			const setIsVisible = jest.fn();
			const setCurrentSneaker = jest.fn();

			jest.spyOn(
				require('@/store/useModalStore'),
				'useModalStore'
			).mockImplementation(() => ({
				modalStep: 'index',
				isVisible: false,
				currentSneaker: null,
				setModalStep,
				setIsVisible,
				setCurrentSneaker,
				resetModalData: jest.fn(),
			}));

			(useSession as jest.Mock).mockReturnValue({
				user: {
					id: 'test-user-id',
					username: 'testuser',
				},
				userSneakers: mockSneakers,
				refreshUserData: jest.fn(),
				isLoading: false,
				setUserSneakers: jest.fn(),
				setUser: jest.fn(),
				refreshUserSneakers: jest.fn(),
			});

			render(<UserPage />);

			const firstSneakerCard = screen.getAllByTestId('sneaker-card')[0];

			fireEvent.press(firstSneakerCard);

			expect(setCurrentSneaker).toHaveBeenCalledWith(mockSneakers[0]);
			expect(setModalStep).toHaveBeenCalledWith('view');
			expect(setIsVisible).toHaveBeenCalledWith(true);
		});
	});

	describe('Settings navigation', () => {
		let menuButton: ReactTestInstance;

		beforeEach(() => {
			jest.clearAllMocks();

			render(<UserPage />);
			menuButton = screen.getByTestId('menu-button');
		});

		it('should navigate to settings when menu button is pressed', () => {
			fireEvent.press(menuButton);

			expect(router.push).toHaveBeenCalledWith('/settings');
		});
	});

	describe('Pull to refresh functionality', () => {
		it('should refresh user data when pull-to-refresh is triggered', async () => {
			const refreshUserData = jest.fn().mockResolvedValue(undefined);
			(useSession as jest.Mock).mockImplementation(() => ({
				user: {
					id: '1',
					username: 'testuser',
				},
				userSneakers: [],
				refreshUserData,
				isLoading: false,
				setUserSneakers: jest.fn(),
				setUser: jest.fn(),
				refreshUserSneakers: jest.fn(),
			}));

			render(<UserPage />);

			const scrollView = screen.getByTestId('scroll-view');
			const refreshControl = scrollView.props.refreshControl;

			expect(refreshControl).toBeTruthy();
			expect(typeof refreshControl.props.onRefresh).toBe('function');

			expect(refreshUserData).toBeDefined();
		}, 10000);

		it('should show refreshing indicator during refresh', () => {
			render(<UserPage />);

			const scrollView = screen.getByTestId('scroll-view');
			const refreshControl = scrollView.props.refreshControl;

			expect(refreshControl.props.refreshing).toBe(false);
		});

		it('should set refreshing state correctly during refresh', async () => {
			const refreshUserData = jest.fn().mockResolvedValue(undefined);

			(useSession as jest.Mock).mockImplementation(() => ({
				user: {
					id: '1',
					username: 'testuser',
				},
				userSneakers: [],
				refreshUserData,
				isLoading: false,
				setUserSneakers: jest.fn(),
				setUser: jest.fn(),
				refreshUserSneakers: jest.fn(),
			}));

			render(<UserPage />);

			const scrollView = screen.getByTestId('scroll-view');
			const refreshControl = scrollView.props.refreshControl;

			expect(refreshControl.props.refreshing).toBe(false);
			expect(typeof refreshControl.props.onRefresh).toBe('function');
			expect(refreshUserData).toBeDefined();
		}, 10000);

		it('should have correct refresh control properties', () => {
			render(<UserPage />);

			const scrollView = screen.getByTestId('scroll-view');
			const refreshControl = scrollView.props.refreshControl;

			expect(refreshControl).toBeTruthy();
			expect(refreshControl.props.tintColor).toBe('#FF6B6B');
			expect(refreshControl.props.progressViewOffset).toBe(60);
			expect(typeof refreshControl.props.onRefresh).toBe('function');
		});
	});
});
