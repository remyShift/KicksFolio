import { beforeEach, describe, expect, it } from 'vitest';

import { CurrencyProvider } from '@/domain/CurrencyProvider';

describe('CurrencyProvider', () => {
	let currencyProvider: CurrencyProvider;

	beforeEach(() => {
		currencyProvider = new CurrencyProvider();
	});

	describe('formatPrice', () => {
		it('should format USD price correctly', () => {
			const result = currencyProvider.formatPrice(100, 'USD');
			expect(result).toBe('$100.00');
		});

		it('should format EUR price correctly', () => {
			const result = currencyProvider.formatPrice(100, 'EUR');
			expect(result).toBe('85.00€');
		});

		it('should handle decimal prices', () => {
			const result = currencyProvider.formatPrice(99.99, 'USD');
			expect(result).toBe('$99.99');
		});

		it('should format zero price', () => {
			const result = currencyProvider.formatPrice(0, 'USD');
			expect(result).toBe('$0.00');
		});
	});

	describe('convertPrice', () => {
		it('should return same price for same currency', () => {
			const result = currencyProvider.convertPrice(100, 'USD', 'USD');
			expect(result).toBe(100);
		});

		it('should convert USD to EUR correctly', () => {
			const result = currencyProvider.convertPrice(100, 'USD', 'EUR');
			expect(result).toBe(85);
		});

		it('should convert EUR to USD correctly', () => {
			const result = currencyProvider.convertPrice(85, 'EUR', 'USD');
			expect(result).toBe(100);
		});

		it('should handle decimal conversion', () => {
			const result = currencyProvider.convertPrice(50.5, 'USD', 'EUR');
			expect(result).toBeCloseTo(42.925, 3);
		});
	});

	describe('getExchangeRate', () => {
		it('should return correct USD exchange rate', () => {
			const result = currencyProvider.getExchangeRate('USD');
			expect(result).toBe(1);
		});

		it('should return correct EUR exchange rate', () => {
			const result = currencyProvider.getExchangeRate('EUR');
			expect(result).toBe(0.85);
		});
	});

	describe('getSupportedCurrencies', () => {
		it('should return all supported currencies', () => {
			const result = currencyProvider.getSupportedCurrencies();
			expect(result).toEqual(['USD', 'EUR']);
			expect(result).toHaveLength(2);
		});

		it('should return currencies as Currency type', () => {
			const result = currencyProvider.getSupportedCurrencies();
			result.forEach((currency) => {
				expect(['USD', 'EUR']).toContain(currency);
			});
		});
	});
});
