import { describe, expect, it, vi } from 'vitest';

import { SneakerSizeConverterInterface } from '@/domain/SneakerSizeConverterInterface';
import { SizeUnit } from '@/types/sneaker';

describe('SneakerSizeConverterInterface', () => {
	describe('convertSize', () => {
		it('should convert size between units successfully', async () => {
			const mockConvertSize = vi.fn().mockReturnValue(42);

			const result = await SneakerSizeConverterInterface.convertSize(
				8.5,
				'US',
				'EU',
				'men',
				mockConvertSize
			);

			expect(result).toBe(42);
			expect(mockConvertSize).toHaveBeenCalledWith(
				8.5,
				'US',
				'EU',
				'men'
			);
		});

		it('should handle convert size errors gracefully', async () => {
			const mockError = new Error('Invalid size conversion');
			const mockConvertSize = vi.fn().mockImplementation(() => {
				throw mockError;
			});
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			await expect(
				SneakerSizeConverterInterface.convertSize(
					999,
					'US',
					'EU',
					'men',
					mockConvertSize
				)
			).rejects.toThrow('Invalid size conversion');

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ SneakerSizeConverterInterface.convertSize: Error occurred:',
				mockError
			);

			consoleSpy.mockRestore();
		});
	});

	describe('formatSize', () => {
		it('should format size successfully', async () => {
			const mockFormatSize = vi.fn().mockReturnValue('42 EU');

			const result = await SneakerSizeConverterInterface.formatSize(
				42,
				'EU',
				mockFormatSize
			);

			expect(result).toBe('42 EU');
			expect(mockFormatSize).toHaveBeenCalledWith(42, 'EU');
		});

		it('should handle format size errors gracefully', async () => {
			const mockError = new Error('Format error');
			const mockFormatSize = vi.fn().mockImplementation(() => {
				throw mockError;
			});
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			await expect(
				SneakerSizeConverterInterface.formatSize(
					42,
					'EU',
					mockFormatSize
				)
			).rejects.toThrow('Format error');

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ SneakerSizeConverterInterface.formatSize: Error occurred:',
				mockError
			);

			consoleSpy.mockRestore();
		});
	});

	describe('convertAndFormat', () => {
		it('should convert and format size successfully', async () => {
			const mockConvertAndFormat = vi.fn().mockReturnValue('42 EU');

			const result = await SneakerSizeConverterInterface.convertAndFormat(
				8.5,
				'US',
				'EU',
				'men',
				mockConvertAndFormat
			);

			expect(result).toBe('42 EU');
			expect(mockConvertAndFormat).toHaveBeenCalledWith(
				8.5,
				'US',
				'EU',
				'men'
			);
		});

		it('should handle convert and format errors gracefully', async () => {
			const mockError = new Error('Convert and format error');
			const mockConvertAndFormat = vi.fn().mockImplementation(() => {
				throw mockError;
			});
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			await expect(
				SneakerSizeConverterInterface.convertAndFormat(
					8.5,
					'US',
					'EU',
					'men',
					mockConvertAndFormat
				)
			).rejects.toThrow('Convert and format error');

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ SneakerSizeConverterInterface.convertAndFormat: Error occurred:',
				mockError
			);

			consoleSpy.mockRestore();
		});
	});

	describe('getAvailableSizes', () => {
		it('should return available sizes successfully', async () => {
			const mockSizes = [35, 35.5, 36, 36.5, 37.5];
			const mockGetAvailableSizes = vi.fn().mockReturnValue(mockSizes);

			const result =
				await SneakerSizeConverterInterface.getAvailableSizes(
					'EU',
					'men',
					mockGetAvailableSizes
				);

			expect(result).toEqual(mockSizes);
			expect(mockGetAvailableSizes).toHaveBeenCalledWith('EU', 'men');
		});

		it('should handle get available sizes errors gracefully', async () => {
			const mockError = new Error('Get available sizes error');
			const mockGetAvailableSizes = vi.fn().mockImplementation(() => {
				throw mockError;
			});
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			await expect(
				SneakerSizeConverterInterface.getAvailableSizes(
					'EU',
					'men',
					mockGetAvailableSizes
				)
			).rejects.toThrow('Get available sizes error');

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ SneakerSizeConverterInterface.getAvailableSizes: Error occurred:',
				mockError
			);

			consoleSpy.mockRestore();
		});
	});

	describe('isValidSize', () => {
		it('should return true for valid size', async () => {
			const mockIsValidSize = vi.fn().mockReturnValue(true);

			const result = await SneakerSizeConverterInterface.isValidSize(
				42,
				'EU',
				'men',
				mockIsValidSize
			);

			expect(result).toBe(true);
			expect(mockIsValidSize).toHaveBeenCalledWith(42, 'EU', 'men');
		});

		it('should return false for invalid size', async () => {
			const mockIsValidSize = vi.fn().mockReturnValue(false);

			const result = await SneakerSizeConverterInterface.isValidSize(
				999,
				'EU',
				'men',
				mockIsValidSize
			);

			expect(result).toBe(false);
			expect(mockIsValidSize).toHaveBeenCalledWith(999, 'EU', 'men');
		});

		it('should handle is valid size errors gracefully', async () => {
			const mockError = new Error('Is valid size error');
			const mockIsValidSize = vi.fn().mockImplementation(() => {
				throw mockError;
			});
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			await expect(
				SneakerSizeConverterInterface.isValidSize(
					42,
					'EU',
					'men',
					mockIsValidSize
				)
			).rejects.toThrow('Is valid size error');

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ SneakerSizeConverterInterface.isValidSize: Error occurred:',
				mockError
			);

			consoleSpy.mockRestore();
		});
	});

	describe('detectSizeUnit', () => {
		it('should detect US unit for small sizes', async () => {
			const mockDetectSizeUnit = vi
				.fn()
				.mockReturnValue('US' as SizeUnit);

			const result = await SneakerSizeConverterInterface.detectSizeUnit(
				8.5,
				mockDetectSizeUnit
			);

			expect(result).toBe('US');
			expect(mockDetectSizeUnit).toHaveBeenCalledWith(8.5);
		});

		it('should detect EU unit for large sizes', async () => {
			const mockDetectSizeUnit = vi
				.fn()
				.mockReturnValue('EU' as SizeUnit);

			const result = await SneakerSizeConverterInterface.detectSizeUnit(
				42,
				mockDetectSizeUnit
			);

			expect(result).toBe('EU');
			expect(mockDetectSizeUnit).toHaveBeenCalledWith(42);
		});

		it('should handle detect size unit errors gracefully', async () => {
			const mockError = new Error('Detect size unit error');
			const mockDetectSizeUnit = vi.fn().mockImplementation(() => {
				throw mockError;
			});
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			await expect(
				SneakerSizeConverterInterface.detectSizeUnit(
					42,
					mockDetectSizeUnit
				)
			).rejects.toThrow('Detect size unit error');

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ SneakerSizeConverterInterface.detectSizeUnit: Error occurred:',
				mockError
			);

			consoleSpy.mockRestore();
		});
	});

	describe('generateBothSizes', () => {
		it('should generate both sizes successfully', async () => {
			const mockSizes = {
				size_eu: 42,
				size_us: 8.5,
			};
			const mockGenerateBothSizes = vi.fn().mockReturnValue(mockSizes);

			const result =
				await SneakerSizeConverterInterface.generateBothSizes(
					8.5,
					'men',
					'US',
					mockGenerateBothSizes
				);

			expect(result).toEqual(mockSizes);
			expect(mockGenerateBothSizes).toHaveBeenCalledWith(
				8.5,
				'men',
				'US'
			);
		});

		it('should handle generate both sizes errors gracefully', async () => {
			const mockError = new Error('Generate both sizes error');
			const mockGenerateBothSizes = vi.fn().mockImplementation(() => {
				throw mockError;
			});
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			await expect(
				SneakerSizeConverterInterface.generateBothSizes(
					8.5,
					'men',
					'US',
					mockGenerateBothSizes
				)
			).rejects.toThrow('Generate both sizes error');

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ SneakerSizeConverterInterface.generateBothSizes: Error occurred:',
				mockError
			);

			consoleSpy.mockRestore();
		});
	});
});
