import Settings from '@/app/(app)/settings';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { useAuth } from '@/hooks/useAuth';
import { useSession } from '@/context/authContext';
import { Alert, Linking } from 'react-native';
import { router } from 'expo-router';

jest.mock('@/hooks/useAuth');
jest.mock('@/context/authContext');
jest.mock('react-native/Libraries/Alert/Alert', () => ({
    alert: jest.fn(),
}));
jest.mock('react-native/Libraries/Linking/Linking', () => ({
    openURL: jest.fn(),
}));

describe('Settings', () => {
    const mockLogout = jest.fn();
    const mockDeleteAccount = jest.fn();
    const mockUser = { id: 'test-user-id', username: 'testuser' };

    beforeEach(() => {
        jest.clearAllMocks();
        
        (useAuth as jest.Mock).mockReturnValue({
            logout: mockLogout,
            deleteAccount: mockDeleteAccount,
        });
        
        (useSession as jest.Mock).mockReturnValue({
            user: mockUser,
        });
    });

    it('should render settings page with all menu items', () => {
        render(<Settings />);

        expect(screen.getByTestId('drawer-button-logout')).toBeOnTheScreen();
        expect(screen.getByTestId('drawer-button-edit-profile')).toBeOnTheScreen();
        expect(screen.getByTestId('drawer-button-delete-account')).toBeOnTheScreen();
        expect(screen.getByText('Privacy Policy')).toBeOnTheScreen();
    });

    it('should show logout confirmation alert when logout is pressed', () => {
        const alertSpy = jest.spyOn(Alert, 'alert');
        
        render(<Settings />);
        
        const logoutButton = screen.getByTestId('drawer-button-logout');
        fireEvent.press(logoutButton);
        
        expect(alertSpy).toHaveBeenCalledWith(
            'Logout',
            'Are you sure you want to logout ?',
            expect.arrayContaining([
                expect.objectContaining({ text: 'Cancel', style: 'cancel' }),
                expect.objectContaining({ 
                    text: 'Logout', 
                    style: 'destructive'
                })
            ])
        );
    });

    it('should call logout when confirmation is accepted', () => {
        const alertSpy = jest.spyOn(Alert, 'alert');
        
        render(<Settings />);
        
        const logoutButton = screen.getByTestId('drawer-button-logout');
        fireEvent.press(logoutButton);
        
        const alertCall = alertSpy.mock.calls[0];
        const actions = alertCall?.[2];
        const logoutAction = actions?.find((action: any) => action.text === 'Logout');
        
        if (logoutAction?.onPress) {
            logoutAction.onPress();
        }
        
        expect(mockLogout).toHaveBeenCalled();
    });

    it('should navigate to edit profile when edit profile is pressed', () => {
        render(<Settings />);
        
        const editProfileButton = screen.getByTestId('drawer-button-edit-profile');
        fireEvent.press(editProfileButton);
        
        expect(router.push).toHaveBeenCalledWith('/edit-profile');
    });

    it('should open privacy policy URL when privacy policy is pressed', () => {
        const linkingSpy = jest.spyOn(Linking, 'openURL');
        
        render(<Settings />);
        
        const privacyPolicyButton = screen.getByText('Privacy Policy');
        fireEvent.press(privacyPolicyButton);
        
        expect(linkingSpy).toHaveBeenCalledWith('https://remyshift.github.io/KicksFolio/');
    });

    it('should show delete account confirmation alert when delete account is pressed', () => {
        const alertSpy = jest.spyOn(Alert, 'alert');
        
        render(<Settings />);
        
        const deleteAccountButton = screen.getByTestId('drawer-button-delete-account');
        fireEvent.press(deleteAccountButton);
        
        expect(alertSpy).toHaveBeenCalledWith(
            'Delete account',
            'Are you sure you want to delete your account ? This action is irreversible.',
            expect.arrayContaining([
                expect.objectContaining({ text: 'Cancel', style: 'cancel' }),
                expect.objectContaining({ 
                    text: 'Delete', 
                    style: 'destructive'
                })
            ])
        );
    });

    it('should call deleteAccount and logout when delete confirmation is accepted', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');
        mockDeleteAccount.mockResolvedValue(undefined);
        
        render(<Settings />);
        
        const deleteAccountButton = screen.getByTestId('drawer-button-delete-account');
        fireEvent.press(deleteAccountButton);
        
        const alertCall = alertSpy.mock.calls[0];
        const actions = alertCall?.[2];
        const deleteAction = actions?.find((action: any) => action.text === 'Delete');
        
        if (deleteAction?.onPress) {
            await deleteAction.onPress();
        }
        
        expect(mockDeleteAccount).toHaveBeenCalledWith(mockUser.id);
        expect(mockLogout).toHaveBeenCalled();
    });
}); 