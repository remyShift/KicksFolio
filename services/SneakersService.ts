import { SneakerFormData } from '@/components/modals/SneakersModal/types';
import { BaseApiService } from '@/services/BaseApiService';

type ReactNativeFile = {
	uri: string;
	type: string;
	name: string;
};

declare global {
	namespace FormData {
		interface FormData {
			append(name: string, value: ReactNativeFile): void;
		}
	}
}

export class SneakersService extends BaseApiService {
	private userId: string;
	private sessionToken: string;

	constructor(userId: string, sessionToken: string) {
		super();
		this.userId = userId;
		this.sessionToken = sessionToken;
	}

	public async add(sneaker: SneakerFormData) {
		const formData = new FormData();
		formData.append('sneaker[model]', sneaker.model);
		formData.append('sneaker[brand]', sneaker.brand);
		formData.append('sneaker[size]', sneaker.size.toString());
		formData.append('sneaker[condition]', sneaker.condition.toString());
		formData.append('sneaker[status]', sneaker.status.toLowerCase());
		formData.append('sneaker[price_paid]', sneaker.price_paid.toString());
		formData.append('sneaker[description]', sneaker.description);

		if (sneaker.images && sneaker.images.length > 0) {
			this.appendImages(formData, sneaker.images);
		}

		const response = await fetch(
			`${this.baseUrl}/users/${this.userId}/collection/sneakers`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.sessionToken}`,
					Accept: 'application/json',
				},
				body: formData,
			}
		);

		const text = await response.text();
		if (!response.ok) {
			throw new Error(text);
		}
		return JSON.parse(text);
	}

	public async update(sneakerId: string, sneaker: SneakerFormData) {
		const formData = new FormData();
		formData.append('sneaker[model]', sneaker.model);
		formData.append('sneaker[brand]', sneaker.brand);
		formData.append('sneaker[size]', sneaker.size.toString());
		formData.append('sneaker[condition]', sneaker.condition.toString());
		formData.append('sneaker[status]', sneaker.status.toLowerCase());
		formData.append('sneaker[price_paid]', sneaker.price_paid.toString());
		formData.append('sneaker[description]', sneaker.description);

		if (sneaker.images && sneaker.images.length > 0) {
			this.appendImages(formData, sneaker.images);
		}

		const response = await fetch(
			`${this.baseUrl}/users/${this.userId}/collection/sneakers/${sneakerId}`,
			{
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${this.sessionToken}`,
					Accept: 'application/json',
				},
				body: formData,
			}
		);

		const text = await response.text();
		if (!response.ok) {
			throw new Error(text);
		}
		return JSON.parse(text);
	}

	public async delete(sneakerId: string) {
		const response = await fetch(
			`${this.baseUrl}/users/${this.userId}/collection/sneakers/${sneakerId}`,
			{
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${this.sessionToken}`,
				},
			}
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return true;
	}

	public async searchBySku(sku: string) {
		const response = await fetch(`${this.baseUrl}/sku_lookup?sku=${sku}`, {
			headers: {
				Authorization: `Bearer ${this.sessionToken}`,
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		if (!data) {
			throw new Error('No data found for this SKU');
		}
		return data;
	}

	public async getUserSneakers() {
		const response = await fetch(
			`${this.baseUrl}/users/${this.userId}/collection/sneakers`,
			{
				headers: this.getAuthHeaders(this.sessionToken),
			}
		);

		return this.handleResponse(response);
	}

	private appendImages(formData: FormData, images: Array<{ url: string }>) {
		images.forEach((image, index) => {
			const imageUriParts = image.url.split('.');
			const fileType = imageUriParts[imageUriParts.length - 1];

			const imageFile: ReactNativeFile = {
				uri: image.url,
				type: 'image/jpeg',
				name: `photo_${index}.${fileType}`,
			};

			const rnFormData = formData as FormData & {
				append(name: string, value: ReactNativeFile): void;
			};
			rnFormData.append('sneaker[images][]', imageFile);
		});
	}
}
