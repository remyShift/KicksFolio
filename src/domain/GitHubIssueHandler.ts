import { BugReportFormData } from '@/store/useBugReportStore';

export interface GitHubIssueHandlerInterface {
	createIssue: (
		formData: BugReportFormData
	) => Promise<{ url: string; number: number }>;

	validateConfiguration: () => Promise<boolean>;
}

export class GitHubIssueHandler {
	constructor(
		private readonly gitHubIssueHandler: GitHubIssueHandlerInterface
	) {}

	createIssue = async (formData: BugReportFormData) => {
		return this.gitHubIssueHandler
			.createIssue(formData)
			.then((response) => {
				return response;
			})
			.catch((error) => {
				console.error(
					'❌ GitHubIssueHandler.createIssue: Error occurred:',
					error
				);
				throw error;
			});
	};

	validateConfiguration = async () => {
		return this.gitHubIssueHandler
			.validateConfiguration()
			.then((isValid) => {
				return isValid;
			})
			.catch((error) => {
				console.error(
					'❌ GitHubIssueHandler.validateConfiguration: Error occurred:',
					error
				);
				throw error;
			});
	};
}
