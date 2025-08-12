import AsyncStorage from '@react-native-async-storage/async-storage';

import { create } from 'zustand';

import { currencyProvider } from '@/d/CurrencyProvider';
import { CurrencyHandler } from '@/domain/CurrencyProvider';
import { Currency } from '@/types/currency';

import { useLanguageStore } from './useLanguageStore';

interface CurrencyStore {
	currentCurrency: Currency;
	isInitialized: boolean;
	currencyHandler: CurrencyHandler;

	setCurrency: (currency: Currency) => Promise<void>;
	initializeCurrency: () => Promise<void>;
	getCurrentCurrency: () => Currency;
	convertAndFormatdPrice: (price: number, currency: Currency) => string;
}

const CURRENCY_SYMBOLS = {
	USD: '$',
	EUR: '€',
} as const;

const CURRENCY_STORAGE_KEY = 'app_currency';

export const useCurrencyStore = create<CurrencyStore>((set, get) => ({
	currentCurrency: 'USD',
	isInitialized: false,

	currencyHandler: new CurrencyHandler(currencyProvider),

	setCurrency: async (currency: Currency) => {
		return AsyncStorage.setItem(CURRENCY_STORAGE_KEY, currency)
			.then(() => {
				set({
					currentCurrency: currency,
				});
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
				console.log('✅ Currency initialized to:', currencyToUse);
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

	convertAndFormatdPrice: (price: number, currency: Currency): string => {
		const convertedPrice = get().currencyHandler.convertPrice(
			price,
			'USD',
			currency
		);
		const symbol = CURRENCY_SYMBOLS[currency];

		switch (currency) {
			case 'USD':
				return `${symbol}${convertedPrice.toFixed(2)}`;
			case 'EUR':
				return `${convertedPrice.toFixed(2)}${symbol}`;
			default:
				return `${symbol}${convertedPrice.toFixed(2)}`;
		}
	},

	getCurrentCurrency: () => get().currentCurrency,
}));
