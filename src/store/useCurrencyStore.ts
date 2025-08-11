import AsyncStorage from '@react-native-async-storage/async-storage';

import { create } from 'zustand';

import { currencyProvider } from '@/d/CurrencyProvider';
import { CurrencyProvider } from '@/domain/CurrencyProvider';
import { Currency } from '@/types/currency';

import { useLanguageStore } from './useLanguageStore';

interface CurrencyStore {
	currentCurrency: Currency;
	isInitialized: boolean;
	currencyProvider: CurrencyProvider;

	setCurrency: (currency: Currency) => Promise<void>;
	initializeCurrency: () => Promise<void>;
	getCurrentCurrency: () => Currency;
	formattedPrice: (price: number) => Promise<string>;
	formattedPriceAsync: (price: number) => Promise<string>;
}

const CURRENCY_STORAGE_KEY = 'app_currency';

export const useCurrencyStore = create<CurrencyStore>((set, get) => ({
	currentCurrency: 'USD',
	isInitialized: false,

	currencyProvider: new CurrencyProvider(currencyProvider),

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

	formattedPrice: async (price: number) => {
		try {
			return await get().currencyProvider.formatPrice(
				price,
				get().currentCurrency
			);
		} catch (error) {
			console.error('❌ Error formatting price:', error);
			return `$${price.toFixed(2)}`;
		}
	},

	formattedPriceAsync: async (price: number) => {
		try {
			return await get().currencyProvider.formatPrice(
				price,
				get().currentCurrency
			);
		} catch (error) {
			console.error('❌ Error formatting price:', error);
			return `$${price.toFixed(2)}`;
		}
	},

	getCurrentCurrency: () => get().currentCurrency,
}));
