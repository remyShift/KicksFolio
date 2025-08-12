import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	GitHubIssueHandler,
	GitHubIssueHandlerInterface,
} from '@/domain/GitHubIssueHandler';
import { BugReportFormData } from '@/store/useBugReportStore';

const fakeUrl = 'https://github.com/testowner/testrepo/issues';

describe('GitHubIssueHandler', () => {
	let mockGitHubProvider: GitHubIssueHandlerInterface;
	let gitHubIssueHandler: GitHubIssueHandler;
	let consoleErrorSpy: any;

	beforeEach(() => {
		consoleErrorSpy = vi
			.spyOn(console, 'error')
			.mockImplementation(() => {});

		// Create mock provider
		mockGitHubProvider = {
			createIssue: vi.fn(),
			validateConfiguration: vi.fn(),
		};

		// Create GitHub issue handler instance with mock provider
		gitHubIssueHandler = new GitHubIssueHandler(mockGitHubProvider);
	});

	afterEach(() => {
		vi.restoreAllMocks();
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
			(mockGitHubProvider.createIssue as any).mockResolvedValue(
				mockCreateIssueResponse
			);

			const result = await gitHubIssueHandler.createIssue(mockFormData);

			expect(mockGitHubProvider.createIssue).toHaveBeenCalledWith(
				mockFormData
			);
			expect(result).toEqual(mockCreateIssueResponse);
			expect(consoleErrorSpy).not.toHaveBeenCalled();
		});

		it('should handle errors and rethrow them', async () => {
			const mockError = new Error('Test error');
			(mockGitHubProvider.createIssue as any).mockRejectedValue(
				mockError
			);

			await expect(
				gitHubIssueHandler.createIssue(mockFormData)
			).rejects.toThrow('Test error');

			expect(mockGitHubProvider.createIssue).toHaveBeenCalledWith(
				mockFormData
			);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'❌ GitHubIssueHandler.createIssue: Error occurred:',
				mockError
			);
		});

		it('should handle network errors', async () => {
			const networkError = new Error('Network request failed');
			(mockGitHubProvider.createIssue as any).mockRejectedValue(
				networkError
			);

			await expect(
				gitHubIssueHandler.createIssue(mockFormData)
			).rejects.toThrow('Network request failed');

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'❌ GitHubIssueHandler.createIssue: Error occurred:',
				networkError
			);
		});

		it('should handle GitHub API errors', async () => {
			const apiError = new Error('GitHub API Error: 403 - Forbidden');
			(mockGitHubProvider.createIssue as any).mockRejectedValue(apiError);

			await expect(
				gitHubIssueHandler.createIssue(mockFormData)
			).rejects.toThrow('GitHub API Error: 403 - Forbidden');

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'❌ GitHubIssueHandler.createIssue: Error occurred:',
				apiError
			);
		});

		it('should handle configuration errors', async () => {
			const configError = new Error(
				'GitHub configuration is not properly set up'
			);
			(mockGitHubProvider.createIssue as any).mockRejectedValue(
				configError
			);

			await expect(
				gitHubIssueHandler.createIssue(mockFormData)
			).rejects.toThrow('GitHub configuration is not properly set up');

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'❌ GitHubIssueHandler.createIssue: Error occurred:',
				configError
			);
		});
	});

	describe('validateConfiguration', () => {
		it('should successfully validate configuration and return true', async () => {
			(mockGitHubProvider.validateConfiguration as any).mockResolvedValue(
				true
			);

			const result = await gitHubIssueHandler.validateConfiguration();

			expect(mockGitHubProvider.validateConfiguration).toHaveBeenCalled();
			expect(result).toBe(true);
			expect(consoleErrorSpy).not.toHaveBeenCalled();
		});

		it('should return false when validation fails', async () => {
			(mockGitHubProvider.validateConfiguration as any).mockResolvedValue(
				false
			);

			const result = await gitHubIssueHandler.validateConfiguration();

			expect(mockGitHubProvider.validateConfiguration).toHaveBeenCalled();
			expect(result).toBe(false);
			expect(consoleErrorSpy).not.toHaveBeenCalled();
		});

		it('should handle errors and rethrow them', async () => {
			const mockError = new Error('Validation error');
			(mockGitHubProvider.validateConfiguration as any).mockRejectedValue(
				mockError
			);

			await expect(
				gitHubIssueHandler.validateConfiguration()
			).rejects.toThrow('Validation error');

			expect(mockGitHubProvider.validateConfiguration).toHaveBeenCalled();
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'❌ GitHubIssueHandler.validateConfiguration: Error occurred:',
				mockError
			);
		});

		it('should handle network errors during validation', async () => {
			const networkError = new Error('Failed to connect to GitHub API');
			(mockGitHubProvider.validateConfiguration as any).mockRejectedValue(
				networkError
			);

			await expect(
				gitHubIssueHandler.validateConfiguration()
			).rejects.toThrow('Failed to connect to GitHub API');

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'❌ GitHubIssueHandler.validateConfiguration: Error occurred:',
				networkError
			);
		});

		it('should handle API authentication errors', async () => {
			const authError = new Error('GitHub API Error: 401 - Unauthorized');
			(mockGitHubProvider.validateConfiguration as any).mockRejectedValue(
				authError
			);

			await expect(
				gitHubIssueHandler.validateConfiguration()
			).rejects.toThrow('GitHub API Error: 401 - Unauthorized');

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'❌ GitHubIssueHandler.validateConfiguration: Error occurred:',
				authError
			);
		});
	});
});
