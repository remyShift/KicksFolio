import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageProvider, imageProvider } from '@/domain/ImageProvider';
import { Photo } from '@/types/image';

const mockSupabaseStorage = {
	from: vi.fn().mockReturnThis(),
	upload: vi.fn(),
	getPublicUrl: vi.fn(),
	remove: vi.fn(),
	list: vi.fn(),
	createSignedUrl: vi.fn(),
};

vi.mock('@/config/supabase/supabase', () => ({
	supabase: {
		storage: mockSupabaseStorage,
	},
}));

const mockFileSystem = {
	getInfoAsync: vi.fn(),
	readAsStringAsync: vi.fn(),
	downloadAsync: vi.fn(),
	deleteAsync: vi.fn(),
	documentDirectory: '/tmp/',
	EncodingType: {
		Base64: 'base64' as const,
	},
};

vi.mock('expo-file-system', () => mockFileSystem);

global.atob = vi.fn().mockImplementation((str: string) => 'mocked-binary-data');

describe('ImageProvider', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('uploadImage', () => {
		it('should upload image successfully', async () => {
			mockFileSystem.getInfoAsync.mockResolvedValue({
				exists: true,
				size: 1024,
			});

			mockFileSystem.readAsStringAsync.mockResolvedValue('base64-data');

			mockSupabaseStorage.upload.mockResolvedValue({
				data: { path: 'user123/test.jpg' },
				error: null,
			});

			mockSupabaseStorage.getPublicUrl.mockReturnValue({
				data: {
					publicUrl:
						'https://example.com/storage/v1/object/public/profiles/user123/test.jpg',
				},
			});

			const result = await imageProvider.uploadImage('file://test.jpg', {
				bucket: 'profiles',
				userId: 'user123',
			});

			expect(result.success).toBe(true);
			expect(result.url).toBe(
				'https://example.com/storage/v1/object/public/profiles/user123/test.jpg'
			);
			expect(result.fileName).toMatch(/user123\/\d+\.jpg/);
		});

		it('should handle upload failure', async () => {
			mockFileSystem.getInfoAsync.mockResolvedValue({
				exists: true,
				size: 1024,
			});

			mockFileSystem.readAsStringAsync.mockResolvedValue('base64-data');

			mockSupabaseStorage.upload.mockResolvedValue({
				data: null,
				error: { message: 'Upload failed' },
			});

			const result = await imageProvider.uploadImage('file://test.jpg', {
				bucket: 'profiles',
				userId: 'user123',
			});

			expect(result.success).toBe(false);
			expect(result.error).toBe('Upload failed');
		});

		it('should handle invalid image file', async () => {
			mockFileSystem.getInfoAsync.mockResolvedValue({
				exists: false,
			});

			const result = await imageProvider.uploadImage(
				'file://nonexistent.jpg',
				{
					bucket: 'profiles',
					userId: 'user123',
				}
			);

			expect(result.success).toBe(false);
			expect(result.error).toBe('Image file does not exist');
		});
	});

	describe('uploadSneakerImages', () => {
		it('should upload multiple sneaker images', async () => {
			vi.spyOn(imageProvider, 'uploadImage').mockResolvedValue({
				success: true,
				url: 'https://example.com/test.jpg',
				fileName: 'test.jpg',
			});

			const images = [{ uri: 'file://1.jpg' }, { uri: 'file://2.jpg' }];

			const result = await imageProvider.uploadSneakerImages(
				images,
				'user123',
				'sneaker456'
			);

			expect(result).toHaveLength(2);
			expect(result[0].success).toBe(true);
			expect(result[1].success).toBe(true);
		});
	});

	describe('uploadProfileImage', () => {
		it('should upload profile image', async () => {
			vi.spyOn(imageProvider, 'uploadImage').mockResolvedValue({
				success: true,
				url: 'https://example.com/profile.jpg',
				fileName: 'profile.jpg',
			});

			const result = await imageProvider.uploadProfileImage(
				'file://profile.jpg',
				'user123'
			);

			expect(result.success).toBe(true);
			expect(result.url).toBe('https://example.com/profile.jpg');
		});
	});

	describe('deleteImage', () => {
		it('should delete image successfully', async () => {
			mockSupabaseStorage.remove.mockResolvedValue({
				error: null,
			});

			mockSupabaseStorage.list.mockResolvedValue({
				data: [],
				error: null,
			});

			const result = await imageProvider.deleteImage(
				'profiles',
				'user123/profile.jpg'
			);

			expect(result).toBe(true);
			expect(mockSupabaseStorage.remove).toHaveBeenCalledWith([
				'user123/profile.jpg',
			]);
		});

		it('should handle delete failure', async () => {
			mockSupabaseStorage.remove.mockResolvedValue({
				error: { message: 'Delete failed' },
			});

			const result = await imageProvider.deleteImage(
				'profiles',
				'user123/profile.jpg'
			);

			expect(result).toBe(false);
		});
	});

	describe('extractFilePathFromUrl', () => {
		it('should extract file path from Supabase URL', () => {
			const url =
				'https://example.com/storage/v1/object/public/profiles/user123/image.jpg';
			const result = imageProvider.extractFilePathFromUrl(
				url,
				'profiles'
			);

			expect(result).toBe('user123/image.jpg');
		});

		it('should return null for invalid URL', () => {
			const result = imageProvider.extractFilePathFromUrl(
				'invalid-url',
				'profiles'
			);

			expect(result).toBeNull();
		});

		it('should return null for null/undefined URL', () => {
			expect(
				imageProvider.extractFilePathFromUrl('', 'profiles')
			).toBeNull();
			expect(
				imageProvider.extractFilePathFromUrl(null as any, 'profiles')
			).toBeNull();
		});
	});

	describe('validateImageUri', () => {
		it('should validate valid image', async () => {
			mockFileSystem.getInfoAsync.mockResolvedValue({
				exists: true,
				size: 1024,
			});

			const result = await imageProvider.validateImageUri(
				'file://test.jpg'
			);

			expect(result.isValid).toBe(true);
			expect(result.size).toBe(1024);
		});

		it('should reject non-existent file', async () => {
			mockFileSystem.getInfoAsync.mockResolvedValue({
				exists: false,
			});

			const result = await imageProvider.validateImageUri(
				'file://nonexistent.jpg'
			);

			expect(result.isValid).toBe(false);
			expect(result.error).toBe('Image file does not exist');
		});

		it('should reject file that is too large', async () => {
			const largeFileSize = 15 * 1024 * 1024; // 15MB
			mockFileSystem.getInfoAsync.mockResolvedValue({
				exists: true,
				size: largeFileSize,
			});

			const result = await imageProvider.validateImageUri(
				'file://large.jpg'
			);

			expect(result.isValid).toBe(false);
			expect(result.error).toContain('Image file too large');
		});
	});

	describe('getImageInfo', () => {
		it('should get image info for existing file', async () => {
			mockFileSystem.getInfoAsync.mockResolvedValue({
				exists: true,
				size: 2048,
			});

			const result = await imageProvider.getImageInfo('file://test.jpg');

			expect(result.exists).toBe(true);
			expect(result.size).toBe(2048);
		});

		it('should handle non-existent file', async () => {
			mockFileSystem.getInfoAsync.mockResolvedValue({
				exists: false,
			});

			const result = await imageProvider.getImageInfo(
				'file://nonexistent.jpg'
			);

			expect(result.exists).toBe(false);
		});
	});

	describe('processAndUploadSneakerImages', () => {
		it('should process local files and upload them', async () => {
			vi.spyOn(imageProvider, 'uploadImage').mockResolvedValue({
				success: true,
				url: 'https://example.com/uploaded.jpg',
				fileName: 'user123/sneaker456/12345.jpg',
			});

			const images = [
				{ uri: 'file://local1.jpg', id: 'temp_1' },
				{ uri: 'file://local2.jpg', id: 'temp_2' },
			];

			const result = await imageProvider.processAndUploadSneakerImages(
				images,
				'user123',
				'sneaker456'
			);

			expect(result).toHaveLength(2);
			expect(result[0].id).toBe('user123/sneaker456/12345.jpg');
			expect(result[0].uri).toBe('https://example.com/uploaded.jpg');
		});

		it('should keep existing Supabase URLs unchanged', async () => {
			const images = [
				{
					uri: 'https://supabase.co/storage/v1/object/public/sneakers/user123/sneaker456/existing.jpg',
					id: 'existing-id',
				},
			];

			const result = await imageProvider.processAndUploadSneakerImages(
				images,
				'user123',
				'sneaker456'
			);

			expect(result).toHaveLength(1);
			expect(result[0].id).toBe('existing-id');
			expect(result[0].uri).toBe(
				'https://supabase.co/storage/v1/object/public/sneakers/user123/sneaker456/existing.jpg'
			);
		});

		it('should return empty array for empty input', async () => {
			const result = await imageProvider.processAndUploadSneakerImages(
				[],
				'user123',
				'sneaker456'
			);

			expect(result).toEqual([]);
		});
	});

	describe('deleteSneakerImages', () => {
		it('should delete all sneaker images', async () => {
			mockSupabaseStorage.list.mockResolvedValue({
				data: [{ name: 'image1.jpg' }, { name: 'image2.jpg' }],
				error: null,
			});

			mockSupabaseStorage.remove.mockResolvedValue({
				error: null,
			});

			const result = await imageProvider.deleteSneakerImages(
				'user123',
				'sneaker456'
			);

			expect(result).toBe(true);
			expect(mockSupabaseStorage.list).toHaveBeenCalledWith(
				'user123/sneaker456'
			);
			expect(mockSupabaseStorage.remove).toHaveBeenCalledWith([
				'user123/sneaker456/image1.jpg',
				'user123/sneaker456/image2.jpg',
			]);
		});

		it('should handle empty folder', async () => {
			mockSupabaseStorage.list.mockResolvedValue({
				data: [],
				error: null,
			});

			const result = await imageProvider.deleteSneakerImages(
				'user123',
				'sneaker456'
			);

			expect(result).toBe(true);
		});
	});

	describe('deleteUserFolder', () => {
		it('should delete all files in user folder', async () => {
			mockSupabaseStorage.list.mockResolvedValue({
				data: [{ name: 'file1.jpg' }, { name: 'file2.jpg' }],
				error: null,
			});

			mockSupabaseStorage.remove.mockResolvedValue({
				error: null,
			});

			const result = await imageProvider.deleteUserFolder(
				'profiles',
				'user123'
			);

			expect(result).toBe(true);
		});
	});

	describe('deleteAllUserFiles', () => {
		it('should delete files from both buckets', async () => {
			vi.spyOn(imageProvider, 'deleteUserFolder')
				.mockResolvedValueOnce(true) // sneakers bucket
				.mockResolvedValueOnce(true); // profiles bucket

			const result = await imageProvider.deleteAllUserFiles('user123');

			expect(result).toBe(true);
			expect(imageProvider.deleteUserFolder).toHaveBeenCalledWith(
				'sneakers',
				'user123'
			);
			expect(imageProvider.deleteUserFolder).toHaveBeenCalledWith(
				'profiles',
				'user123'
			);
		});

		it('should return false if any bucket deletion fails', async () => {
			vi.spyOn(imageProvider, 'deleteUserFolder')
				.mockResolvedValueOnce(false) // sneakers bucket fails
				.mockResolvedValueOnce(true); // profiles bucket succeeds

			const result = await imageProvider.deleteAllUserFiles('user123');

			expect(result).toBe(false);
		});
	});
});
