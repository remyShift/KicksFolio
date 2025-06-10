import { BaseApiService } from '@/services/BaseApiService';

export class CollectionService extends BaseApiService {
	async create(name: string, userId: string, sessionToken: string) {
		console.log('Creating collection with:', {
			name,
			userId,
			sessionToken,
		});
		console.log('Base URL:', this.baseUrl);

		const existingCollection = await this.getUserCollection(
			userId,
			sessionToken
		)
			.then((response) => response.collection)
			.catch(() => null);

		if (existingCollection) {
			throw new Error(
				'Vous avez déjà une collection. Vous ne pouvez pas en créer une autre.'
			);
		}

		return fetch(`${this.baseUrl}/users/${userId}/collection`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...this.getAuthHeaders(sessionToken),
			},
			body: JSON.stringify({ collection: { name } }),
		})
			.then(async (response) => {
				console.log('Response status:', response.status);
				const responseText = await response.text();
				console.log('Response text:', responseText);

				if (!response.ok) {
					const errorData = JSON.parse(responseText);
					throw new Error(
						errorData?.errors?.join(', ') ||
							errorData?.message ||
							errorData?.error ||
							'Échec de la création de la collection'
					);
				}

				return JSON.parse(responseText);
			})
			.catch((error) => {
				console.error('Error creating collection:', error);
				throw error;
			});
	}

	async getUserCollection(userId: string, token: string) {
		console.log('Getting user collection:', { userId, token });
		console.log('Base URL:', this.baseUrl);

		return fetch(`${this.baseUrl}/users/${userId}/collection`, {
			headers: this.getAuthHeaders(token),
		})
			.then(async (response) => {
				console.log('Response status:', response.status);
				const responseText = await response.text();
				console.log('Response text:', responseText);

				if (!response.ok) {
					return Promise.resolve()
						.then(() => {
							return JSON.parse(responseText);
						})
						.then((errorData) => {
							throw new Error(
								errorData?.errors?.join(', ') ||
									errorData?.message ||
									errorData?.error ||
									'Failed to get user collection'
							);
						})
						.catch(() => {
							throw new Error(
								responseText || 'Failed to get user collection'
							);
						});
				}

				return Promise.resolve()
					.then(() => {
						return JSON.parse(responseText);
					})
					.catch(() => {
						throw new Error('Invalid JSON response from server');
					});
			})
			.catch((error) => {
				console.error('Error getting user collection:', error);
				throw error;
			});
	}
}

export const collectionService = new CollectionService();
