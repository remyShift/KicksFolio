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

export class CurrencyProvider {
	constructor(private readonly currencyProvider: CurrencyProviderInterface) {}

	formatPrice = async (price: number, currency: Currency) => {
		return this.currencyProvider.formatPrice(price, currency);
	};

	convertPrice = async (
		price: number,
		fromCurrency: Currency,
		toCurrency: Currency
	) => {
		return this.currencyProvider.convertPrice(
			price,
			fromCurrency,
			toCurrency
		);
	};

	getExchangeRate = async (currency: Currency) => {
		try {
			return this.currencyProvider.getExchangeRate(currency);
		} catch (error) {
			console.error('Error getting exchange rate:', error);
			return 1;
		}
	};

	getSupportedCurrencies = async () => {
		try {
			return this.currencyProvider.getSupportedCurrencies();
		} catch (error) {
			console.error('Error getting supported currencies:', error);
			return ['USD', 'EUR'] as Currency[];
		}
	};
}
