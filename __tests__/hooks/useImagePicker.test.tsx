import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useImagePicker } from '@/hooks/useImagePicker';
import * as ImagePicker from 'expo-image-picker';
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

const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

describe('useImagePicker', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterAll(() => {
		consoleWarnSpy.mockRestore();
	});

	describe('handleImageSelection', () => {
		it('should handle camera selection with permission', async () => {
			const mockImageUri = 'file://profile.jpg';
			
			vi.mocked(ImagePicker.requestCameraPermissionsAsync).mockResolvedValue({
				status: 'granted',
			} as any);
			
			vi.mocked(imageService.takeProfilePhoto).mockResolvedValue(mockImageUri);

			const { result } = renderHook(() => useImagePicker());
			const imageUri = await result.current.handleImageSelection('camera');

			expect(imageUri).toBe(mockImageUri);
			expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalled();
			expect(imageService.takeProfilePhoto).toHaveBeenCalled();
		});

		it('should handle camera permission denied', async () => {
			vi.mocked(ImagePicker.requestCameraPermissionsAsync).mockResolvedValue({
				status: 'denied',
			} as any);

			const { result } = renderHook(() => useImagePicker());
			const imageUri = await result.current.handleImageSelection('camera');

			expect(imageUri).toBeNull();
			expect(consoleWarnSpy).toHaveBeenCalledWith('⚠️ useImagePicker: Camera permission not granted');
			expect(imageService.takeProfilePhoto).not.toHaveBeenCalled();
		});

		it('should handle gallery selection with permission', async () => {
			const mockImageUri = 'file://gallery.jpg';
			
			vi.mocked(ImagePicker.requestMediaLibraryPermissionsAsync).mockResolvedValue({
				status: 'granted',
			} as any);
			
			vi.mocked(imageService.pickUserProfileImage).mockResolvedValue(mockImageUri);

			const { result } = renderHook(() => useImagePicker());
			const imageUri = await result.current.handleImageSelection('gallery');

			expect(imageUri).toBe(mockImageUri);
			expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
			expect(imageService.pickUserProfileImage).toHaveBeenCalled();
		});

		it('should handle gallery permission denied', async () => {
			vi.mocked(ImagePicker.requestMediaLibraryPermissionsAsync).mockResolvedValue({
				status: 'denied',
			} as any);

			const { result } = renderHook(() => useImagePicker());
			const imageUri = await result.current.handleImageSelection('gallery');

			expect(imageUri).toBeNull();
			expect(consoleWarnSpy).toHaveBeenCalledWith('⚠️ useImagePicker: Media library permission not granted');
			expect(imageService.pickUserProfileImage).not.toHaveBeenCalled();
		});
	});

	describe('handleSneakerImageSelection', () => {
		it('should handle sneaker camera selection', async () => {
			const mockImageUri = 'file://sneaker.jpg';
			
			vi.mocked(ImagePicker.requestCameraPermissionsAsync).mockResolvedValue({
				status: 'granted',
			} as any);
			
			vi.mocked(imageService.takeSneakerPhoto).mockResolvedValue(mockImageUri);

			const { result } = renderHook(() => useImagePicker());
			const imageUri = await result.current.handleSneakerImageSelection('camera');

			expect(imageUri).toBe(mockImageUri);
			expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalled();
			expect(imageService.takeSneakerPhoto).toHaveBeenCalled();
		});

		it('should handle sneaker gallery selection', async () => {
			const mockImageUri = 'file://sneaker-gallery.jpg';
			
			vi.mocked(ImagePicker.requestMediaLibraryPermissionsAsync).mockResolvedValue({
				status: 'granted',
			} as any);
			
			vi.mocked(imageService.pickSneakerImage).mockResolvedValue(mockImageUri);

			const { result } = renderHook(() => useImagePicker());
			const imageUri = await result.current.handleSneakerImageSelection('gallery');

			expect(imageUri).toBe(mockImageUri);
			expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
			expect(imageService.pickSneakerImage).toHaveBeenCalled();
		});

		it('should handle sneaker camera permission denied', async () => {
			vi.mocked(ImagePicker.requestCameraPermissionsAsync).mockResolvedValue({
				status: 'denied',
			} as any);

			const { result } = renderHook(() => useImagePicker());
			const imageUri = await result.current.handleSneakerImageSelection('camera');

			expect(imageUri).toBeNull();
			expect(consoleWarnSpy).toHaveBeenCalledWith('⚠️ useImagePicker: Camera permission not granted');
			expect(imageService.takeSneakerPhoto).not.toHaveBeenCalled();
		});

		it('should handle sneaker gallery permission denied', async () => {
			vi.mocked(ImagePicker.requestMediaLibraryPermissionsAsync).mockResolvedValue({
				status: 'denied',
			} as any);

			const { result } = renderHook(() => useImagePicker());
			const imageUri = await result.current.handleSneakerImageSelection('gallery');

			expect(imageUri).toBeNull();
			expect(consoleWarnSpy).toHaveBeenCalledWith('⚠️ useImagePicker: Media library permission not granted');
			expect(imageService.pickSneakerImage).not.toHaveBeenCalled();
		});
	});

	describe('handleMultipleSneakerImages', () => {
		it('should handle multiple image selection with default max', async () => {
			const mockImageUris = ['file://1.jpg', 'file://2.jpg'];
			
			vi.mocked(ImagePicker.requestMediaLibraryPermissionsAsync).mockResolvedValue({
				status: 'granted',
			} as any);
			
			vi.mocked(imageService.pickMultipleSneakerImages).mockResolvedValue(mockImageUris);

			const { result } = renderHook(() => useImagePicker());
			const imageUris = await result.current.handleMultipleSneakerImages();

			expect(imageUris).toEqual(mockImageUris);
			expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
			expect(imageService.pickMultipleSneakerImages).toHaveBeenCalledWith(3);
		});

		it('should handle multiple image selection with custom max', async () => {
			const mockImageUris = ['file://1.jpg'];
			
			vi.mocked(ImagePicker.requestMediaLibraryPermissionsAsync).mockResolvedValue({
				status: 'granted',
			} as any);
			
			vi.mocked(imageService.pickMultipleSneakerImages).mockResolvedValue(mockImageUris);

			const { result } = renderHook(() => useImagePicker());
			const imageUris = await result.current.handleMultipleSneakerImages(1);

			expect(imageUris).toEqual(mockImageUris);
			expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
			expect(imageService.pickMultipleSneakerImages).toHaveBeenCalledWith(1);
		});

		it('should handle multiple images permission denied', async () => {
			vi.mocked(ImagePicker.requestMediaLibraryPermissionsAsync).mockResolvedValue({
				status: 'denied',
			} as any);

			const { result } = renderHook(() => useImagePicker());
			const imageUris = await result.current.handleMultipleSneakerImages();

			expect(imageUris).toBeNull();
			expect(consoleWarnSpy).toHaveBeenCalledWith('⚠️ useImagePicker: Media library permission not granted');
			expect(imageService.pickMultipleSneakerImages).not.toHaveBeenCalled();
		});

		it('should handle image service returning null', async () => {
			vi.mocked(ImagePicker.requestMediaLibraryPermissionsAsync).mockResolvedValue({
				status: 'granted',
			} as any);
			
			vi.mocked(imageService.pickMultipleSneakerImages).mockResolvedValue(null);

			const { result } = renderHook(() => useImagePicker());
			const imageUris = await result.current.handleMultipleSneakerImages();

			expect(imageUris).toBeNull();
		});
	});

	describe('integration scenarios', () => {
		it('should handle all three methods being available', () => {
			const { result } = renderHook(() => useImagePicker());

			expect(typeof result.current.handleImageSelection).toBe('function');
			expect(typeof result.current.handleSneakerImageSelection).toBe('function');
			expect(typeof result.current.handleMultipleSneakerImages).toBe('function');
		});

		it('should handle service methods returning null gracefully', async () => {
			vi.mocked(ImagePicker.requestCameraPermissionsAsync).mockResolvedValue({
				status: 'granted',
			} as any);
			
			vi.mocked(imageService.takeProfilePhoto).mockResolvedValue(null);

			const { result } = renderHook(() => useImagePicker());
			const imageUri = await result.current.handleImageSelection('camera');

			expect(imageUri).toBeNull();
		});
	});
});