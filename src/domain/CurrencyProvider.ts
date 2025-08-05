import { CurrencyProviderInterface } from '@/interfaces/CurrencyProviderInterface';
import { Currency } from '@/types/currency';

const EXCHANGE_RATES = {
	USD: 1,
	EUR: 0.85,
} as const;

const CURRENCY_SYMBOLS = {
	USD: '$',
	EUR: '€',
} as const;

export class CurrencyProvider implements CurrencyProviderInterface {
	formatPrice(price: number, currency: Currency): string {
		try {
			const convertedPrice = this.convertPrice(price, 'USD', currency);
			const symbol = CURRENCY_SYMBOLS[currency];

			switch (currency) {
				case 'USD':
					return `${symbol}${convertedPrice.toFixed(2)}`;
				case 'EUR':
					return `${convertedPrice.toFixed(2)}${symbol}`;
				default:
					return `${symbol}${convertedPrice.toFixed(2)}`;
			}
		} catch (error) {
			console.error('Error in formatPrice:', error);
			return `$${price.toFixed(2)}`;
		}
	}

	convertPrice(
		price: number,
		fromCurrency: Currency,
		toCurrency: Currency
	): number {
		if (fromCurrency === toCurrency) {
			return price;
		}

		if (!EXCHANGE_RATES[fromCurrency] || !EXCHANGE_RATES[toCurrency]) {
			console.error(
				'Error in convertPrice:',
				fromCurrency,
				toCurrency,
				EXCHANGE_RATES
			);
			throw new Error(
				`Unsupported currency: ${fromCurrency} or ${toCurrency}`
			);
		}

		const priceInUSD = price / EXCHANGE_RATES[fromCurrency];
		return priceInUSD * EXCHANGE_RATES[toCurrency];
	}

	getExchangeRate(currency: Currency): number {
		return EXCHANGE_RATES[currency] || 1;
	}

	getSupportedCurrencies(): Currency[] {
		return Object.keys(EXCHANGE_RATES) as Currency[];
	}
}

export const currencyProvider = new CurrencyProvider();
