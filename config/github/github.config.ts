export const GITHUB_CONFIG = {
	REPO_OWNER: process.env.EXPO_PUBLIC_GITHUB_CONFIG_REPO_OWNER,
	REPO_NAME: process.env.EXPO_PUBLIC_GITHUB_CONFIG_REPO_NAME,
	GITHUB_TOKEN: process.env.EXPO_PUBLIC_GITHUB_CONFIG_GITHUB_TOKEN,
	API_URL: process.env.EXPO_PUBLIC_GITHUB_CONFIG_API_URL,
};

export const validateGitHubConfig = (): boolean => {
	const { REPO_OWNER, REPO_NAME, GITHUB_TOKEN } = GITHUB_CONFIG;

	if (!REPO_OWNER) {
		console.warn('⚠️  GitHub config: REPO_OWNER needs to be configured');
		return false;
	}

	if (!GITHUB_TOKEN) {
		console.warn('⚠️  GitHub config: GITHUB_TOKEN needs to be configured');
		return false;
	}

	if (!REPO_OWNER || !REPO_NAME || !GITHUB_TOKEN) {
		console.warn('⚠️  GitHub config: Missing required configuration');
		return false;
	}

	return true;
};
