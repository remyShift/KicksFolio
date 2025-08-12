import { useTranslation } from 'react-i18next';

import { GitHubIssueHandler } from '@/domain/GitHubIssueHandler';
import useToast from '@/hooks/ui/useToast';
import { useBugReportStore } from '@/store/useBugReportStore';
import { gitHubProxy } from '@/tech/proxy/GitHubProxy';

const useBugReport = () => {
	const { t } = useTranslation();
	const { showSuccessToast, showErrorToast } = useToast();
	const { setErrorMsg, setIsLoading, resetStore, formData } =
		useBugReportStore();

	const gitHub = new GitHubIssueHandler(gitHubProxy);

	const validateForm = (): boolean => {
		if (!formData.title.trim()) {
			setErrorMsg(t('settings.bugReport.validation.titleRequired'));
			return false;
		}

		if (!formData.description.trim()) {
			setErrorMsg(t('settings.bugReport.validation.descriptionRequired'));
			return false;
		}

		if (!formData.stepsToReproduce.trim()) {
			setErrorMsg(t('settings.bugReport.validation.stepsRequired'));
			return false;
		}

		return true;
	};

	const handleReportBugSubmit = async () => {
		if (!validateForm()) return;

		setIsLoading(true);
		setErrorMsg('');

		gitHub
			.createIssue(formData)
			.then((result) => {
				showSuccessToast(
					t('settings.bugReport.success.title'),
					t('settings.bugReport.success.description', {
						number: result.number,
					})
				);
				resetStore();
			})
			.catch((error) => {
				console.error('Error creating bug report:', error);
				setErrorMsg(t('settings.bugReport.error.createFailed'));
				showErrorToast(
					t('settings.bugReport.error.title'),
					t('settings.bugReport.error.description')
				);
			})
			.finally(() => {
				setIsLoading(false);
			});
	};

	const priorityOptions = [
		{
			label: t('settings.bugReport.fields.priority.low'),
			value: 'low',
		},
		{
			label: t('settings.bugReport.fields.priority.medium'),
			value: 'medium',
		},
		{
			label: t('settings.bugReport.fields.priority.high'),
			value: 'high',
		},
	];

	const colorConfig = {
		low: {
			bg: 'bg-green-500',
			border: 'border-green-500',
			text: 'text-white',
		},
		medium: {
			bg: 'bg-yellow-500',
			border: 'border-yellow-500',
			text: 'text-white',
		},
		high: {
			bg: 'bg-red-500',
			border: 'border-red-500',
			text: 'text-white',
		},
	};

	return {
		handleReportBugSubmit,
		validateForm,
		priorityOptions,
		colorConfig,
	};
};

export default useBugReport;
