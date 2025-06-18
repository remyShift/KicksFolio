import UserPage from '@/app/(app)/(tabs)/user';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { ReactTestInstance } from 'react-test-renderer';
import { mockSneakers } from './appSetup';
import { useSession } from '@/context/authContext';
import { useAuth } from '@/hooks/useAuth';
import { Alert } from 'react-native';
import { router } from 'expo-router';

jest.mock('@/store/useModalStore', () => ({
    useModalStore: () => ({
        modalStep: 'index',
        isVisible: false,
        currentSneaker: null,
        setModalStep: jest.fn(),
        setIsVisible: jest.fn(),
        setCurrentSneaker: jest.fn(),
        resetModalData: jest.fn(),
    })
}));

describe('User', () => {

    describe('User page render', () => {
        let profileHeader: ReactTestInstance;
        let profileInfo: ReactTestInstance;
        let pageTitle: ReactTestInstance;
        let usernameTitle: ReactTestInstance;
        let sneakersCount: ReactTestInstance;

        beforeEach(() => {
            jest.clearAllMocks();
            render(<UserPage />);

            profileHeader = screen.getByTestId('profile-header');
            profileInfo = screen.getByTestId('profile-info');
            pageTitle = screen.getByTestId('page-title');
            usernameTitle = screen.getByTestId('username-title');
            sneakersCount = screen.getByTestId('sneakers-count');
        });

        it('should render the user page', () => {
            expect(sneakersCount.props.children).toBe(0);
            expect(usernameTitle.props.children).toBe('testuser');
            expect(profileHeader).toBeTruthy();
            expect(profileInfo).toBeTruthy();
            expect(pageTitle.props.children).toBe('Profile');
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
                userSneakers: mockSneakers,
            });

            render(<UserPage />);

            const sneakers = screen.getAllByTestId('sneaker-card');
            expect(sneakers).toHaveLength(mockSneakers.length);

            const addSneakerButton = screen.getByTestId('add-button');
            expect(screen.queryByTestId('main-button')).toBeNull();
            expect(addSneakerButton).toBeTruthy();
        });

        it('should display the sneakers modal view when the card is pressed', () => {
            const setModalStep = jest.fn();
            const setIsVisible = jest.fn();
            const setCurrentSneaker = jest.fn();

            jest.spyOn(require('@/store/useModalStore'), 'useModalStore').mockImplementation(() => ({
                modalStep: 'view',
                isVisible: true,
                currentSneaker: mockSneakers[0],
                setModalStep,
                setIsVisible,
                setCurrentSneaker,
                resetModalData: jest.fn(),
            }));

            (useSession as jest.Mock).mockReturnValue({
                userSneakers: mockSneakers,
            });

            render(<UserPage />);

            const firstSneakerCard = screen.getAllByTestId('sneaker-card')[0];
            
            fireEvent.press(firstSneakerCard);
            
            expect(setCurrentSneaker).toHaveBeenCalledWith(mockSneakers[0]);
            expect(setModalStep).toHaveBeenCalledWith('view');
            expect(setIsVisible).toHaveBeenCalledWith(true);
            
            const modal = screen.getByTestId('sneakers-modal');
            const sneakerDisplayName = screen.getByTestId('sneaker-display-name');

            expect(modal).toBeOnTheScreen();
            expect(sneakerDisplayName.props.children).toBe(mockSneakers[0].model);
        });
    });

    describe('Drawer', () => {
        let menuButton: ReactTestInstance;

        beforeEach(() => {
            jest.clearAllMocks();
            (useAuth as jest.Mock).mockReturnValue({
                logout: jest.fn(),
            });
            
            render(<UserPage />);
            menuButton = screen.getByTestId('menu-button');
        });

        it('should open the drawer', () => {
            fireEvent.press(menuButton);
            
            const drawer = screen.getByTestId('profile-drawer');
            expect(drawer).toBeTruthy();
        });

        it('should close the drawer', () => {
            fireEvent.press(menuButton);
            
            const drawer = screen.getByTestId('profile-drawer');
            expect(drawer).toBeTruthy();

            const overlay = screen.getByTestId('profile-drawer-overlay');
            fireEvent.press(overlay);
            
            expect(screen.queryByTestId('profile-drawer')).toBeNull();
        });

        it('should navigate to edit profile when edit profile is pressed', () => {            
            const menuButton = screen.getByTestId('menu-button');
            fireEvent.press(menuButton);
            
            const editProfileButton = screen.getByTestId('drawer-button-edit-profile');
            fireEvent.press(editProfileButton);
            
            expect(router.push).toHaveBeenCalledWith('/edit-profile');
        });
    
        it('should show logout confirmation alert', () => {
            const alertSpy = jest.spyOn(Alert, 'alert');
            
            const menuButton = screen.getByTestId('menu-button');
            fireEvent.press(menuButton);
            
            const logoutButton = screen.getByTestId('drawer-button-logout');
            fireEvent.press(logoutButton);
            
            expect(alertSpy).toHaveBeenCalledWith(
                'Logout',
                'Are you sure you want to logout ?',
                expect.any(Array)
            );
        });
    
        it('should show delete account confirmation alert', () => {
            const alertSpy = jest.spyOn(Alert, 'alert');
            
            render(<UserPage />);
            
            const menuButton = screen.getByTestId('menu-button');
            fireEvent.press(menuButton);
            
            const deleteAccountButton = screen.getByTestId('drawer-button-delete-account');
            fireEvent.press(deleteAccountButton);
            
            expect(alertSpy).toHaveBeenCalledWith(
                'Delete account',
                'Are you sure you want to delete your account ? This action is irreversible.',
                expect.any(Array)
            );
        });
    });

    describe('Pull to refresh functionality', () => {
        it('should refresh user data when pull-to-refresh is triggered', async () => {
            const refreshUserData = jest.fn().mockResolvedValue(undefined);
            (useSession as jest.Mock).mockReturnValue({
                user: { id: '1', username: 'testuser' },
                userSneakers: [],
                refreshUserData
            });
    
            render(<UserPage />);
            
            const scrollView = screen.getByTestId('scroll-view');
            
            const refreshControl = scrollView.props.refreshControl;
            if (refreshControl && refreshControl.props.onRefresh) {
                await act(async () => {
                    await refreshControl.props.onRefresh();
                });
            }
            
            expect(refreshUserData).toHaveBeenCalled();
        });
    
        it('should show refreshing indicator during refresh', () => {
            render(<UserPage />);

            const scrollView = screen.getByTestId('scroll-view');
            const refreshControl = scrollView.props.refreshControl;
            
            expect(refreshControl.props.refreshing).toBe(false);
        });

        it('should handle refresh when user is null', async () => {
            const refreshUserData = jest.fn();
            (useSession as jest.Mock).mockReturnValue({
                user: null,
                userSneakers: [],
                refreshUserData
            });

            render(<UserPage />);
            
            const scrollView = screen.getByTestId('scroll-view');
            const refreshControl = scrollView.props.refreshControl;
            
            if (refreshControl && refreshControl.props.onRefresh) {
                await act(async () => {
                    await refreshControl.props.onRefresh();
                });
            }
            
            expect(refreshUserData).not.toHaveBeenCalled();
        });

        it('should set refreshing state correctly during refresh', async () => {
            const refreshUserData = jest.fn().mockImplementation(() => 
                new Promise(resolve => setTimeout(resolve, 100))
            );
            
            (useSession as jest.Mock).mockReturnValue({
                user: { id: '1', username: 'testuser' },
                userSneakers: [],
                refreshUserData
            });

            const { rerender } = render(<UserPage />);
            
            const scrollView = screen.getByTestId('scroll-view');
            const refreshControl = scrollView.props.refreshControl;
            
            expect(refreshControl.props.refreshing).toBe(false);
            
            if (refreshControl && refreshControl.props.onRefresh) {
                fireEvent.press(scrollView);
                await act(async () => {
                    await refreshControl.props.onRefresh();
                });
            }
            
            rerender(<UserPage />);
            
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 150));
            });
            
            rerender(<UserPage />);
            
            const finalScrollView = screen.getByTestId('scroll-view');
            const finalRefreshControl = finalScrollView.props.refreshControl;
            expect(finalRefreshControl.props.refreshing).toBe(false);
        });

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