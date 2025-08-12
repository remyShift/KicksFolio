import { Currency } from '@/types/currency';

export interface CurrencyProviderInterface {
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
