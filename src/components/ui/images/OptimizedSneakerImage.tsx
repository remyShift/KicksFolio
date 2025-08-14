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
			transition={200}
		/>
	);
}

export default memo(OptimizedSneakerImage, (prevProps, nextProps) => {
	return (
		prevProps.imageUri === nextProps.imageUri &&
		prevProps.width === nextProps.width &&
		prevProps.height === nextProps.height &&
		prevProps.borderRadius === nextProps.borderRadius &&
		prevProps.contentFit === nextProps.contentFit &&
		prevProps.priority === nextProps.priority
	);
});
