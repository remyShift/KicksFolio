jest.mock('@/store/useSizeUnitStore', () => ({
	useSizeUnitStore: Object.assign(
		() => ({
			currentUnit: 'US',
			isInitialized: true,
			setUnit: jest.fn(),
			initializeUnit: jest.fn().mockResolvedValue(undefined),
			getCurrentUnit: jest.fn().mockReturnValue('US'),
		}),
		{
			getState: () => ({
				currentUnit: 'US',
				isInitialized: true,
				setUnit: jest.fn(),
				initializeUnit: jest.fn().mockResolvedValue(undefined),
				getCurrentUnit: jest.fn().mockReturnValue('US'),
			}),
			subscribe: jest.fn().mockReturnValue(() => {}),
		}
	),
}));

jest.mock('@/store/useModalStore', () => ({
	useModalStore: () => ({
		modalStep: 'index',
		isVisible: false,
		currentSneaker: null,
		sneakerSKU: '',
		fetchedSneaker: null,
		sneakerToAdd: null,
		errorMsg: '',
		validateForm: null,
		clearFormErrors: null,
		estimatedValue: 0,
		setModalStep: jest.fn(),
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
		resetModal: jest.fn(),
	}),
}));

jest.mock('@/store/useListViewStore', () => ({
	useListViewStore: () => ({
		isListView: false,
		setIsListView: jest.fn(),
		toggleView: jest.fn(),
	}),
}));

jest.mock('@/store/useCurrencyStore', () => ({
	useCurrencyStore: () => ({
		currency: 'EUR',
		setCurrency: jest.fn(),
		formattedPrice: jest.fn((price) => `€${price}`),
	}),
}));

jest.mock('@/store/useLanguageStore', () => ({
	useLanguageStore: Object.assign(
		() => ({
			language: 'en',
			setLanguage: jest.fn(),
			currentLanguage: 'en',
		}),
		{
			getState: () => ({
				language: 'en',
				setLanguage: jest.fn(),
				currentLanguage: 'en',
			}),
			subscribe: jest.fn().mockReturnValue(() => {}),
		}
	),
}));
