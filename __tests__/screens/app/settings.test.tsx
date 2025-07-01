import Settings from '@/app/(app)/settings';
import { render, screen } from '@testing-library/react-native';

describe('Settings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the settings page', () => {
        render(<Settings />);

        const settingsContainer = screen.getByTestId('settings-container');
        expect(settingsContainer).toBeOnTheScreen();
    });

    it('should render the page title', () => {
        render(<Settings />);

        const pageTitle = screen.getByTestId('page-title');
        expect(pageTitle).toBeTruthy();
        expect(pageTitle.props.children).toBe('Settings');
    });

    it('should render the settings content', () => {
        render(<Settings />);

        const settingsContent = screen.getByTestId('settings-content');
        expect(settingsContent).toBeOnTheScreen();
    });

    it('should render account settings section', () => {
        render(<Settings />);

        const accountSettings = screen.getByText('Account Settings');
        expect(accountSettings).toBeOnTheScreen();
    });

    it('should render app settings section', () => {
        render(<Settings />);

        const appSettings = screen.getByText('App Settings');
        expect(appSettings).toBeOnTheScreen();
    });
}); 