import User from '@/app/(app)/(tabs)/user';
import { render, screen } from '@testing-library/react-native';

describe('User page', () => {
    it('should render the user page', () => {
        render(<User />);
        expect(screen.getByTestId('user')).toBeOnTheScreen();
    });
});