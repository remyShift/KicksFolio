import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CurrencyProviderInterface } from '@/interfaces/CurrencyProviderInterface';
import { Currency } from '@/store/useCurrencyStore';

const mockProvider = {
	formatPrice: vi.fn(),
	convertPrice: vi.fn(),
	getExchangeRate: vi.fn(),
	getSupportedCurrencies: vi.fn(),
};

describe('CurrencyProviderInterface', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('calculatePrice', () => {
		it('should calculate price successfully', async () => {
			const expectedResult = 85;
			mockProvider.convertPrice.mockReturnValue(expectedResult);

			const result = await CurrencyProviderInterface.convertPrice(
				100,
				'EUR',
				'USD',
				mockProvider.convertPrice
			);

			expect(result).toBe(expectedResult);
			expect(mockProvider.convertPrice).toHaveBeenCalledWith(
				100,
				'EUR',
				'USD'
			);
		});

		it('should handle calculation error gracefully', async () => {
			mockProvider.convertPrice.mockImplementation(() => {
				throw new Error('Calculation error');
			});

			const result = await CurrencyProviderInterface.convertPrice(
				100,
				'EUR',
				'USD',
				mockProvider.convertPrice
			);

			expect(result).toBe(100);
		});
	});

	describe('formatPrice', () => {
		it('should format price successfully', async () => {
			const expectedResult = '$100.00';
			mockProvider.formatPrice.mockReturnValue(expectedResult);

			const result = await CurrencyProviderInterface.formatPrice(
				100,
				'USD',
				mockProvider.formatPrice
			);

			expect(result).toBe(expectedResult);
			expect(mockProvider.formatPrice).toHaveBeenCalledWith(100, 'USD');
		});

		it('should handle format error gracefully', async () => {
			mockProvider.formatPrice.mockImplementation(() => {
				throw new Error('Format error');
			});

			const result = await CurrencyProviderInterface.formatPrice(
				100,
				'USD',
				mockProvider.formatPrice
			);

			expect(result).toBe('$100.00');
		});
	});

	describe('convertPrice', () => {
		it('should convert price successfully', async () => {
			const expectedResult = 85;
			mockProvider.convertPrice.mockReturnValue(expectedResult);

			const result = await CurrencyProviderInterface.convertPrice(
				100,
				'USD',
				'EUR',
				mockProvider.convertPrice
			);

			expect(result).toBe(expectedResult);
			expect(mockProvider.convertPrice).toHaveBeenCalledWith(
				100,
				'USD',
				'EUR'
			);
		});

		it('should handle conversion error gracefully', async () => {
			mockProvider.convertPrice.mockImplementation(() => {
				throw new Error('Conversion error');
			});

			const result = await CurrencyProviderInterface.convertPrice(
				100,
				'USD',
				'EUR',
				mockProvider.convertPrice
			);

			expect(result).toBe(100);
		});
	});

	describe('getExchangeRate', () => {
		it('should get exchange rate successfully', async () => {
			const expectedResult = 0.85;
			mockProvider.getExchangeRate.mockReturnValue(expectedResult);

			const result = await CurrencyProviderInterface.getExchangeRate(
				'EUR',
				mockProvider.getExchangeRate
			);

			expect(result).toBe(expectedResult);
			expect(mockProvider.getExchangeRate).toHaveBeenCalledWith('EUR');
		});

		it('should handle exchange rate error gracefully', async () => {
			mockProvider.getExchangeRate.mockImplementation(() => {
				throw new Error('Exchange rate error');
			});

			const result = await CurrencyProviderInterface.getExchangeRate(
				'EUR',
				mockProvider.getExchangeRate
			);

			expect(result).toBe(1);
		});
	});

	describe('getSupportedCurrencies', () => {
		it('should get supported currencies successfully', async () => {
			const expectedResult: Currency[] = ['USD', 'EUR'];
			mockProvider.getSupportedCurrencies.mockReturnValue(expectedResult);

			const result =
				await CurrencyProviderInterface.getSupportedCurrencies(
					mockProvider.getSupportedCurrencies
				);

			expect(result).toEqual(expectedResult);
			expect(mockProvider.getSupportedCurrencies).toHaveBeenCalled();
		});

		it('should handle supported currencies error gracefully', async () => {
			mockProvider.getSupportedCurrencies.mockImplementation(() => {
				throw new Error('Supported currencies error');
			});

			const result =
				await CurrencyProviderInterface.getSupportedCurrencies(
					mockProvider.getSupportedCurrencies
				);

			expect(result).toEqual(['USD', 'EUR']);
		});
	});
});
