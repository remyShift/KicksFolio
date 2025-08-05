import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
	GitHubInterface,
	GitHubProviderInterface,
} from '@/interfaces/GitHubInterface';
import { BugReportFormData } from '@/store/useBugReportStore';

const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

const fakeUrl = 'https://github.com/testowner/testrepo/issues';

describe('GitHubInterface', () => {
	beforeEach(() => {
		consoleErrorSpy.mockClear();
	});

	const mockFormData: BugReportFormData = {
		title: 'Test Bug',
		description: 'Test description',
		stepsToReproduce: 'Test steps',
		expectedBehavior: 'Expected behavior',
		actualBehavior: 'Actual behavior',
		priority: 'medium' as 'low' | 'medium' | 'high',
		deviceInfo: 'Test device info',
	};

	const mockCreateIssueResponse = {
		url: `${fakeUrl}/123`,
		number: 123,
	};

	describe('createIssue', () => {
		it('should successfully create an issue and return response', async () => {
			const mockCreateIssueFunction: GitHubProviderInterface['createIssue'] =
				vi.fn().mockResolvedValue(mockCreateIssueResponse);

			const result = await GitHubInterface.createIssue(
				mockFormData,
				mockCreateIssueFunction
			);

			expect(mockCreateIssueFunction).toHaveBeenCalledWith(mockFormData);
			expect(result).toEqual(mockCreateIssueResponse);
			expect(consoleErrorSpy).not.toHaveBeenCalled();
		});

		it('should handle errors and rethrow them', async () => {
			const mockError = new Error('Test error');
			const mockCreateIssueFunction: GitHubProviderInterface['createIssue'] =
				vi.fn().mockImplementation(() => Promise.reject(mockError));

			await expect(
				GitHubInterface.createIssue(
					mockFormData,
					mockCreateIssueFunction
				)
			).rejects.toThrow('Test error');

			expect(mockCreateIssueFunction).toHaveBeenCalledWith(mockFormData);
		});

		it('should handle network errors', async () => {
			const networkError = new Error('Network request failed');
			const mockCreateIssueFunction: GitHubProviderInterface['createIssue'] =
				vi.fn().mockImplementation(() => Promise.reject(networkError));

			await expect(
				GitHubInterface.createIssue(
					mockFormData,
					mockCreateIssueFunction
				)
			).rejects.toThrow('Network request failed');
		});

		it('should handle GitHub API errors', async () => {
			const apiError = new Error('GitHub API Error: 403 - Forbidden');
			const mockCreateIssueFunction: GitHubProviderInterface['createIssue'] =
				vi.fn().mockImplementation(() => Promise.reject(apiError));

			await expect(
				GitHubInterface.createIssue(
					mockFormData,
					mockCreateIssueFunction
				)
			).rejects.toThrow('GitHub API Error: 403 - Forbidden');
		});

		it('should handle configuration errors', async () => {
			const configError = new Error(
				'GitHub configuration is not properly set up'
			);
			const mockCreateIssueFunction: GitHubProviderInterface['createIssue'] =
				vi.fn().mockImplementation(() => Promise.reject(configError));

			await expect(
				GitHubInterface.createIssue(
					mockFormData,
					mockCreateIssueFunction
				)
			).rejects.toThrow('GitHub configuration is not properly set up');
		});
	});

	describe('validateConfiguration', () => {
		it('should successfully validate configuration and return true', async () => {
			const mockValidateConfigurationFunction: GitHubProviderInterface['validateConfiguration'] =
				vi.fn().mockResolvedValue(true);

			const result = await GitHubInterface.validateConfiguration(
				mockValidateConfigurationFunction
			);

			expect(mockValidateConfigurationFunction).toHaveBeenCalled();
			expect(result).toBe(true);
			expect(consoleErrorSpy).not.toHaveBeenCalled();
		});

		it('should return false when validation fails', async () => {
			const mockValidateConfigurationFunction: GitHubProviderInterface['validateConfiguration'] =
				vi.fn().mockResolvedValue(false);

			const result = await GitHubInterface.validateConfiguration(
				mockValidateConfigurationFunction
			);

			expect(mockValidateConfigurationFunction).toHaveBeenCalled();
			expect(result).toBe(false);
			expect(consoleErrorSpy).not.toHaveBeenCalled();
		});

		it('should handle errors and rethrow them', async () => {
			const mockError = new Error('Validation error');
			const mockValidateConfigurationFunction: GitHubProviderInterface['validateConfiguration'] =
				vi.fn().mockImplementation(() => Promise.reject(mockError));

			await expect(
				GitHubInterface.validateConfiguration(
					mockValidateConfigurationFunction
				)
			).rejects.toThrow('Validation error');

			expect(mockValidateConfigurationFunction).toHaveBeenCalled();
		});

		it('should handle network errors during validation', async () => {
			const networkError = new Error('Failed to connect to GitHub API');
			const mockValidateConfigurationFunction: GitHubProviderInterface['validateConfiguration'] =
				vi.fn().mockImplementation(() => Promise.reject(networkError));

			await expect(
				GitHubInterface.validateConfiguration(
					mockValidateConfigurationFunction
				)
			).rejects.toThrow('Failed to connect to GitHub API');
		});

		it('should handle API authentication errors', async () => {
			const authError = new Error('GitHub API Error: 401 - Unauthorized');
			const mockValidateConfigurationFunction: GitHubProviderInterface['validateConfiguration'] =
				vi.fn().mockImplementation(() => Promise.reject(authError));

			await expect(
				GitHubInterface.validateConfiguration(
					mockValidateConfigurationFunction
				)
			).rejects.toThrow('GitHub API Error: 401 - Unauthorized');
		});
	});
});
