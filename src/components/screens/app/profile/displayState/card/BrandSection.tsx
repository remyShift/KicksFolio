import { memo, useCallback, useMemo } from 'react';

import { ScrollView, Text, View } from 'react-native';

import SneakerCard from '@/components/ui/cards/SneakerCard';
import BrandTitle from '@/components/ui/text/BrandTitle';
import { useModalStore } from '@/store/useModalStore';
import { Sneaker } from '@/types/sneaker';
import { brandLogos } from '@/validation/utils';

interface BrandSectionProps {
	brandName: string;
	normalizedBrand: string;
	visibleSneakers: Sneaker[];
	allSneakers: Sneaker[];
	isChunkingEnabled: boolean;
	loadedChunks: number;
	totalChunks: number;
	onSneakerPress: (sneaker: Sneaker) => void;
	onBrandScroll?: (
		brandName: string,
		scrollX: number,
		viewWidth: number
	) => void;
	showOwnerInfo?: boolean;
}

function BrandSection({
	brandName,
	normalizedBrand,
	visibleSneakers,
	allSneakers,
	isChunkingEnabled,
	loadedChunks,
	totalChunks,
	onSneakerPress,
	onBrandScroll,
	showOwnerInfo = false,
}: BrandSectionProps) {
	const { setModalStep } = useModalStore();

	const handleScroll = useCallback(
		(event: any) => {
			if (!isChunkingEnabled || !onBrandScroll) {
				return;
			}

			const { contentOffset, layoutMeasurement } = event.nativeEvent;
			const scrollX = contentOffset.x;
			const viewWidth = layoutMeasurement.width;

			onBrandScroll(normalizedBrand, scrollX, viewWidth);
		},
		[isChunkingEnabled, onBrandScroll, normalizedBrand]
	);

	const scrollViewProps = useMemo(() => {
		const props = {
			horizontal: true,
			showsHorizontalScrollIndicator: false,
			className: 'pl-2 py-2 pr-8',
			contentContainerStyle: { gap: 20 },
			onScroll: isChunkingEnabled ? handleScroll : undefined,
			scrollEventThrottle: isChunkingEnabled ? 16 : undefined,
		};

		return props;
	}, [
		isChunkingEnabled,
		handleScroll,
		brandName,
		visibleSneakers.length,
		allSneakers.length,
	]);

	const brandInfo = useMemo(() => {
		const info = {
			brandName,
			normalizedBrand,
			visibleCount: visibleSneakers.length,
			totalCount: allSneakers.length,
			isChunkingEnabled,
			loadedChunks,
			totalChunks,
			progressPercentage:
				allSneakers.length > 0
					? (visibleSneakers.length / allSneakers.length) * 100
					: 100,
		};

		return info;
	}, [
		brandName,
		normalizedBrand,
		visibleSneakers.length,
		allSneakers.length,
		isChunkingEnabled,
		loadedChunks,
		totalChunks,
	]);

	return (
		<View key={normalizedBrand} className="flex-1">
			<BrandTitle
				content={brandName}
				brandLogo={brandLogos[normalizedBrand]}
			/>
			<ScrollView {...scrollViewProps}>
				{visibleSneakers.map((sneaker, index) => {
					console.log(
						`🔑 [BrandSection] Rendering sneaker ${index} for brand ${brandName}:`,
						{
							id: sneaker.id,
							user_id: sneaker.user_id,
							brand: sneaker.brand,
							model: sneaker.model,
							key: sneaker.id,
						}
					);

					// Check for duplicates
					const duplicates = visibleSneakers.filter(
						(s) => s.id === sneaker.id
					);
					if (duplicates.length > 1) {
						console.error(
							`❌ [BrandSection] DUPLICATE KEY DETECTED for brand ${brandName}:`,
							{
								duplicateId: sneaker.id,
								count: duplicates.length,
								allDuplicates: duplicates.map((d) => ({
									id: d.id,
									user_id: d.user_id,
									brand: d.brand,
									model: d.model,
								})),
							}
						);
					}

					return (
						<SneakerCard
							key={`${sneaker.user_id}-${sneaker.id}-${index}`}
							setModalVisible={() => onSneakerPress(sneaker)}
							sneaker={sneaker}
							setSneaker={(s) => onSneakerPress(s)}
							setModalStep={setModalStep}
							showOwnerInfo={showOwnerInfo}
						/>
					);
				})}
				{isChunkingEnabled &&
					visibleSneakers.length < allSneakers.length && (
						<View className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
							<Text className="text-gray-400 text-sm">
								{`${visibleSneakers.length}/${allSneakers.length}`}
							</Text>
						</View>
					)}
			</ScrollView>
		</View>
	);
}

export default memo(BrandSection);
