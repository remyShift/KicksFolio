import { BugReportFormData } from '@/store/useBugReportStore';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Application from 'expo-application';
import {
	GITHUB_CONFIG,
	validateGitHubConfig,
} from '@/config/github/github.config';

export interface GitHubIssueData {
	title: string;
	body: string;
	labels: string[];
}

export class GitHubService {
	private static readonly GITHUB_API_URL = GITHUB_CONFIG.API_URL;
	private static readonly REPO_OWNER = GITHUB_CONFIG.REPO_OWNER;
	private static readonly REPO_NAME = GITHUB_CONFIG.REPO_NAME;
	private static readonly GITHUB_TOKEN = GITHUB_CONFIG.GITHUB_TOKEN;

	private static async makeRequest(
		url: string,
		method: 'GET' | 'POST' = 'GET',
		body?: any
	): Promise<any> {
		const headers: HeadersInit = {
			Accept: 'application/vnd.github.v3+json',
			Authorization: `token ${this.GITHUB_TOKEN}`,
			'Content-Type': 'application/json',
		};

		const config: RequestInit = {
			method,
			headers,
		};

		if (body && method === 'POST') {
			config.body = JSON.stringify(body);
		}

		return fetch(url, config).then(async (response) => {
			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(
					`GitHub API Error: ${response.status} - ${errorText}`
				);
			}
			return response.json();
		});
	}

	private static async getDeviceInfo(): Promise<string> {
		const deviceInfo = [];

		deviceInfo.push(`**Device Info:**`);
		deviceInfo.push(`- OS: ${Platform.OS} ${Platform.Version}`);

		const deviceName = Device?.modelName || Device?.deviceName || 'Unknown';
		deviceInfo.push(`- Device: ${deviceName}`);

		const appVersion =
			Application?.nativeApplicationVersion || 'Development';
		deviceInfo.push(`- App Version: ${appVersion}`);

		const buildVersion = Application?.nativeBuildVersion || 'Development';
		deviceInfo.push(`- Build Version: ${buildVersion}`);

		if (Platform.OS === 'ios') {
			deviceInfo.push(`- iOS Version: ${Platform.Version}`);
		} else if (Platform.OS === 'android') {
			deviceInfo.push(`- Android API Level: ${Platform.Version}`);
		}

		if (Application?.nativeApplicationVersion === undefined) {
			deviceInfo.push(`- Environment: Development/Simulator`);
		}

		const result = deviceInfo.join('\n');
		console.log('✅ [GitHubService] Device info generated:', result);

		return result;
	}

	private static formatIssueBody(
		formData: BugReportFormData,
		deviceInfo: string
	): string {
		const body = [
			`## Description`,
			formData.description,
			``,
			`## Steps to Reproduce`,
			formData.stepsToReproduce,
			``,
			`## Expected Behavior`,
			formData.expectedBehavior,
			``,
			`## Actual Behavior`,
			formData.actualBehavior,
			``,
			`## Device Information`,
			deviceInfo,
			``,
			`## Priority`,
			formData.priority,
			``,
			`---`,
			`*This issue was automatically created from the mobile app.*`,
		];

		return body.join('\n');
	}

	private static getPriorityLabel(
		priority: 'low' | 'medium' | 'high'
	): string {
		switch (priority) {
			case 'low':
				return 'priority:low';
			case 'medium':
				return 'priority:medium';
			case 'high':
				return 'priority:high';
			default:
				return 'priority:medium';
		}
	}

	static async createIssue(
		formData: BugReportFormData
	): Promise<{ url: string; number: number }> {
		if (!validateGitHubConfig()) {
			throw new Error(
				'GitHub configuration is not properly set up. Please check config/github.config.ts'
			);
		}

		return this.getDeviceInfo()
			.then((deviceInfo) => {
				const priorityLabel = this.getPriorityLabel(formData.priority);

				const issueData: GitHubIssueData = {
					title: `[Bug Report] ${formData.title}`,
					body: this.formatIssueBody(formData, deviceInfo),
					labels: ['bug', 'mobile-app', priorityLabel],
				};

				const url = `${this.GITHUB_API_URL}/repos/${this.REPO_OWNER}/${this.REPO_NAME}/issues`;

				return this.makeRequest(url, 'POST', issueData);
			})
			.then((response) => {
				return {
					url: response.html_url,
					number: response.number,
				};
			})
			.catch((error) => {
				throw new Error(
					`Failed to create bug report: ${error.message}`
				);
			});
	}

	static async validateConfiguration(): Promise<boolean> {
		const url = `${this.GITHUB_API_URL}/repos/${this.REPO_OWNER}/${this.REPO_NAME}`;

		return this.makeRequest(url)
			.then(() => true)
			.catch((error) => {
				console.error('GitHub configuration validation failed:', error);
				return false;
			});
	}
}
