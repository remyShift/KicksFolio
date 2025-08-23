import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSizeConversion } from '@/hooks/useSizeConversion';
import { Sneaker, SneakerBrand, SneakerStatus } from '@/types/sneaker';

vi.mock('@/store/useSizeUnitStore', () => ({
	useSizeUnitStore: vi.fn(() => ({
		currentUnit: 'EU',
	})),
}));

vi.mock('@/domain/SneakerSizeConverter', () => ({
	sneakerSizeConverter: {
		formatSize: vi.fn((size: number, unit: string) => `${size} ${unit}`),
		generateBothSizes: vi.fn((inputSize: number) => ({
			size_eu: 42,
			size_us: 8.5,
		})),
		convertSize: vi.fn(() => 42),
		getAvailableSizes: vi.fn(() => [
			35, 35.5, 36, 36.5, 37.5, 38, 38.5, 39, 40, 40.5, 41, 42, 42.5, 43,
			44, 44.5, 45, 45.5, 46, 47, 47.5, 48, 48.5, 49, 49.5, 50,
		]),
		isValidSize: vi.fn(() => true),
		detectSizeUnit: vi.fn((size: number) =>
			size >= 3.5 && size <= 17 ? 'US' : 'EU'
		),
		convertAndFormat: vi.fn(() => '42 EU'),
	},
}));

describe('useSizeConversion', () => {
	let useSizeUnitStore: any;

	beforeEach(async () => {
		vi.clearAllMocks();

		const storeModule = await import('@/store/useSizeUnitStore');
		useSizeUnitStore = vi.mocked(storeModule.useSizeUnitStore);
	});

	const mockSneaker: Sneaker = {
		id: '1',
		model: 'Air Max 90',
		brand: SneakerBrand.Nike,
		size_eu: 42,
		size_us: 8.5,
		condition: 9,
		status_id: SneakerStatus.STOCKING,
		price_paid: 150,
		estimated_value: 200,
		user_id: 'user-1',
		created_at: '2023-01-01',
		updated_at: '2023-01-01',
		images: [],
		description: '',
		sku: '',
		gender: 'men',
		og_box: true,
		ds: false,
	};

	describe('getSizeForCurrentUnit', () => {
		it('should return EU size when current unit is EU', () => {
			useSizeUnitStore.mockReturnValue({
				currentUnit: 'EU',
			});

			const { result } = renderHook(() => useSizeConversion());
			const size = result.current.getSizeForCurrentUnit(mockSneaker);

			expect(size).toBe(42);
		});

		it('should return US size when current unit is US', () => {
			useSizeUnitStore.mockReturnValue({
				currentUnit: 'US',
			});

			const { result } = renderHook(() => useSizeConversion());
			const size = result.current.getSizeForCurrentUnit(mockSneaker);

			expect(size).toBe(8.5);
		});
	});

	describe('formatSizeForDisplay', () => {
		it('should format size for display directly', () => {
			useSizeUnitStore.mockReturnValue({
				currentUnit: 'EU',
			});

			const { result } = renderHook(() => useSizeConversion());
			const formattedSize =
				result.current.formatSizeForDisplay(mockSneaker);

			expect(formattedSize).toBe('42 EU');
		});
	});

	describe('generateBothSizes', () => {
		it('should generate both sizes directly', () => {
			const { result } = renderHook(() => useSizeConversion());
			const sizes = result.current.generateBothSizes(8.5, 'men');

			expect(sizes).toEqual({
				size_eu: 42,
				size_us: 8.5,
			});
		});
	});

	describe('convertToCurrentUnit', () => {
		it('should convert size to current unit directly', () => {
			useSizeUnitStore.mockReturnValue({
				currentUnit: 'EU',
			});

			const { result } = renderHook(() => useSizeConversion());
			const convertedSize = result.current.convertToCurrentUnit(
				8.5,
				'US',
				'men'
			);

			expect(convertedSize).toBe(42);
		});
	});

	describe('getAvailableSizesForCurrentUnit', () => {
		it('should get available sizes for current unit directly', () => {
			useSizeUnitStore.mockReturnValue({
				currentUnit: 'EU',
			});

			const { result } = renderHook(() => useSizeConversion());
			const sizes = result.current.getAvailableSizesForCurrentUnit('men');

			expect(sizes).toEqual([
				35, 35.5, 36, 36.5, 37.5, 38, 38.5, 39, 40, 40.5, 41, 42, 42.5,
				43, 44, 44.5, 45, 45.5, 46, 47, 47.5, 48, 48.5, 49, 49.5, 50,
			]);
		});
	});

	describe('isValidSizeInCurrentUnit', () => {
		it('should validate size in current unit directly', () => {
			useSizeUnitStore.mockReturnValue({
				currentUnit: 'EU',
			});

			const { result } = renderHook(() => useSizeConversion());
			const isValid = result.current.isValidSizeInCurrentUnit(42, 'men');

			expect(isValid).toBe(true);
		});
	});

	describe('formatCurrentUnitSize', () => {
		it('should format current unit size directly', () => {
			useSizeUnitStore.mockReturnValue({
				currentUnit: 'EU',
			});

			const { result } = renderHook(() => useSizeConversion());
			const formattedSize = result.current.formatCurrentUnitSize(42);

			expect(formattedSize).toBe('42 EU');
		});
	});

	describe('getOriginalUnit', () => {
		it('should detect original unit directly', () => {
			const { result } = renderHook(() => useSizeConversion());
			const unit = result.current.getOriginalUnit(8.5);

			expect(unit).toBe('US');
		});
	});

	describe('convertAndFormat', () => {
		it('should convert and format size directly', () => {
			const { result } = renderHook(() => useSizeConversion());
			const formatted = result.current.convertAndFormat(
				8.5,
				'US',
				'EU',
				'men'
			);

			expect(formatted).toBe('42 EU');
		});
	});

	describe('currentUnit', () => {
		it('should return current unit from store', () => {
			useSizeUnitStore.mockReturnValue({
				currentUnit: 'US',
			});

			const { result } = renderHook(() => useSizeConversion());

			expect(result.current.currentUnit).toBe('US');
		});
	});
});
