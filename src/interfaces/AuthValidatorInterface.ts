export interface AuthValidatorInterface {
	checkUsernameExists: (username: string) => Promise<boolean>;
	checkEmailExists: (email: string) => Promise<boolean>;
}

export class AuthValidatorInterface {
	static checkUsernameExists = async (
		username: string,
		checkUsernameFunction: AuthValidatorInterface['checkUsernameExists']
	) => {
		return checkUsernameFunction(username)
			.then((exists) => {
				return exists;
			})
			.catch((error) => {
				console.error(
					'❌ AuthValidatorInterface.checkUsernameExists: Error occurred:',
					error
				);
				return false;
			});
	};

	static checkEmailExists = async (
		email: string,
		checkEmailFunction: AuthValidatorInterface['checkEmailExists']
	) => {
		return checkEmailFunction(email)
			.then((exists) => {
				return exists;
			})
			.catch((error) => {
				console.error(
					'❌ AuthValidatorInterface.checkEmailExists: Error occurred:',
					error
				);
				return false;
			});
	};
}
