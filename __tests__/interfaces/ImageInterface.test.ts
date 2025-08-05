import { describe, expect, it, vi } from 'vitest';

import { ImageProviderInterface } from '@/interfaces/ImageProviderInterface';
import {
	ImageValidationResult,
	SneakerPhoto,
	UploadResult,
} from '@/types/image';

const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('ImageProviderInterface', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	afterAll(() => {
		consoleLogSpy.mockRestore();
		consoleWarnSpy.mockRestore();
		consoleErrorSpy.mockRestore();
	});

	describe('uploadImage', () => {
		it('should successfully upload image and log success', async () => {
			const mockUploadResult: UploadResult = {
				success: true,
				url: 'https://example.com/image.jpg',
				fileName: 'test.jpg',
			};

			const mockImplementation: ImageProviderInterface['uploadImage'] = vi
				.fn()
				.mockResolvedValue(mockUploadResult);

			const result = await ImageProviderInterface.uploadImage(
				'file://test.jpg',
				{
					bucket: 'profiles',
					userId: 'user123',
				},
				mockImplementation
			);

			expect(result).toEqual(mockUploadResult);
			expect(consoleLogSpy).toHaveBeenCalledWith(
				'🖼️ ImageProviderInterface.uploadImage: Starting upload for bucket:',
				'profiles'
			);
			expect(consoleLogSpy).toHaveBeenCalledWith(
				'✅ ImageProviderInterface.uploadImage: Upload successful'
			);
			expect(mockImplementation).toHaveBeenCalledWith('file://test.jpg', {
				bucket: 'profiles',
				userId: 'user123',
			});
		});

		it('should handle upload failure and log warning', async () => {
			const mockUploadResult: UploadResult = {
				success: false,
				error: 'Upload failed',
			};

			const mockImplementation: ImageProviderInterface['uploadImage'] = vi
				.fn()
				.mockResolvedValue(mockUploadResult);

			const result = await ImageProviderInterface.uploadImage(
				'file://test.jpg',
				{
					bucket: 'sneakers',
					userId: 'user123',
				},
				mockImplementation
			);

			expect(result).toEqual(mockUploadResult);
			expect(consoleWarnSpy).toHaveBeenCalledWith(
				'⚠️ ImageProviderInterface.uploadImage: Upload failed:',
				'Upload failed'
			);
		});

		it('should handle errors and throw meaningful error', async () => {
			const mockError = new Error('Network error');
			const mockImplementation: ImageProviderInterface['uploadImage'] = vi
				.fn()
				.mockRejectedValue(mockError);

			await expect(
				ImageProviderInterface.uploadImage(
					'file://test.jpg',
					{
						bucket: 'profiles',
						userId: 'user123',
					},
					mockImplementation
				)
			).rejects.toThrow('Image upload failed: Network error');
		});
	});

	describe('uploadSneakerImages', () => {
		it('should upload multiple images successfully', async () => {
			const mockResults: UploadResult[] = [
				{
					success: true,
					url: 'https://example.com/1.jpg',
					fileName: '1.jpg',
				},
				{
					success: true,
					url: 'https://example.com/2.jpg',
					fileName: '2.jpg',
				},
			];

			const mockImplementation: ImageProviderInterface['uploadSneakerImages'] =
				vi.fn().mockResolvedValue(mockResults);

			const result = await ImageProviderInterface.uploadSneakerImages(
				[
					{
						uri: 'file://1.jpg',
					},
					{
						uri: 'file://2.jpg',
					},
				],
				'user123',
				'sneaker456',
				mockImplementation
			);

			expect(result).toEqual(mockResults);
			expect(consoleLogSpy).toHaveBeenCalledWith(
				'🖼️ ImageProviderInterface.uploadSneakerImages: Uploading',
				2,
				'images'
			);
			expect(consoleLogSpy).toHaveBeenCalledWith(
				'✅ ImageProviderInterface.uploadSneakerImages: 2/2 uploads successful'
			);
		});

		it('should handle partial failures', async () => {
			const mockResults: UploadResult[] = [
				{
					success: true,
					url: 'https://example.com/1.jpg',
					fileName: '1.jpg',
				},
				{
					success: false,
					error: 'Upload failed',
				},
			];

			const mockImplementation: ImageProviderInterface['uploadSneakerImages'] =
				vi.fn().mockResolvedValue(mockResults);

			const result = await ImageProviderInterface.uploadSneakerImages(
				[
					{
						uri: 'file://1.jpg',
					},
					{
						uri: 'file://2.jpg',
					},
				],
				'user123',
				'sneaker456',
				mockImplementation
			);

			expect(result).toEqual(mockResults);
			expect(consoleLogSpy).toHaveBeenCalledWith(
				'✅ ImageProviderInterface.uploadSneakerImages: 1/2 uploads successful'
			);
		});
	});

	describe('deleteImage', () => {
		it('should delete image successfully', async () => {
			const mockImplementation: ImageProviderInterface['deleteImage'] = vi
				.fn()
				.mockResolvedValue(true);

			const result = await ImageProviderInterface.deleteImage(
				'profiles',
				'user123/profile.jpg',
				mockImplementation
			);

			expect(result).toBe(true);
			expect(consoleLogSpy).toHaveBeenCalledWith(
				'🗑️ ImageProviderInterface.deleteImage: Deleting image from bucket:',
				'profiles'
			);
			expect(consoleLogSpy).toHaveBeenCalledWith(
				'✅ ImageProviderInterface.deleteImage: Image deleted successfully'
			);
		});

		it('should handle delete failure', async () => {
			const mockImplementation: ImageProviderInterface['deleteImage'] = vi
				.fn()
				.mockResolvedValue(false);

			const result = await ImageProviderInterface.deleteImage(
				'sneakers',
				'user123/sneaker.jpg',
				mockImplementation
			);

			expect(result).toBe(false);
			expect(consoleWarnSpy).toHaveBeenCalledWith(
				'⚠️ ImageProviderInterface.deleteImage: Failed to delete image'
			);
		});

		it('should handle errors during deletion', async () => {
			const mockError = new Error('Delete error');
			const mockImplementation: ImageProviderInterface['deleteImage'] = vi
				.fn()
				.mockRejectedValue(mockError);

			await expect(
				ImageProviderInterface.deleteImage(
					'profiles',
					'user123/profile.jpg',
					mockImplementation
				)
			).rejects.toThrow('Image deletion failed: Delete error');
		});
	});

	describe('extractFilePathFromUrl', () => {
		it('should extract file path from URL', () => {
			const mockImplementation: ImageProviderInterface['extractFilePathFromUrl'] =
				vi.fn().mockReturnValue('user123/image.jpg');

			const result = ImageProviderInterface.extractFilePathFromUrl(
				'https://example.com/storage/v1/object/public/profiles/user123/image.jpg',
				'profiles',
				mockImplementation
			);

			expect(result).toBe('user123/image.jpg');
			expect(mockImplementation).toHaveBeenCalledWith(
				'https://example.com/storage/v1/object/public/profiles/user123/image.jpg',
				'profiles'
			);
		});

		it('should return null for invalid URLs', () => {
			const mockImplementation: ImageProviderInterface['extractFilePathFromUrl'] =
				vi.fn().mockReturnValue(null);

			const result = ImageProviderInterface.extractFilePathFromUrl(
				'invalid-url',
				'profiles',
				mockImplementation
			);

			expect(result).toBeNull();
		});
	});

	describe('validateImageUri', () => {
		it('should validate image URI successfully', async () => {
			const mockValidationResult: ImageValidationResult = {
				isValid: true,
				size: 1024,
			};

			const mockImplementation: ImageProviderInterface['validateImageUri'] =
				vi.fn().mockResolvedValue(mockValidationResult);

			const result = await ImageProviderInterface.validateImageUri(
				'file://test.jpg',
				mockImplementation
			);

			expect(result).toEqual(mockValidationResult);
		});

		it('should handle validation errors', async () => {
			const mockError = new Error('Validation error');
			const mockImplementation: ImageProviderInterface['validateImageUri'] =
				vi.fn().mockRejectedValue(mockError);

			const result = await ImageProviderInterface.validateImageUri(
				'invalid-file',
				mockImplementation
			);

			expect(result).toEqual({
				isValid: false,
				error: 'Image validation failed: Validation error',
			});
		});
	});

	describe('processAndUploadSneakerImages', () => {
		it('should process and upload sneaker images', async () => {
			const mockPhotos: SneakerPhoto[] = [
				{
					id: '1',
					uri: 'https://example.com/1.jpg',
				},
				{
					id: '2',
					uri: 'https://example.com/2.jpg',
				},
			];

			const mockImplementation: ImageProviderInterface['processAndUploadSneakerImages'] =
				vi.fn().mockResolvedValue(mockPhotos);

			const result =
				await ImageProviderInterface.processAndUploadSneakerImages(
					[
						{
							uri: 'file://1.jpg',
						},
						{
							uri: 'file://2.jpg',
						},
					],
					'user123',
					'sneaker456',
					mockImplementation
				);

			expect(result).toEqual(mockPhotos);
			expect(consoleLogSpy).toHaveBeenCalledWith(
				'🔄 ImageProviderInterface.processAndUploadSneakerImages: Processing',
				2,
				'images'
			);
			expect(consoleLogSpy).toHaveBeenCalledWith(
				'✅ ImageProviderInterface.processAndUploadSneakerImages: 2 images processed successfully'
			);
		});

		it('should handle processing errors', async () => {
			const mockError = new Error('Processing error');
			const mockImplementation: ImageProviderInterface['processAndUploadSneakerImages'] =
				vi.fn().mockRejectedValue(mockError);

			await expect(
				ImageProviderInterface.processAndUploadSneakerImages(
					[
						{
							uri: 'file://1.jpg',
						},
					],
					'user123',
					'sneaker456',
					mockImplementation
				)
			).rejects.toThrow(
				'Sneaker images processing failed: Processing error'
			);
		});
	});
});
