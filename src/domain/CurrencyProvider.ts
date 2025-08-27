import { Currency } from '@/types/currency';

export interface CurrencyHandlerInterface {
	convertPrice(
		price: number,
		fromCurrency: Currency,
		toCurrency: Currency
	): number;
	formatPrice(price: number, currency: Currency): string;
	getExchangeRate(currency: Currency): number;
	getSupportedCurrencies(): Currency[];
}

export class CurrencyHandler {
	constructor(private readonly currencyProvider: CurrencyHandlerInterface) {}

	convertPrice = (
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

	getExchangeRate = (currency: Currency) => {
		try {
			return this.currencyProvider.getExchangeRate(currency);
		} catch (error) {
			console.error('Error getting exchange rate:', error);
			return 1;
		}
	};

	getSupportedCurrencies = () => {
		try {
			return this.currencyProvider.getSupportedCurrencies();
		} catch (error) {
			console.error('Error getting supported currencies:', error);
			return ['USD', 'EUR'] as Currency[];
		}
	};
}
