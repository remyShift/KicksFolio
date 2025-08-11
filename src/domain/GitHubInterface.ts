import { BugReportFormData } from '@/store/useBugReportStore';

export interface GitHubProviderInterface {
	createIssue: (
		formData: BugReportFormData
	) => Promise<{ url: string; number: number }>;

	validateConfiguration: () => Promise<boolean>;
}

export class GitHubInterface {
	static createIssue = async (
		formData: BugReportFormData,
		createIssueFunction: GitHubProviderInterface['createIssue']
	) => {
		return createIssueFunction(formData)
			.then((response) => {
				return response;
			})
			.catch((error) => {
				console.error(
					'❌ GitHubInterface.createIssue: Error occurred:',
					error
				);
				throw error;
			});
	};

	static validateConfiguration = async (
		validateConfigurationFunction: GitHubProviderInterface['validateConfiguration']
	) => {
		return validateConfigurationFunction()
			.then((isValid) => {
				return isValid;
			})
			.catch((error) => {
				console.error(
					'❌ GitHubInterface.validateConfiguration: Error occurred:',
					error
				);
				throw error;
			});
	};
}
