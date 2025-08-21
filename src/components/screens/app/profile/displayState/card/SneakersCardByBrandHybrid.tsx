import { memo, useCallback, useMemo } from 'react';

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

function SneakersCardByBrandHybrid({
	sneakers,
	onSneakerPress,
	showOwnerInfo = false,
	chunkSize = 10,
	sneakersThreshold = 20,
	maxSneakersPerBrandInMemory = 30,
}: SneakersCardByBrandHybridProps) {
	console.log(
		`🔄 [SneakersCardByBrandHybrid] Render avec ${sneakers.length} sneakers`
	);
	const { brandSections, onScroll, onBrandScroll } = useHybridCardData(
		sneakers,
		{
			chunkSize,
			sneakersThreshold,
			maxSneakersPerBrandInMemory,
		}
	);

	const hasChunkedBrands = brandSections.some(
		(section) => section.isChunkingEnabled
	);

	const handleVerticalScroll = useCallback(
		(event: any) => {
			if (!hasChunkedBrands) return;
			const { contentOffset, layoutMeasurement } = event.nativeEvent;
			onScroll(contentOffset.y, layoutMeasurement.height);
		},
		[hasChunkedBrands, onScroll]
	);

	const handleBrandScroll = useCallback(
		(brandName: string, scrollX: number, viewWidth: number) => {
			onBrandScroll(brandName, scrollX, viewWidth);
		},
		[onBrandScroll]
	);

	const scrollViewProps = useMemo(
		() => ({
			onScroll: hasChunkedBrands ? handleVerticalScroll : undefined,
			scrollEventThrottle: hasChunkedBrands ? 16 : undefined,
			showsVerticalScrollIndicator: false,
			contentContainerStyle: { paddingTop: 0, paddingBottom: 20 },
		}),
		[hasChunkedBrands, handleVerticalScroll]
	);

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

export default memo(SneakersCardByBrandHybrid, (prevProps, nextProps) => {
	// Debug : identifier quelles props changent
	const propsChanged = {
		sneakers: prevProps.sneakers !== nextProps.sneakers,
		onSneakerPress: prevProps.onSneakerPress !== nextProps.onSneakerPress,
		showOwnerInfo: prevProps.showOwnerInfo !== nextProps.showOwnerInfo,
		chunkSize: prevProps.chunkSize !== nextProps.chunkSize,
		sneakersThreshold:
			prevProps.sneakersThreshold !== nextProps.sneakersThreshold,
		maxSneakersPerBrandInMemory:
			prevProps.maxSneakersPerBrandInMemory !==
			nextProps.maxSneakersPerBrandInMemory,
	};

	const hasChanges = Object.values(propsChanged).some(Boolean);
	if (hasChanges) {
		console.log(
			'🔄 [SneakersCardByBrandHybrid memo] Props qui ont changé:',
			Object.entries(propsChanged)
				.filter(([, changed]) => changed)
				.map(([prop]) => prop)
		);
	}

	// Retourner true = pas de re-render, false = re-render
	return !hasChanges;
});
