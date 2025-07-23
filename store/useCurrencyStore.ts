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
		return AsyncStorage.setItem(CURRENCY_STORAGE_KEY, currency)
			.then(() => {
				set({ currentCurrency: currency });
			})
			.catch((error) => {
				console.error('❌ Error saving currency:', error);
			});
	},

	initializeCurrency: async () => {
		const { currentLanguage } = useLanguageStore.getState();

		return AsyncStorage.getItem(CURRENCY_STORAGE_KEY)
			.then((savedCurrency) => {
				if (
					savedCurrency &&
					(savedCurrency === 'USD' || savedCurrency === 'EUR')
				) {
					return savedCurrency as Currency;
				}

				const defaultCurrency =
					currentLanguage === 'fr' ? 'EUR' : 'USD';
				return AsyncStorage.setItem(
					CURRENCY_STORAGE_KEY,
					defaultCurrency
				).then(() => {
					return defaultCurrency;
				});
			})
			.then((currencyToUse) => {
				set({
					currentCurrency: currencyToUse,
					isInitialized: true,
				});
			})
			.catch((error) => {
				console.error('❌ Error in initialization:', error);
				const defaultCurrency =
					currentLanguage === 'fr' ? 'EUR' : 'USD';
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
