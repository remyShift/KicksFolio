import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { GitHubProvider } from '@/domain/GitHubProvider';
import { BugReportFormData } from '@/store/useBugReportStore';

vi.mock('react-native', () => ({
	Platform: {
		OS: 'ios',
		Version: '15.0',
	},
}));

vi.mock('expo-device', () => ({
	modelName: 'iPhone 13',
	deviceName: 'Test Device',
}));

vi.mock('expo-application', () => ({
	default: {
		nativeApplicationVersion: '1.0.0',
		nativeBuildVersion: '100',
	},
	nativeApplicationVersion: '1.0.0',
	nativeBuildVersion: '100',
}));

vi.mock('@/config/github/github.config', () => ({
	GITHUB_CONFIG: {
		API_URL: 'https://api.github.com',
		REPO_OWNER: 'testowner',
		REPO_NAME: 'testrepo',
		GITHUB_TOKEN: 'test_token',
	},
	validateGitHubConfig: vi.fn(() => true),
}));

global.fetch = vi.fn();

const fakeUrl = 'https://api.github.com/repos/testowner/testrepo';

describe('GitHubProvider', () => {
	let gitHubProvider: GitHubProvider;
	const mockFetch = global.fetch as Mock;

	const mockFormData: BugReportFormData = {
		title: 'Test Bug',
		description: 'Test description',
		stepsToReproduce: 'Test steps',
		expectedBehavior: 'Expected behavior',
		actualBehavior: 'Actual behavior',
		priority: 'medium' as 'low' | 'medium' | 'high',
		deviceInfo: 'Test device info',
	};

	beforeEach(() => {
		gitHubProvider = new GitHubProvider();
		mockFetch.mockClear();
		vi.clearAllMocks();
	});

	describe('createIssue', () => {
		it('should successfully create an issue', async () => {
			const mockResponse = {
				ok: true,
				json: async () => ({
					html_url: `${fakeUrl}/issues/123`,
					number: 123,
				}),
			};

			mockFetch.mockResolvedValue(mockResponse);

			const result = await gitHubProvider.createIssue(mockFormData);

			expect(result).toEqual({
				url: `${fakeUrl}/issues/123`,
				number: 123,
			});

			expect(mockFetch).toHaveBeenCalledWith(`${fakeUrl}/issues`, {
				method: 'POST',
				headers: {
					Accept: 'application/vnd.github.v3+json',
					Authorization: 'token test_token',
					'Content-Type': 'application/json',
				},
				body: expect.stringMatching(
					/"title":"\[Bug Report\] Test Bug"/
				),
			});
		});

		it('should format issue body correctly', async () => {
			const mockResponse = {
				ok: true,
				json: async () => ({
					html_url: `${fakeUrl}/issues/123`,
					number: 123,
				}),
			};

			mockFetch.mockResolvedValue(mockResponse);

			await gitHubProvider.createIssue(mockFormData);

			const callArgs = mockFetch.mock.calls[0][1];
			const body = JSON.parse(callArgs.body);

			expect(body.title).toBe('[Bug Report] Test Bug');
			expect(body.labels).toContain('bug');
			expect(body.labels).toContain('mobile-app');
			expect(body.labels).toContain('priority:medium');
			expect(body.body).toContain('## Description');
			expect(body.body).toContain('Test description');
			expect(body.body).toContain('## Steps to Reproduce');
			expect(body.body).toContain('Test steps');
			expect(body.body).toContain('## Device Information');
			expect(body.body).toContain('- OS: ios 15.0');
			expect(body.body).toContain('- Device: iPhone 13');
		});

		it('should handle different priority levels', async () => {
			const mockResponse = {
				ok: true,
				json: async () => ({
					html_url: `${fakeUrl}/issues/123`,
					number: 123,
				}),
			};

			mockFetch.mockResolvedValue(mockResponse);

			const highPriorityData = {
				...mockFormData,
				priority: 'high' as const,
			};
			await gitHubProvider.createIssue(highPriorityData);

			let callArgs = mockFetch.mock.calls[0][1];
			let body = JSON.parse(callArgs.body);
			expect(body.labels).toContain('priority:high');

			mockFetch.mockClear();

			const lowPriorityData = {
				...mockFormData,
				priority: 'low' as const,
			};
			await gitHubProvider.createIssue(lowPriorityData);

			callArgs = mockFetch.mock.calls[0][1];
			body = JSON.parse(callArgs.body);
			expect(body.labels).toContain('priority:low');
		});

		it('should throw error when GitHub config is invalid', async () => {
			const { validateGitHubConfig } = await import(
				'@/config/github/github.config'
			);
			(validateGitHubConfig as Mock).mockReturnValue(false);

			await expect(
				gitHubProvider.createIssue(mockFormData)
			).rejects.toThrow('GitHub configuration is not properly set up');

			expect(mockFetch).not.toHaveBeenCalled();
		});

		it('should handle API errors', async () => {
			const { validateGitHubConfig } = await import(
				'@/config/github/github.config'
			);
			(validateGitHubConfig as Mock).mockReturnValue(true);

			const mockResponse = {
				ok: false,
				status: 403,
				text: async () => 'Forbidden',
			};

			mockFetch.mockResolvedValue(mockResponse);

			await expect(
				gitHubProvider.createIssue(mockFormData)
			).rejects.toThrow(
				'Failed to create bug report: GitHub API Error: 403 - Forbidden'
			);
		});

		it('should handle network errors', async () => {
			const { validateGitHubConfig } = await import(
				'@/config/github/github.config'
			);
			(validateGitHubConfig as Mock).mockReturnValue(true);

			mockFetch.mockRejectedValue(new Error('Network error'));

			await expect(
				gitHubProvider.createIssue(mockFormData)
			).rejects.toThrow('Failed to create bug report: Network error');
		});
	});

	describe('validateConfiguration', () => {
		it('should return true for valid configuration', async () => {
			const mockResponse = {
				ok: true,
				json: async () => ({ name: 'testrepo' }),
			};

			mockFetch.mockResolvedValue(mockResponse);

			const result = await gitHubProvider.validateConfiguration();

			expect(result).toBe(true);
			expect(mockFetch).toHaveBeenCalledWith(
				fakeUrl,
				expect.objectContaining({
					method: 'GET',
					headers: expect.objectContaining({
						Accept: 'application/vnd.github.v3+json',
						Authorization: 'token test_token',
						'Content-Type': 'application/json',
					}),
				})
			);
		});

		it('should return false for invalid configuration', async () => {
			const mockResponse = {
				ok: false,
				status: 404,
				text: async () => 'Not Found',
			};

			mockFetch.mockResolvedValue(mockResponse);

			const consoleErrorSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			const result = await gitHubProvider.validateConfiguration();

			expect(result).toBe(false);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'GitHub configuration validation failed:',
				expect.any(Error)
			);

			consoleErrorSpy.mockRestore();
		});

		it('should handle network errors during validation', async () => {
			mockFetch.mockRejectedValue(new Error('Network error'));

			const consoleErrorSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			const result = await gitHubProvider.validateConfiguration();

			expect(result).toBe(false);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'GitHub configuration validation failed:',
				expect.any(Error)
			);

			consoleErrorSpy.mockRestore();
		});
	});
});
