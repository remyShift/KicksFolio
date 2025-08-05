import { Currency } from '@/types/currency';

export interface CurrencyProviderInterface {
	formatPrice(price: number, currency: Currency): string;
	convertPrice(
		price: number,
		fromCurrency: Currency,
		toCurrency: Currency
	): number;
	getExchangeRate(currency: Currency): number;
	getSupportedCurrencies(): Currency[];
}

export class CurrencyProviderInterface {
	static formatPrice = async (
		price: number,
		currency: Currency,
		formatFunction: CurrencyProviderInterface['formatPrice']
	) => {
		try {
			return formatFunction(price, currency);
		} catch (error) {
			console.error('Error formatting price:', error);
			return `$${price.toFixed(2)}`;
		}
	};

	static convertPrice = async (
		price: number,
		fromCurrency: Currency,
		toCurrency: Currency,
		convertFunction: CurrencyProviderInterface['convertPrice']
	) => {
		try {
			return convertFunction(price, fromCurrency, toCurrency);
		} catch (error) {
			console.error('Error converting price:', error);
			return price;
		}
	};

	static getExchangeRate = async (
		currency: Currency,
		getRateFunction: CurrencyProviderInterface['getExchangeRate']
	) => {
		try {
			return getRateFunction(currency);
		} catch (error) {
			console.error('Error getting exchange rate:', error);
			return 1;
		}
	};

	static getSupportedCurrencies = async (
		getSupportedFunction: CurrencyProviderInterface['getSupportedCurrencies']
	) => {
		try {
			return getSupportedFunction();
		} catch (error) {
			console.error('Error getting supported currencies:', error);
			return ['USD', 'EUR'] as Currency[];
		}
	};
}
