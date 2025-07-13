import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { SneakersModal } from '@/components/ui/modals/SneakersModal';
import { mockSneaker } from './modalSetup'; 
import { fillAndBlurInput } from '../../setup';

const mockUseModalStoreFn = jest.fn();
jest.mock('@/store/useModalStore', () => ({
    useModalStore: () => mockUseModalStoreFn(),
}));

const setup = (overrides = {}) => {
    const mockSetModalStep = jest.fn();
    const mockStore = {
        modalStep: 'index',
        isVisible: true,
        currentSneaker: null,
        sneakerSKU: '',
        fetchedSneaker: null,
        sneakerToAdd: null,
        errorMsg: '',
        validateForm: null,
        clearFormErrors: null,
        setModalStep: mockSetModalStep,
        setIsVisible: jest.fn(),
        setCurrentSneaker: jest.fn(),
        setSneakerSKU: jest.fn(),
        setFetchedSneaker: jest.fn(),
        setSneakerToAdd: jest.fn(),
        setErrorMsg: jest.fn(),
        setValidateForm: jest.fn(),
        setClearFormErrors: jest.fn(),
        resetModalData: jest.fn(),
        estimatedValue: 0,
        setEstimatedValue: jest.fn(),
        setGender: jest.fn(),
        setSku: jest.fn(),
        ...overrides,
    };

    mockSetModalStep.mockImplementation((newStep) => {
        mockStore.modalStep = newStep;
    });

    mockUseModalStoreFn.mockReturnValue(mockStore);
    return render(<SneakersModal />);
};

