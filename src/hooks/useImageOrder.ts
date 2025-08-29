import { SneakerPhoto } from '@/types/image';

export const useImageOrder = () => {
	const orderImages = (images: SneakerPhoto[]): SneakerPhoto[] => {
		if (!images || images.length === 0) return [];

		const referenceImages = images.filter(
			(img) => img.type === 'reference'
		);
		const personalImages = images.filter((img) => img.type === 'personal');
		const unknownImages = images.filter((img) => !img.type);

		return [...referenceImages, ...personalImages, ...unknownImages];
	};

	const getReferenceImage = (images: SneakerPhoto[]): SneakerPhoto | null => {
		const orderedImages = orderImages(images);
		return (
			orderedImages.find((img) => img.type === 'reference') ||
			orderedImages[0] ||
			null
		);
	};

	const getPersonalImages = (images: SneakerPhoto[]): SneakerPhoto[] => {
		return images.filter((img) => img.type === 'personal');
	};

	const getMainImage = (images: SneakerPhoto[]): SneakerPhoto | null => {
		const orderedImages = orderImages(images);
		return orderedImages[0] || null;
	};

	return {
		orderImages,
		getReferenceImage,
		getPersonalImages,
		getMainImage,
	};
};
