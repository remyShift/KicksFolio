import { SneakerPhoto } from '@/types/image';

export class SneakerImageHandler {
	static orderImages(images: SneakerPhoto[]): SneakerPhoto[] {
		if (!images || images.length === 0) return [];

		const referenceImages = images.filter(
			(img) => img.type === 'reference'
		);
		const personalImages = images.filter((img) => img.type === 'personal');
		const unknownImages = images.filter((img) => !img.type);

		return [...referenceImages, ...personalImages, ...unknownImages];
	}

	static getMainImage(images: SneakerPhoto[]): SneakerPhoto | null {
		const orderedImages = this.orderImages(images);
		return orderedImages[0] || null;
	}

	static getReferenceImage(images: SneakerPhoto[]): SneakerPhoto | null {
		return images.find((img) => img.type === 'reference') || null;
	}

	static getPersonalImages(images: SneakerPhoto[]): SneakerPhoto[] {
		return images.filter((img) => img.type === 'personal');
	}

	static hasReferenceImage(images: SneakerPhoto[]): boolean {
		return images.some((img) => img.type === 'reference');
	}

	static getImageStats(images: SneakerPhoto[]): {
		reference: number;
		personal: number;
		unknown: number;
		total: number;
	} {
		const reference = images.filter(
			(img) => img.type === 'reference'
		).length;
		const personal = images.filter((img) => img.type === 'personal').length;
		const unknown = images.filter((img) => !img.type).length;

		return {
			reference,
			personal,
			unknown,
			total: images.length,
		};
	}

	static combineImages(
		referenceImage?: { id: string; uri: string } | null,
		personalImages: SneakerPhoto[] = []
	): SneakerPhoto[] {
		const images: SneakerPhoto[] = [];

		if (referenceImage) {
			images.push({
				id: referenceImage.id,
				uri: referenceImage.uri,
				type: 'reference',
			});
		}

		personalImages.forEach((img) => {
			images.push({
				...img,
				type: 'personal',
			});
		});

		return images;
	}
}
