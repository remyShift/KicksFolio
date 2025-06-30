import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguageStore } from './useLanguageStore';

export type Currency = 'USD' | 'EUR';

interface CurrencyStore {
	currentCurrency: Currency;
	isInitialized: boolean;

	setCurrency: (currency: Currency) => Promise<void>;
	initializeCurrency: () => Promise<void>;
	getCurrentCurrency: () => Currency;
	formattedPrice: (price: number) => string;
}

const CURRENCY_STORAGE_KEY = 'app_currency';

const exchangeRates = {
	USD: 1,
	EUR: 0.85,
};

export const useCurrencyStore = create<CurrencyStore>((set, get) => ({
	currentCurrency: 'USD',
	isInitialized: false,

	setCurrency: async (currency: Currency) => {
		console.log('🔄 Attempting to save currency:', currency);
		return AsyncStorage.setItem(CURRENCY_STORAGE_KEY, currency)
			.then(() => {
				set({ currentCurrency: currency });
				console.log(
					`✅ Currency saved and state updated to: ${currency}`
				);
			})
			.catch((error) => {
				console.error('❌ Error saving currency:', error);
			});
	},

	initializeCurrency: async () => {
		const { currentLanguage } = useLanguageStore.getState();
		console.log(
			'🔄 Initializing currency, current language:',
			currentLanguage
		);

		return AsyncStorage.getItem(CURRENCY_STORAGE_KEY)
			.then((savedCurrency) => {
				console.log('📦 Retrieved from storage:', savedCurrency);

				if (
					savedCurrency &&
					(savedCurrency === 'USD' || savedCurrency === 'EUR')
				) {
					console.log('✅ Using saved currency:', savedCurrency);
					return savedCurrency as Currency;
				}

				const defaultCurrency =
					currentLanguage === 'fr' ? 'EUR' : 'USD';
				console.log('📝 Setting default currency:', defaultCurrency);
				return AsyncStorage.setItem(
					CURRENCY_STORAGE_KEY,
					defaultCurrency
				).then(() => {
					console.log('✅ Default currency saved:', defaultCurrency);
					return defaultCurrency;
				});
			})
			.then((currencyToUse) => {
				console.log('🔄 Updating store state to:', currencyToUse);
				set({
					currentCurrency: currencyToUse,
					isInitialized: true,
				});
				console.log(`✅ Store state updated to: ${currencyToUse}`);
			})
			.catch((error) => {
				console.error('❌ Error in initialization:', error);
				const defaultCurrency =
					currentLanguage === 'fr' ? 'EUR' : 'USD';
				console.log('⚠️ Using fallback currency:', defaultCurrency);
				set({
					currentCurrency: defaultCurrency,
					isInitialized: true,
				});
			});
	},

	formattedPrice: (price: number) => {
		const priceExchange = exchangeRates[get().currentCurrency];
		const priceInCurrency = price * priceExchange;

		switch (get().currentCurrency) {
			case 'USD':
				return `$${priceInCurrency.toFixed(2)}`;
			case 'EUR':
				return `${priceInCurrency.toFixed(2)}€`;
			default:
				return `$${priceInCurrency.toFixed(2)}`;
		}
	},

	getCurrentCurrency: () => get().currentCurrency,
}));
