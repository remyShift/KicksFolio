export interface AuthValidatorInterface {
	checkUsernameExists: (username: string) => Promise<boolean>;
	checkEmailExists: (email: string) => Promise<boolean>;
}

export class AuthValidator {
	constructor(private readonly authValidator: AuthValidatorInterface) {}

	checkUsernameExists = async (username: string) => {
		return this.authValidator
			.checkUsernameExists(username)
			.then((exists) => {
				return exists;
			})
			.catch((error) => {
				console.error(
					'❌ AuthValidatorProxy.checkUsernameExists: Error occurred:',
					error
				);
				return false;
			});
	};

	checkEmailExists = async (email: string) => {
		return this.authValidator
			.checkEmailExists(email)
			.then((exists) => {
				return exists;
			})
			.catch((error) => {
				console.error(
					'❌ AuthValidatorProxy.checkEmailExists: Error occurred:',
					error
				);
				return false;
			});
	};
}
