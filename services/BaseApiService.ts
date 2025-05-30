export class BaseApiService {
	protected baseUrl: string;

	constructor() {
		this.baseUrl = process.env.EXPO_PUBLIC_BASE_API_URL!;
	}

	protected async handleResponse(response: Response) {
		console.log('response', response);
		const contentType = response.headers.get('content-type');

		if (contentType && contentType.includes('application/json')) {
			return response.json().then((data) => {
				console.log('data', data);
				if (!response.ok) {
					throw new Error(
						data.errors
							? data.errors.join(', ')
							: data.message || data.error || 'API Error'
					);
				}
				return data;
			});
		}

		return response.text().then((text) => {
			if (!response.ok) {
				throw new Error(text || 'API Error');
			}

			return Promise.resolve()
				.then(() => JSON.parse(text))
				.catch(() => text);
		});
	}

	protected getAuthHeaders(token?: string) {
		const headers: Record<string, string> = {
			Accept: 'application/json',
		};

		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		return headers;
	}
}
