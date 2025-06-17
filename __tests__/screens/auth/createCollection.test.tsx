import { fillAndBlurInput } from '@/__tests__/setup';
import CreateCollectionPage from '@/app/(auth)/(signup)/collection';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { ReactTestInstance } from 'react-test-renderer';
import { mockUseCollections } from './authSetup';

describe('CreateCollectionPage', () => {
    let collectionNameInput: ReactTestInstance;
    let mainButton: ReactTestInstance;
    let pageTitle: ReactTestInstance;
    let errorMessage: ReactTestInstance;

    beforeEach(() => {
        render(<CreateCollectionPage />);

        collectionNameInput = screen.getByPlaceholderText('My Sneakers Collection');
        mainButton = screen.getByTestId('main-button');
        pageTitle = screen.getByTestId('page-title');
        errorMessage = screen.getByTestId('error-message');
    });

    it('should render the page', async () => {
		expect(pageTitle.props.children).toBe('Welcome to KicksFolio !');
        expect(collectionNameInput).toBeTruthy();
        expect(mainButton).toBeTruthy();
    });

    describe('form focus', () => {
        it('should display fields with a orange border on focus', async () => {
            await act(async () => {
                fireEvent(collectionNameInput, 'focus');
            });

            expect(collectionNameInput.props.className).toContain('border-2 border-orange-500');
        });
    });

    describe('form validation', () => {
        it('should have the main button disabled if the collection name is not provided', async () => {
            expect(mainButton.props.accessibilityState.disabled).toBe(true);
        });

        it('should display an error message if the collection name is not 4 characters long', async () => {
            await fillAndBlurInput(collectionNameInput, 'My');
            expect(errorMessage.props.children).toBe('Collection name is required and must be at least 4 characters long.');
        });

        it('should have the main button enabled if the collection name is provided with appropriate value', async () => {
            await fillAndBlurInput(collectionNameInput, 'My Sneakers Collection');
            expect(mainButton.props.accessibilityState.disabled).toBe(false);
        });
    });

    describe('Create collection attempts', () => {
        it('should call the createCollection function if the collection name is provided with appropriate value', async () => {
            await fillAndBlurInput(collectionNameInput, 'My Sneakers Collection');
            await act(async () => {
                fireEvent.press(mainButton);
            });

            expect(mockUseCollections.createCollection).toHaveBeenCalledWith('My Sneakers Collection');
        });
    });
});