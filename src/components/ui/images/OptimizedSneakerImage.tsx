import { memo, useMemo } from 'react';

import { View } from 'react-native';

import { Image } from 'expo-image';

import EmptySneakerImage from '@/components/ui/placeholders/EmptySneakerImage';

interface OptimizedSneakerImageProps {
	imageUri?: string;
	width?: number;
	height?: number;
	borderRadius?: number;
	contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
	priority?: 'low' | 'normal' | 'high';
}

function OptimizedSneakerImage({
	imageUri,
	width = 80,
	height = 80,
	borderRadius = 8,
	contentFit = 'contain',
	priority = 'low',
}: OptimizedSneakerImageProps) {
	// Mémoriser le style de l'image
	const imageStyle = useMemo(
		() => ({
			width,
			height,
			borderRadius,
			backgroundColor: 'transparent',
		}),
		[width, height, borderRadius]
	);

	// Mémoriser la source de l'image
	const imageSource = useMemo(
		() => ({
			uri: imageUri,
		}),
		[imageUri]
	);

	if (!imageUri) {
		return <EmptySneakerImage />;
	}

	return (
		<Image
			source={imageSource}
			style={imageStyle}
			contentFit={contentFit}
			cachePolicy="memory-disk"
			priority={priority}
			placeholder={require('@/assets/images/placeholder-sneaker.png')}
			placeholderContentFit="cover"
			transition={100}
			// Optimisations pour les performances
			recyclingKey={imageUri}
			allowDownscaling={true}
			enableLiveTextInteraction={false}
		/>
	);
}

export default memo(OptimizedSneakerImage, (prevProps, nextProps) => {
	// Optimisation de la comparaison pour éviter les re-rendus inutiles
	if (prevProps.imageUri !== nextProps.imageUri) return false;
	if (prevProps.width !== nextProps.width) return false;
	if (prevProps.height !== nextProps.height) return false;
	if (prevProps.borderRadius !== nextProps.borderRadius) return false;
	if (prevProps.contentFit !== nextProps.contentFit) return false;
	if (prevProps.priority !== nextProps.priority) return false;

	return true;
});
