/**
 * Configuration GitHub pour le signalement de bugs
 *
 * IMPORTANT : Remplacez ces valeurs par vos propres informations GitHub
 *
 * Pour obtenir un token GitHub :
 * 1. Allez sur https://github.com/settings/tokens
 * 2. Cliquez sur "Generate new token" > "Generate new token (classic)"
 * 3. Donnez un nom à votre token (ex: "KicksFolio Bug Reports")
 * 4. Sélectionnez les permissions : "repo" (accès complet aux repositories)
 * 5. Cliquez sur "Generate token"
 * 6. Copiez le token et remplacez GITHUB_TOKEN ci-dessous
 */

export const GITHUB_CONFIG = {
	// Votre nom d'utilisateur GitHub
	REPO_OWNER: 'your-username',

	// Le nom de votre repository
	REPO_NAME: 'KicksFolio',

	// Votre token GitHub (à garder secret !)
	GITHUB_TOKEN: 'your-github-token-here',

	// URL de base de l'API GitHub (ne pas modifier)
	API_URL: 'https://api.github.com',
} as const;

/**
 * Validation de la configuration
 */
export const validateGitHubConfig = (): boolean => {
	const { REPO_OWNER, REPO_NAME, GITHUB_TOKEN } = GITHUB_CONFIG;

	if (REPO_OWNER === 'your-username') {
		console.warn('⚠️  GitHub config: REPO_OWNER needs to be configured');
		return false;
	}

	if (GITHUB_TOKEN === 'your-github-token-here') {
		console.warn('⚠️  GitHub config: GITHUB_TOKEN needs to be configured');
		return false;
	}

	if (!REPO_OWNER || !REPO_NAME || !GITHUB_TOKEN) {
		console.warn('⚠️  GitHub config: Missing required configuration');
		return false;
	}

	return true;
};