describe('SneakersModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        const mockSetModalStep = jest.fn();
        const mockStore = {
            modalStep: 'index',
            isVisible: true,
            currentSneaker: null,
            sneakerSKU: '',
            fetchedSneaker: null,
            sneakerToAdd: null,
            errorMsg: '',
            validateForm: null,
            clearFormErrors: null,
            estimatedValue: 0,
            setModalStep: mockSetModalStep,
            setIsVisible: jest.fn(),
            setCurrentSneaker: jest.fn(),
            setSneakerSKU: jest.fn(),
            setFetchedSneaker: jest.fn(),
            setSneakerToAdd: jest.fn(),
            setErrorMsg: jest.fn(),
            setValidateForm: jest.fn(),
            setClearFormErrors: jest.fn(),
            resetModalData: jest.fn(),
            setEstimatedValue: jest.fn(),
            setGender: jest.fn(),
            setSku: jest.fn(),
        };

        mockSetModalStep.mockImplementation((newStep) => {
            mockStore.modalStep = newStep;
        });

        mockUseModalStoreFn.mockReturnValue(mockStore);
    });

    describe('Modal visibility', () => {
        it('should not render if isVisible is false', () => {
            mockUseModalStoreFn.mockReturnValue({ isVisible: false });
            const { queryByTestId } = render(<SneakersModal />);
            expect(queryByTestId('sneakers-modal')).not.toBeOnTheScreen();
        });

        it('should render if isVisible is true', () => {
            setup({ isVisible: true });
            expect(screen.getByTestId('sneakers-modal')).toBeOnTheScreen();
        });
    });

    describe('InitialStep (index)', () => {
        beforeEach(() => {
            setup({ modalStep: 'index' });
        });

        it('should render InitialStep with correct content', () => {
            expect(screen.getByText(/add/i)).toBeOnTheScreen();
            expect(screen.getByText(/how do you want to proceed/i)).toBeOnTheScreen();
        });

        it('should have SKU search button', () => {
            expect(screen.getByText(/search/i)).toBeOnTheScreen();
        });

        it('should have barcode search button', () => {
            expect(screen.getByText('Barcode')).toBeOnTheScreen();
        });

        it('should have manual add button', () => {
            expect(screen.getByText('Manually')).toBeOnTheScreen();
        });
    });

    describe('SkuStep (sku)', () => {
        beforeEach(() => {
            setup({ modalStep: 'sku' });
        });

        it('should render SkuStep with correct content', () => {
            expect(screen.getByText(/put your sneaker SKU or model below/i)).toBeOnTheScreen();
            expect(screen.getByPlaceholderText('CJ5482-100 | Air Force 1')).toBeOnTheScreen();
        });

        it('should have search button', () => {
            expect(screen.getByTestId('search-button')).toBeOnTheScreen();
        });

        it('should have back button', () => {
            expect(screen.getByTestId('back-button')).toBeOnTheScreen();
        });
    });

    describe('FormDetailsStep (addFormDetails)', () => {
        let modelInput: any;
        let brandInput: any;
        let statusInput: any;
        let sizeInput: any;
        let conditionInput: any;
        let priceInput: any;
        let descriptionInput: any;
        let mainButton: any;
        let errorMessage: any;

        beforeEach(() => {
            setup({ modalStep: 'addFormDetails' });
            
            modelInput = screen.getByTestId('model-input');
            brandInput = screen.getByTestId('brand-input');
            statusInput = screen.getByTestId('status-input');
            sizeInput = screen.getByTestId('size-input');
            conditionInput = screen.getByTestId('condition-input');
            priceInput = screen.getByTestId('price-input');
            descriptionInput = screen.getByTestId('description-input');
            mainButton = screen.getByTestId('add-button');
        });

        it('should render FormDetailsStep with all form fields', () => {
            expect(modelInput).toBeOnTheScreen();
            expect(brandInput).toBeOnTheScreen();
            expect(statusInput).toBeOnTheScreen();
            expect(sizeInput).toBeOnTheScreen();
            expect(conditionInput).toBeOnTheScreen();
            expect(priceInput).toBeOnTheScreen();
            expect(descriptionInput).toBeOnTheScreen();
        });

        it('should render form fields with empty values initially', () => {
            expect(modelInput.props.value).toBe('');
            expect(screen.getByTestId('brand-input-value').props.children).toBe('Nike');
            expect(screen.getByTestId('status-input-value').props.children).toBe('ROCKING');
            expect(sizeInput.props.value).toBe('');
            expect(conditionInput.props.value).toBe('');
            expect(priceInput.props.value).toBe('');
            expect(descriptionInput.props.value).toBe('');
        });

        describe('form focus', () => {
            it('should display fields with orange border on focus', async () => {
                await act(async () => {
                    fireEvent(modelInput, 'focus');
                });
                await act(async () => {
                    fireEvent(brandInput, 'press');
                });

                await act(async () => {
                    fireEvent(statusInput, 'press');
                });

                await act(async () => {
                    fireEvent(sizeInput, 'focus');
                });

                await act(async () => {
                    fireEvent(conditionInput, 'focus');
                });

                await act(async () => {
                    fireEvent(priceInput, 'focus');
                });

                await act(async () => {
                    fireEvent(descriptionInput, 'focus');
                });

                expect(modelInput.props.className).toContain('border-2 border-orange-500');
                expect(brandInput.props.className).toContain('border-2 border-primary');
                expect(statusInput.props.className).toContain('border-2 border-primary');
                expect(sizeInput.props.className).toContain('border-2 border-orange-500');
                expect(conditionInput.props.className).toContain('border-2 border-orange-500');
                expect(priceInput.props.className).toContain('border-2 border-orange-500');
                expect(descriptionInput.props.className).toContain('border-2 border-orange-500');
            });
        });

        describe('form validation', () => {
            describe('model field validation', () => {
                it('should display error if model is less than 2 characters on blur', async () => {
                    await fillAndBlurInput(modelInput, 'A');
                    errorMessage = screen.getByTestId('error-message');

                    expect(errorMessage.props.children).toBe('Sneaker model must be at least 2 characters long.');
                });

                it('should display error if model contains brand name on blur', async () => {
                    await fillAndBlurInput(modelInput, 'Nike Air Max');
                    errorMessage = screen.getByTestId('error-message');
                    expect(errorMessage.props.children).toBe('The model cannot contain the brand.');
                });
            });

            describe('size field validation', () => {
                it('should display error if size is less than 7 on blur', async () => {
                    await fillAndBlurInput(sizeInput, '6.5');
                    errorMessage = screen.getByTestId('error-message');

                    expect(errorMessage.props.children).toBe('Size must be between 7 and 15 (US).');
                });

                it('should display error if size is greater than 15 on blur', async () => {
                    await fillAndBlurInput(sizeInput, '15.5');
                    errorMessage = screen.getByTestId('error-message');

                    expect(errorMessage.props.children).toBe('Size must be between 7 and 15 (US).');
                });

                it('should display error if size is not a multiple of 0.5 on blur', async () => {
                    await fillAndBlurInput(sizeInput, '9.3');
                    errorMessage = screen.getByTestId('error-message');

                    expect(errorMessage.props.children).toBe('Size must be a multiple of 0.5 (e.g., 7, 7.5, 8, 8.5).');
                });

                it('should display error if size is not a number on blur', async () => {
                    await fillAndBlurInput(sizeInput, 'a');
                    errorMessage = screen.getByTestId('error-message');

                    expect(errorMessage.props.children).toBe('Size must be between 7 and 15 (US).');
                });
            });

            describe('condition field validation', () => {
                it('should display error if condition is less than 0 on blur', async () => {
                    await fillAndBlurInput(conditionInput, '-1');
                    errorMessage = screen.getByTestId('error-message');

                    expect(errorMessage.props.children).toBe('Condition must be between 1 and 10.');
                });

                it('should display error if condition is greater than 10 on blur', async () => {
                    await fillAndBlurInput(conditionInput, '11');
                    errorMessage = screen.getByTestId('error-message');

                    expect(errorMessage.props.children).toBe('Condition must be between 1 and 10.');
                });

                it('should display error if condition is not a number on blur', async () => {
                    await fillAndBlurInput(conditionInput, 'a');
                    errorMessage = screen.getByTestId('error-message');

                    expect(errorMessage.props.children).toBe('Condition must be between 1 and 10.');
                });
            });

            describe('price field validation', () => {
                it('should display error if price is negative on blur', async () => {
                    await fillAndBlurInput(priceInput, '-50');
                    errorMessage = screen.getByTestId('error-message');
                    expect(errorMessage.props.children).toBe('Please enter a valid price.');
                });

                it('should display error if price is not a number on blur', async () => {
                    await fillAndBlurInput(priceInput, 'a');
                    errorMessage = screen.getByTestId('error-message');

                    expect(errorMessage.props.children).toBe('Please enter a valid price.');
                });
            });

            describe('displaying fields with red border', () => {
                it('should display fields with red border if errors are present', async () => {
                    await fillAndBlurInput(modelInput, 'A');
                    await fillAndBlurInput(sizeInput, '6');
                    await fillAndBlurInput(conditionInput, '11');
                    await fillAndBlurInput(priceInput, '-50');

                    expect(modelInput.props.className).toContain('border-2 border-red-500');
                    expect(sizeInput.props.className).toContain('border-2 border-red-500');
                    expect(conditionInput.props.className).toContain('border-2 border-red-500');
                    expect(priceInput.props.className).toContain('border-2 border-red-500');
                });
            });
        });
    });

    describe('EditFormStep (editForm)', () => {
        let modelInput: any;
        let brandInput: any;
        let statusInput: any;
        let sizeInput: any;
        let conditionInput: any;
        let priceInput: any;
        let descriptionInput: any;
        let mainButton: any;
        let errorMessage: any;

        beforeEach(() => {
            setup({ 
                modalStep: 'editForm', 
                currentSneaker: mockSneaker 
            });
            
            modelInput = screen.getByTestId('model-input');
            brandInput = screen.getByTestId('brand-input');
            statusInput = screen.getByTestId('status-input');
            sizeInput = screen.getByTestId('size-input');
            conditionInput = screen.getByTestId('condition-input');
            priceInput = screen.getByTestId('price-input');
            descriptionInput = screen.getByTestId('description-input');
            mainButton = screen.getByTestId('edit-button');
        });

        it('should render EditFormStep with pre-filled values', () => {
            expect(modelInput.props.value).toBe('Air Max 1');
            expect(screen.getByTestId('brand-input-value').props.children).toBe('NIKE');
        });

        it('should have update button', () => {
            expect(screen.getByTestId('edit-button')).toBeOnTheScreen();
        });

        it('should have delete button', () => {
            expect(screen.getByTestId('delete-button')).toBeOnTheScreen();
        });

        describe('form validation', () => {
            it('should display error if model is invalid on blur', async () => {
                await fillAndBlurInput(modelInput, 'A');
                errorMessage = screen.getByTestId('error-message');
                expect(errorMessage.props.children).toBe('Sneaker model must be at least 2 characters long.');
            });

            it('should display error if size is invalid on blur', async () => {
                await fillAndBlurInput(sizeInput, '6');
                errorMessage = screen.getByTestId('error-message');
                expect(errorMessage.props.children).toBe('Size must be between 7 and 15 (US).');
            });
        });
    });

    describe('ViewStep (view)', () => {
        beforeEach(() => {
            setup({ 
                modalStep: 'view', 
                currentSneaker: mockSneaker 
            });
        });

        it('should render ViewStep with sneaker details', () => {
            expect(screen.getByText('Air Max 1')).toBeOnTheScreen();
            expect(screen.getByText('NIKE')).toBeOnTheScreen();
            expect(screen.getByText('ROCKING')).toBeOnTheScreen();
        });

        it('should have edit button', () => {
            expect(screen.getByTestId('edit-button')).toBeOnTheScreen();
        });

        it('should have next button', () => {
            expect(screen.getByTestId('next-button')).toBeOnTheScreen();
        });

        it('should render the edit form step when edit button is pressed', () => {
            const mockSetModalStep = jest.fn();
            setup({ 
                modalStep: 'view', 
                currentSneaker: mockSneaker,
                setModalStep: mockSetModalStep
            });

            act(() => {
                fireEvent.press(screen.getByTestId('edit-button'));
            });
            
            expect(mockSetModalStep).toHaveBeenCalledWith('editForm');
        });
    });
}); 