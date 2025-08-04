import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguageStore } from '@/store/useLanguageStore';

vi.mock('@react-native-async-storage/async-storage', () => ({
	default: {
		setItem: vi.fn(),
		getItem: vi.fn(),
		removeItem: vi.fn(),
	},
}));

vi.mock('@/store/useLanguageStore', () => ({
	useLanguageStore: {
		getState: vi.fn(() => ({
			currentLanguage: 'en',
		})),
	},
}));

vi.mock('@/domain/CurrencyProvider', () => ({
	currencyProvider: {
		formatPrice: vi.fn((price: number, currency: string) => {
			// Simuler la conversion dans formatPrice comme dans la vraie implémentation
			const convertedPrice = currency === 'EUR' ? price * 0.85 : price;
			if (currency === 'EUR') return `${convertedPrice.toFixed(2)}€`;
			return `$${convertedPrice.toFixed(2)}`;
		}),
		convertPrice: vi.fn(
			(price: number, fromCurrency: string, toCurrency: string) => {
				if (fromCurrency === toCurrency) return price;
				if (fromCurrency === 'USD' && toCurrency === 'EUR')
					return price * 0.85;
				if (fromCurrency === 'EUR' && toCurrency === 'USD')
					return price / 0.85;
				return price;
			}
		),
		getExchangeRate: vi.fn(),
		getSupportedCurrencies: vi.fn(),
	},
}));

describe('useCurrencyStore', () => {
	beforeEach(() => {
		useCurrencyStore.setState({
			currentCurrency: 'USD',
			isInitialized: false,
		});
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	describe('initial state', () => {
		it('should have correct initial state', () => {
			const state = useCurrencyStore.getState();
			expect(state.currentCurrency).toBe('USD');
			expect(state.isInitialized).toBe(false);
		});
	});

	describe('getCurrentCurrency', () => {
		it('should return current currency', () => {
			const { getCurrentCurrency } = useCurrencyStore.getState();
			expect(getCurrentCurrency()).toBe('USD');
		});
	});

	describe('setCurrency', () => {
		it('should set currency successfully', async () => {
			const mockSetItem = vi.mocked(AsyncStorage.setItem);
			mockSetItem.mockResolvedValue();

			const { setCurrency } = useCurrencyStore.getState();
			await setCurrency('EUR');

			expect(mockSetItem).toHaveBeenCalledWith('app_currency', 'EUR');
			expect(useCurrencyStore.getState().currentCurrency).toBe('EUR');
		});

		it('should handle AsyncStorage errors gracefully', async () => {
			const mockSetItem = vi.mocked(AsyncStorage.setItem);
			mockSetItem.mockRejectedValue(new Error('Storage error'));
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			const { setCurrency } = useCurrencyStore.getState();
			await setCurrency('EUR');

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ Error saving currency:',
				expect.any(Error)
			);
			consoleSpy.mockRestore();
		});
	});

	describe('initializeCurrency', () => {
		it('should initialize with saved currency', async () => {
			const mockGetItem = vi.mocked(AsyncStorage.getItem);
			mockGetItem.mockResolvedValue('EUR');

			const { initializeCurrency } = useCurrencyStore.getState();
			await initializeCurrency();

			expect(useCurrencyStore.getState().currentCurrency).toBe('EUR');
			expect(useCurrencyStore.getState().isInitialized).toBe(true);
		});

		it('should initialize with French default when language is French', async () => {
			const mockGetItem = vi.mocked(AsyncStorage.getItem);
			const mockSetItem = vi.mocked(AsyncStorage.setItem);
			const mockGetState = vi.mocked(useLanguageStore.getState);

			mockGetItem.mockResolvedValue(null);
			mockSetItem.mockResolvedValue();
			mockGetState.mockReturnValue({ currentLanguage: 'fr' } as any);

			const { initializeCurrency } = useCurrencyStore.getState();
			await initializeCurrency();

			expect(mockSetItem).toHaveBeenCalledWith('app_currency', 'EUR');
			expect(useCurrencyStore.getState().currentCurrency).toBe('EUR');
			expect(useCurrencyStore.getState().isInitialized).toBe(true);
		});

		it('should initialize with USD default when language is English', async () => {
			const mockGetItem = vi.mocked(AsyncStorage.getItem);
			const mockSetItem = vi.mocked(AsyncStorage.setItem);

			mockGetItem.mockResolvedValue(null);
			mockSetItem.mockResolvedValue();

			const { initializeCurrency } = useCurrencyStore.getState();
			await initializeCurrency();

			expect(mockSetItem).toHaveBeenCalledWith('app_currency', 'USD');
			expect(useCurrencyStore.getState().currentCurrency).toBe('USD');
			expect(useCurrencyStore.getState().isInitialized).toBe(true);
		});

		it('should handle initialization errors gracefully', async () => {
			const mockGetItem = vi.mocked(AsyncStorage.getItem);
			const mockGetState = vi.mocked(useLanguageStore.getState);
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			mockGetItem.mockRejectedValue(new Error('Storage error'));
			mockGetState.mockReturnValue({ currentLanguage: 'en' } as any);

			const { initializeCurrency } = useCurrencyStore.getState();
			await initializeCurrency();

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ Error in initialization:',
				expect.any(Error)
			);
			expect(useCurrencyStore.getState().currentCurrency).toBe('USD');
			expect(useCurrencyStore.getState().isInitialized).toBe(true);

			consoleSpy.mockRestore();
		});
	});

	describe('formattedPrice', () => {
		it('should format price using CurrencyProvider', async () => {
			const { formattedPrice } = useCurrencyStore.getState();
			const result = await formattedPrice(100);

			expect(result).toBe('$100.00');
		});

		it('should format EUR price correctly', async () => {
			useCurrencyStore.setState({ currentCurrency: 'EUR' });

			const { formattedPrice } = useCurrencyStore.getState();
			const result = await formattedPrice(100);

			expect(result).toBe('85.00€');
		});

		it('should handle formatting errors gracefully', async () => {
			vi.resetModules();
			vi.doMock('@/domain/CurrencyProvider', () => ({
				currencyProvider: {
					formatPrice: vi.fn(() => {
						throw new Error('Format error');
					}),
				},
			}));

			vi.doMock('@/interfaces/CurrencyProviderInterface', () => ({
				CurrencyProviderInterface: {
					formatPrice: vi
						.fn()
						.mockImplementation(
							async (price, currency, formatFunction) => {
								try {
									return formatFunction(price, currency);
								} catch (error) {
									console.error(
										'Error formatting price:',
										error
									);
									return `$${price.toFixed(2)}`;
								}
							}
						),
				},
			}));

			const { useCurrencyStore: testStore } = await import(
				'@/store/useCurrencyStore'
			);

			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			const { formattedPrice } = testStore.getState();
			const result = await formattedPrice(100);

			expect(result).toBe('$100.00');
			expect(consoleSpy).toHaveBeenCalledWith(
				'Error formatting price:',
				expect.any(Error)
			);

			consoleSpy.mockRestore();
		});
	});
});
