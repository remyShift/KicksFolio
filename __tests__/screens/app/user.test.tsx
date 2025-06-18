import User from '@/app/(app)/(tabs)/user';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { ReactTestInstance } from 'react-test-renderer';

describe('User', () => {
    let profileHeader: ReactTestInstance;
    let profileInfo: ReactTestInstance;
    let pageTitle: ReactTestInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        render(<User />);

        profileHeader = screen.getByTestId('profile-header');
        profileInfo = screen.getByTestId('profile-info');
        pageTitle = screen.getByTestId('page-title');
    });

	it('should render the user page', () => {
        const profileHeader = screen.getByTestId('profile-header');
        const profileInfo = screen.getByTestId('profile-info');
        const pageTitle = screen.getByTestId('page-title');

        expect(profileHeader).toBeTruthy();
        expect(profileInfo).toBeTruthy();
        expect(pageTitle.props.children).toBe('Profile');
    });

    describe('Drawer', () => {
        let menuButton: ReactTestInstance;

        beforeEach(() => {
            jest.clearAllMocks();
            render(<User />);

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
    });
});