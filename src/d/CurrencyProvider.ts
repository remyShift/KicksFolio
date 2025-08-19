import { CurrencyHandlerInterface } from '@/domain/CurrencyProvider';
import { Currency } from '@/types/currency';

const EXCHANGE_RATES = {
	USD: 1,
	EUR: 0.85,
} as const;

export class CurrencyProvider implements CurrencyHandlerInterface {
	convertPrice = (
		price: number,
		fromCurrency: Currency,
		toCurrency: Currency
	): number => {
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
	};

	getExchangeRate = (currency: Currency): number => {
		return EXCHANGE_RATES[currency] || 1;
	};

	getSupportedCurrencies = (): Currency[] => {
		return Object.keys(EXCHANGE_RATES) as Currency[];
	};
}

export const currencyProvider = new CurrencyProvider();
