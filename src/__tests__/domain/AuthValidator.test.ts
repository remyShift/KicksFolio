import { describe, expect, it, vi } from 'vitest';

import { AuthValidator } from '@/domain/AuthValidator';

describe('AuthValidator', () => {
	describe('checkUsernameExists', () => {
		it('should return true when username exists', async () => {
			const mockCheckUsername = vi.fn().mockResolvedValue(true);

			const result = await AuthValidator.checkUsernameExists(
				'testuser',
				mockCheckUsername
			);

			expect(result).toBe(true);
			expect(mockCheckUsername).toHaveBeenCalledWith('testuser');
		});

		it('should return false when username does not exist', async () => {
			const mockCheckUsername = vi.fn().mockResolvedValue(false);

			const result = await AuthValidator.checkUsernameExists(
				'testuser',
				mockCheckUsername
			);

			expect(result).toBe(false);
			expect(mockCheckUsername).toHaveBeenCalledWith('testuser');
		});

		it('should handle errors and return false', async () => {
			const mockCheckUsername = vi
				.fn()
				.mockRejectedValue(new Error('Database error'));
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			const result = await AuthValidator.checkUsernameExists(
				'testuser',
				mockCheckUsername
			);

			expect(result).toBe(false);
			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ AuthValidator.checkUsernameExists: Error occurred:',
				new Error('Database error')
			);

			consoleSpy.mockRestore();
		});
	});

	describe('checkEmailExists', () => {
		it('should return true when email exists', async () => {
			const mockCheckEmail = vi.fn().mockResolvedValue(true);

			const result = await AuthValidator.checkEmailExists(
				'test@example.com',
				mockCheckEmail
			);

			expect(result).toBe(true);
			expect(mockCheckEmail).toHaveBeenCalledWith('test@example.com');
		});

		it('should return false when email does not exist', async () => {
			const mockCheckEmail = vi.fn().mockResolvedValue(false);

			const result = await AuthValidator.checkEmailExists(
				'test@example.com',
				mockCheckEmail
			);

			expect(result).toBe(false);
			expect(mockCheckEmail).toHaveBeenCalledWith('test@example.com');
		});

		it('should handle errors and return false', async () => {
			const mockCheckEmail = vi
				.fn()
				.mockRejectedValue(new Error('Network error'));
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			const result = await AuthValidator.checkEmailExists(
				'test@example.com',
				mockCheckEmail
			);

			expect(result).toBe(false);
			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ AuthValidator.checkEmailExists: Error occurred:',
				new Error('Network error')
			);

			consoleSpy.mockRestore();
		});
	});
});
