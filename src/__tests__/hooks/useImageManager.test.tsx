import * as ImagePicker from 'expo-image-picker';

import { renderHook } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { useImageManager } from '@/hooks/useImageManager';
import { imageService } from '@/services/ImageService';

vi.mock('expo-image-picker', () => ({
	requestCameraPermissionsAsync: vi.fn(),
	requestMediaLibraryPermissionsAsync: vi.fn(),
}));

vi.mock('@/services/ImageService', () => ({
	imageService: {
		takeProfilePhoto: vi.fn(),
		pickUserProfileImage: vi.fn(),
		takeSneakerPhoto: vi.fn(),
		pickSneakerImage: vi.fn(),
		pickMultipleSneakerImages: vi.fn(),
	},
}));

vi.mock('@/interfaces/ImageProviderInterface', () => ({
	ImageProviderInterface: {
		deleteSpecificSneakerImage: vi.fn(),
	},
}));

vi.mock('@/domain/ImageProxy', () => ({
	imageProvider: {
		deleteSpecificSneakerImage: vi.fn(),
	},
}));

vi.mock('@/contexts/authContext', () => ({
	useSession: vi.fn(() => ({
		user: { id: 'test-user-id' },
	})),
}));

const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

describe('useImageManager', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterAll(() => {
		consoleWarnSpy.mockRestore();
	});

	describe('selectSingleImage', () => {
		it('should select profile image from camera with permission', async () => {
			const mockImageUri = 'file://profile.jpg';

			vi.mocked(
				ImagePicker.requestCameraPermissionsAsync
			).mockResolvedValue({
				status: 'granted',
			} as any);

			vi.mocked(imageService.takeProfilePhoto).mockResolvedValue(
				mockImageUri
			);

			const { result } = renderHook(() => useImageManager());
			const imageUri = await result.current.selectSingleImage(
				'camera',
				'profile'
			);

			expect(imageUri).toBe(mockImageUri);
			expect(
				ImagePicker.requestCameraPermissionsAsync
			).toHaveBeenCalled();
			expect(imageService.takeProfilePhoto).toHaveBeenCalled();
		});

		it('should select sneaker image from gallery with permission', async () => {
			const mockImageUri = 'file://sneaker.jpg';

			vi.mocked(
				ImagePicker.requestMediaLibraryPermissionsAsync
			).mockResolvedValue({
				status: 'granted',
			} as any);

			vi.mocked(imageService.pickSneakerImage).mockResolvedValue(
				mockImageUri
			);

			const { result } = renderHook(() => useImageManager());
			const imageUri = await result.current.selectSingleImage(
				'gallery',
				'sneaker'
			);

			expect(imageUri).toBe(mockImageUri);
			expect(
				ImagePicker.requestMediaLibraryPermissionsAsync
			).toHaveBeenCalled();
			expect(imageService.pickSneakerImage).toHaveBeenCalled();
		});

		it('should return null when camera permission is denied', async () => {
			vi.mocked(
				ImagePicker.requestCameraPermissionsAsync
			).mockResolvedValue({
				status: 'denied',
			} as any);

			const { result } = renderHook(() => useImageManager());
			const imageUri = await result.current.selectSingleImage(
				'camera',
				'profile'
			);

			expect(imageUri).toBeNull();
			expect(consoleWarnSpy).toHaveBeenCalledWith(
				'⚠️ useImageManager: Camera permission not granted'
			);
		});

		it('should return null when media library permission is denied', async () => {
			vi.mocked(
				ImagePicker.requestMediaLibraryPermissionsAsync
			).mockResolvedValue({
				status: 'denied',
			} as any);

			const { result } = renderHook(() => useImageManager());
			const imageUri = await result.current.selectSingleImage(
				'gallery',
				'profile'
			);

			expect(imageUri).toBeNull();
			expect(consoleWarnSpy).toHaveBeenCalledWith(
				'⚠️ useImageManager: Media library permission not granted'
			);
		});
	});

	describe('selectMultipleImages', () => {
		it('should select multiple images with permission', async () => {
			const mockImageUris = ['file://image1.jpg', 'file://image2.jpg'];

			vi.mocked(
				ImagePicker.requestMediaLibraryPermissionsAsync
			).mockResolvedValue({
				status: 'granted',
			} as any);

			vi.mocked(imageService.pickMultipleSneakerImages).mockResolvedValue(
				mockImageUris
			);

			const { result } = renderHook(() => useImageManager());
			const imageUris = await result.current.selectMultipleImages(2);

			expect(imageUris).toEqual(mockImageUris);
			expect(
				ImagePicker.requestMediaLibraryPermissionsAsync
			).toHaveBeenCalled();
			expect(imageService.pickMultipleSneakerImages).toHaveBeenCalledWith(
				2
			);
		});

		it('should return null when permission is denied', async () => {
			vi.mocked(
				ImagePicker.requestMediaLibraryPermissionsAsync
			).mockResolvedValue({
				status: 'denied',
			} as any);

			const { result } = renderHook(() => useImageManager());
			const imageUris = await result.current.selectMultipleImages();

			expect(imageUris).toBeNull();
			expect(consoleWarnSpy).toHaveBeenCalledWith(
				'⚠️ useImageManager: Media library permission not granted'
			);
		});
	});

	describe('Advanced photo management', () => {
		const mockPhotos = [
			{ id: '1', uri: 'file://photo1.jpg' },
			{ id: '2', uri: 'file://photo2.jpg' },
		];

		it('should handle image selection for carousel', async () => {
			const mockOnPhotosChange = vi.fn();
			const mockImageUri = 'file://new-photo.jpg';

			vi.mocked(
				ImagePicker.requestCameraPermissionsAsync
			).mockResolvedValue({
				status: 'granted',
			} as any);

			vi.mocked(imageService.takeSneakerPhoto).mockResolvedValue(
				mockImageUri
			);

			const { result } = renderHook(() =>
				useImageManager(mockPhotos, {
					onPhotosChange: mockOnPhotosChange,
				})
			);

			await result.current.handleImageSelection('camera');

			expect(mockOnPhotosChange).toHaveBeenCalled();
		});

		it('should remove image from carousel', async () => {
			const mockOnPhotosChange = vi.fn();

			const { result } = renderHook(() =>
				useImageManager(mockPhotos, {
					onPhotosChange: mockOnPhotosChange,
				})
			);

			await result.current.removeImage(0);

			expect(mockOnPhotosChange).toHaveBeenCalledWith([
				{
					id: '2',
					uri: 'file://photo2.jpg',
				},
			]);
		});

		it('should warn when photos or onPhotosChange are missing for advanced operations', async () => {
			const consoleWarnSpy = vi
				.spyOn(console, 'warn')
				.mockImplementation(() => {});

			const { result } = renderHook(() => useImageManager());

			await result.current.handleImageSelection('camera');

			expect(consoleWarnSpy).toHaveBeenCalledWith(
				'⚠️ useImageManager: photos and onPhotosChange are required for advanced image handling'
			);

			consoleWarnSpy.mockRestore();
		});
	});

	describe('requestPermissions', () => {
		it('should return true when camera permission is granted', async () => {
			vi.mocked(
				ImagePicker.requestCameraPermissionsAsync
			).mockResolvedValue({
				status: 'granted',
			} as any);

			const { result } = renderHook(() => useImageManager());
			const hasPermission =
				await result.current.requestPermissions('camera');

			expect(hasPermission).toBe(true);
		});

		it('should return false when camera permission is denied', async () => {
			vi.mocked(
				ImagePicker.requestCameraPermissionsAsync
			).mockResolvedValue({
				status: 'denied',
			} as any);

			const { result } = renderHook(() => useImageManager());
			const hasPermission =
				await result.current.requestPermissions('camera');

			expect(hasPermission).toBe(false);
		});

		it('should return true when media library permission is granted', async () => {
			vi.mocked(
				ImagePicker.requestMediaLibraryPermissionsAsync
			).mockResolvedValue({
				status: 'granted',
			} as any);

			const { result } = renderHook(() => useImageManager());
			const hasPermission =
				await result.current.requestPermissions('gallery');

			expect(hasPermission).toBe(true);
		});

		it('should return false when media library permission is denied', async () => {
			vi.mocked(
				ImagePicker.requestMediaLibraryPermissionsAsync
			).mockResolvedValue({
				status: 'denied',
			} as any);

			const { result } = renderHook(() => useImageManager());
			const hasPermission =
				await result.current.requestPermissions('gallery');

			expect(hasPermission).toBe(false);
		});
	});
});
