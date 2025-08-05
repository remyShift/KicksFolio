import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageService } from '@/services/ImageService';
import { Alert } from 'react-native';

const mockImagePicker = {
	openPicker: vi.fn(),
	openCamera: vi.fn(),
	clean: vi.fn(),
};

vi.mock('react-native-image-crop-picker', () => ({
	default: mockImagePicker,
}));

vi.mock('react-native', () => ({
	Alert: {
		alert: vi.fn(),
	},
}));

describe('ImageService', () => {
	let imageService: ImageService;

	beforeEach(() => {
		imageService = new ImageService();
		vi.clearAllMocks();
	});

	describe('pickSneakerImage', () => {
		it('should pick sneaker image successfully', async () => {
			const mockImagePath = 'file://path/to/image.jpg';
			mockImagePicker.openPicker.mockResolvedValue({
				path: mockImagePath,
			});

			const result = await imageService.pickSneakerImage();

			expect(result).toBe(mockImagePath);
			expect(mockImagePicker.openPicker).toHaveBeenCalledWith({
				width: 800,
				height: 800,
				cropping: true,
				mediaType: 'photo',
				compressImageQuality: 0.9,
				compressImageMaxWidth: 1200,
				compressImageMaxHeight: 1200,
				freeStyleCropEnabled: true,
			});
		});

		it('should handle user cancellation', async () => {
			mockImagePicker.openPicker.mockRejectedValue({
				code: 'E_PICKER_CANCELLED',
			});

			const result = await imageService.pickSneakerImage();

			expect(result).toBeNull();
			expect(Alert.alert).not.toHaveBeenCalled();
		});

		it('should handle picker errors and show alert', async () => {
			mockImagePicker.openPicker.mockRejectedValue({
				code: 'E_OTHER_ERROR',
				message: 'Permission denied',
			});

			const result = await imageService.pickSneakerImage();

			expect(result).toBeNull();
			expect(Alert.alert).toHaveBeenCalledWith(
				'Error',
				'Can not select image'
			);
		});
	});

	describe('pickUserProfileImage', () => {
		it('should pick profile image with circular overlay', async () => {
			const mockImagePath = 'file://path/to/profile.jpg';
			mockImagePicker.openPicker.mockResolvedValue({
				path: mockImagePath,
			});

			const result = await imageService.pickUserProfileImage();

			expect(result).toBe(mockImagePath);
			expect(mockImagePicker.openPicker).toHaveBeenCalledWith({
				width: 800,
				height: 800,
				cropping: true,
				mediaType: 'photo',
				compressImageQuality: 0.9,
				compressImageMaxWidth: 1200,
				compressImageMaxHeight: 1200,
				freeStyleCropEnabled: true,
				cropperCircleOverlay: true,
			});
		});
	});

	describe('pickMultipleSneakerImages', () => {
		it('should pick multiple images with default max', async () => {
			const mockImages = [
				{ path: 'file://path/to/image1.jpg' },
				{ path: 'file://path/to/image2.jpg' },
			];
			mockImagePicker.openPicker.mockResolvedValue(mockImages);

			const result = await imageService.pickMultipleSneakerImages();

			expect(result).toEqual([
				'file://path/to/image1.jpg',
				'file://path/to/image2.jpg',
			]);
			expect(mockImagePicker.openPicker).toHaveBeenCalledWith({
				multiple: true,
				maxFiles: 3,
				mediaType: 'photo',
				includeBase64: false,
				compressImageQuality: 0.9,
				compressImageMaxWidth: 1200,
				compressImageMaxHeight: 1200,
			});
		});

		it('should respect custom max images limit', async () => {
			const mockImages = [{ path: 'file://path/to/image1.jpg' }];
			mockImagePicker.openPicker.mockResolvedValue(mockImages);

			const result = await imageService.pickMultipleSneakerImages(2);

			expect(result).toEqual(['file://path/to/image1.jpg']);
			expect(mockImagePicker.openPicker).toHaveBeenCalledWith(
				expect.objectContaining({
					maxFiles: 2,
				})
			);
		});

		it('should enforce minimum of 1 image', async () => {
			const mockImages = [{ path: 'file://path/to/image1.jpg' }];
			mockImagePicker.openPicker.mockResolvedValue(mockImages);

			await imageService.pickMultipleSneakerImages(0);

			expect(mockImagePicker.openPicker).toHaveBeenCalledWith(
				expect.objectContaining({
					maxFiles: 1,
				})
			);
		});

		it('should enforce maximum of 3 images', async () => {
			const mockImages = [
				{ path: 'file://path/to/image1.jpg' },
				{ path: 'file://path/to/image2.jpg' },
				{ path: 'file://path/to/image3.jpg' },
			];
			mockImagePicker.openPicker.mockResolvedValue(mockImages);

			await imageService.pickMultipleSneakerImages(5);

			expect(mockImagePicker.openPicker).toHaveBeenCalledWith(
				expect.objectContaining({
					maxFiles: 3,
				})
			);
		});

		it('should handle cancellation without alert', async () => {
			mockImagePicker.openPicker.mockRejectedValue({
				code: 'E_PICKER_CANCELLED',
			});

			const result = await imageService.pickMultipleSneakerImages();

			expect(result).toBeNull();
			expect(Alert.alert).not.toHaveBeenCalled();
		});

		it('should handle errors with alert', async () => {
			mockImagePicker.openPicker.mockRejectedValue({
				code: 'E_OTHER_ERROR',
			});

			const result = await imageService.pickMultipleSneakerImages();

			expect(result).toBeNull();
			expect(Alert.alert).toHaveBeenCalledWith(
				'Error',
				'Can not select images'
			);
		});
	});

	describe('takeSneakerPhoto', () => {
		it('should take sneaker photo successfully', async () => {
			const mockImagePath = 'file://camera/photo.jpg';
			mockImagePicker.openCamera.mockResolvedValue({
				path: mockImagePath,
			});

			const result = await imageService.takeSneakerPhoto();

			expect(result).toBe(mockImagePath);
			expect(mockImagePicker.openCamera).toHaveBeenCalledWith({
				width: 800,
				height: 800,
				cropping: true,
				mediaType: 'photo',
				compressImageQuality: 0.9,
				compressImageMaxWidth: 1200,
				compressImageMaxHeight: 1200,
				freeStyleCropEnabled: true,
			});
		});

		it('should handle camera cancellation', async () => {
			mockImagePicker.openCamera.mockRejectedValue({
				code: 'E_PICKER_CANCELLED',
			});

			const result = await imageService.takeSneakerPhoto();

			expect(result).toBeNull();
			expect(Alert.alert).not.toHaveBeenCalled();
		});

		it('should handle camera errors', async () => {
			mockImagePicker.openCamera.mockRejectedValue({
				code: 'E_CAMERA_ERROR',
			});

			const result = await imageService.takeSneakerPhoto();

			expect(result).toBeNull();
			expect(Alert.alert).toHaveBeenCalledWith(
				'Error',
				'Can not take photo'
			);
		});
	});

	describe('takeProfilePhoto', () => {
		it('should take profile photo with circular overlay', async () => {
			const mockImagePath = 'file://camera/profile.jpg';
			mockImagePicker.openCamera.mockResolvedValue({
				path: mockImagePath,
			});

			const result = await imageService.takeProfilePhoto();

			expect(result).toBe(mockImagePath);
			expect(mockImagePicker.openCamera).toHaveBeenCalledWith({
				width: 800,
				height: 800,
				cropping: true,
				mediaType: 'photo',
				compressImageQuality: 0.9,
				compressImageMaxWidth: 1200,
				compressImageMaxHeight: 1200,
				freeStyleCropEnabled: true,
				cropperCircleOverlay: true,
			});
		});
	});

	describe('pickImageWithoutCrop', () => {
		it('should pick image without cropping', async () => {
			const mockImagePath = 'file://original/image.jpg';
			mockImagePicker.openPicker.mockResolvedValue({
				path: mockImagePath,
			});

			const result = await imageService.pickImageWithoutCrop();

			expect(result).toBe(mockImagePath);
			expect(mockImagePicker.openPicker).toHaveBeenCalledWith({
				mediaType: 'photo',
				includeBase64: false,
				compressImageQuality: 0.95,
				compressImageMaxWidth: 2000,
				compressImageMaxHeight: 2000,
			});
		});

		it('should handle errors appropriately', async () => {
			mockImagePicker.openPicker.mockRejectedValue({
				code: 'E_OTHER_ERROR',
			});

			const result = await imageService.pickImageWithoutCrop();

			expect(result).toBeNull();
			expect(Alert.alert).toHaveBeenCalledWith(
				'Error',
				'Can not select image'
			);
		});
	});

	describe('cleanupTempImages', () => {
		it('should clean up temporary images successfully', async () => {
			const consoleLogSpy = vi
				.spyOn(console, 'log')
				.mockImplementation(() => {});
			mockImagePicker.clean.mockResolvedValue(undefined);

			await imageService.cleanupTempImages();

			expect(mockImagePicker.clean).toHaveBeenCalled();
			expect(consoleLogSpy).toHaveBeenCalledWith('Temp images cleaned');

			consoleLogSpy.mockRestore();
		});

		it('should handle cleanup errors', async () => {
			const consoleLogSpy = vi
				.spyOn(console, 'log')
				.mockImplementation(() => {});
			const cleanupError = new Error('Cleanup failed');
			mockImagePicker.clean.mockRejectedValue(cleanupError);

			await imageService.cleanupTempImages();

			expect(mockImagePicker.clean).toHaveBeenCalled();
			expect(consoleLogSpy).toHaveBeenCalledWith(
				'Error cleaning temp images:',
				cleanupError
			);

			consoleLogSpy.mockRestore();
		});
	});
});
