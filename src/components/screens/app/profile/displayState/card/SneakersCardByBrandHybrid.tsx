import { useCallback, useMemo } from 'react';

import { ScrollView, View } from 'react-native';

import { useHybridCardData } from '@/components/screens/app/profile/displayState/card/hooks/useHybridCardData';
import { Sneaker } from '@/types/sneaker';

import BrandSection from './BrandSection';

interface SneakersCardByBrandHybridProps {
	sneakers: Sneaker[];
	onSneakerPress: (sneaker: Sneaker) => void;
	showOwnerInfo?: boolean;
	chunkSize?: number;
	sneakersThreshold?: number;
	maxSneakersPerBrandInMemory?: number;
}

export default function SneakersCardByBrandHybrid({
	sneakers,
	onSneakerPress,
	showOwnerInfo = false,
	chunkSize = 10,
	sneakersThreshold = 20,
	maxSneakersPerBrandInMemory = 30,
}: SneakersCardByBrandHybridProps) {
	const {
		brandSections,
		totalBrands,
		onScroll,
		onBrandScroll,
		forceMemoryCleanup,
	} = useHybridCardData(sneakers, {
		chunkSize,
		sneakersThreshold,
		maxSneakersPerBrandInMemory,
	});

	const handleVerticalScroll = useCallback(
		(event: any) => {
			const { contentOffset, layoutMeasurement } = event.nativeEvent;
			const scrollY = contentOffset.y;
			const viewHeight = layoutMeasurement.height;

			onScroll(scrollY, viewHeight);
		},
		[onScroll, totalBrands, brandSections]
	);

	const handleBrandScroll = useCallback(
		(brandName: string, scrollX: number, viewWidth: number) => {
			onBrandScroll(brandName, scrollX, viewWidth);
		},
		[onBrandScroll]
	);

	const scrollViewProps = useMemo(() => {
		const hasChunkedBrands = brandSections.some(
			(section) => section.isChunkingEnabled
		);

		const props = {
			onScroll: hasChunkedBrands ? handleVerticalScroll : undefined,
			scrollEventThrottle: hasChunkedBrands ? 16 : undefined,
			showsVerticalScrollIndicator: false,
			contentContainerStyle: { paddingTop: 0, paddingBottom: 20 },
		};

		return props;
	}, [handleVerticalScroll, totalBrands, brandSections]);

	return (
		<ScrollView className="flex-1" {...scrollViewProps}>
			<View className="flex-1 gap-4 pb-4">
				{brandSections.map((section) => (
					<BrandSection
						key={section.normalizedBrand}
						brandName={section.brandName}
						normalizedBrand={section.normalizedBrand}
						visibleSneakers={section.visibleSneakers}
						allSneakers={section.allSneakers}
						isChunkingEnabled={section.isChunkingEnabled}
						loadedChunks={section.loadedChunks}
						totalChunks={section.totalChunks}
						onSneakerPress={onSneakerPress}
						onBrandScroll={handleBrandScroll}
						showOwnerInfo={showOwnerInfo}
					/>
				))}
			</View>
		</ScrollView>
	);
}
