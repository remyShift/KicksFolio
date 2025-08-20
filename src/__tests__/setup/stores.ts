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
		nextSneaker: null,
		prevSneaker: null,
		sneakerSKU: '',
		fetchedSneaker: null,
		sneakerToAdd: null,
		errorMsg: '',
		validateForm: null,
		clearFormErrors: null,
		estimatedValue: null,
		gender: null,
		sku: null,
		setModalStep: jest.fn(),
		setIsVisible: jest.fn(),
		setCurrentSneaker: jest.fn(),
		setNextSneaker: jest.fn(),
		setPrevSneaker: jest.fn(),
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
		setIsLoading: jest.fn(),
	}),
}));

jest.mock('@/store/useCurrencyStore', () => ({
	useCurrencyStore: () => ({
		currentCurrency: 'EUR',
		isInitialized: true,
		currencyHandler: {
			convertPrice: jest.fn((price) => price),
		},
		setCurrency: jest.fn(),
		initializeCurrency: jest.fn(),
		getCurrentCurrency: jest.fn().mockReturnValue('EUR'),
		convertAndFormatdPrice: jest.fn((price) => `€${price.toFixed(2)}`),
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

jest.mock('@/store/useViewDisplayStateStore', () => ({
	useViewDisplayStateStore: () => ({
		viewDisplayState: 'card' as const,
		setViewDisplayState: jest.fn(),
	}),
	ViewDisplayState: {
		Card: 'card',
		List: 'list',
	},
}));
