import { useCallback, useMemo } from 'react';

import { ScrollView, View } from 'react-native';

import { useChunkedCardData } from '@/components/screens/app/profile/hooks/useChunkedCardData';
import SneakerCard from '@/components/ui/cards/SneakerCard';
import BrandTitle from '@/components/ui/text/BrandTitle';
import { useModalStore } from '@/store/useModalStore';
import { Sneaker } from '@/types/sneaker';
import { brandLogos } from '@/validation/utils';

interface SneakersCardByBrandChunkedProps {
	sneakers: Sneaker[];
	onSneakerPress: (sneaker: Sneaker) => void;
	showOwnerInfo?: boolean;
	brandsPerChunk?: number;
	maxBrandsInMemory?: number;
	threshold?: number;
}

export default function SneakersCardByBrandChunked({
	sneakers,
	onSneakerPress,
	showOwnerInfo = false,
	brandsPerChunk = 3,
	maxBrandsInMemory = 8,
	threshold = 50,
}: SneakersCardByBrandChunkedProps) {
	const { setModalStep } = useModalStore();

	const {
		visibleBrands,
		isChunkingEnabled,
		totalBrands,
		loadedBrands,
		onScroll,
	} = useChunkedCardData(sneakers, {
		brandsPerChunk,
		maxBrandsInMemory,
		threshold,
	});

	const handleScroll = useCallback(
		(event: any) => {
			const { contentOffset, layoutMeasurement } = event.nativeEvent;
			const scrollY = contentOffset.y;
			const viewHeight = layoutMeasurement.height;

			onScroll(scrollY, viewHeight);
		},
		[
			onScroll,
			isChunkingEnabled,
			visibleBrands.length,
			totalBrands,
			loadedBrands,
		]
	);

	const scrollViewProps = useMemo(() => {
		const props = {
			onScroll: isChunkingEnabled ? handleScroll : undefined,
			scrollEventThrottle: isChunkingEnabled ? 16 : undefined,
			showsVerticalScrollIndicator: false,
			contentContainerStyle: { paddingTop: 0, paddingBottom: 20 },
		};

		return props;
	}, [isChunkingEnabled, handleScroll, visibleBrands.length, totalBrands]);

	return (
		<ScrollView className="flex-1" {...scrollViewProps}>
			<View className="flex-1 gap-4 pb-4">
				{visibleBrands.map((brandData) => {
					const { brandName, normalizedBrand, sneakers } = brandData;

					return (
						<View key={normalizedBrand} className="flex-1">
							<BrandTitle
								content={brandName}
								brandLogo={brandLogos[normalizedBrand]}
							/>
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								className="pl-2 py-2 pr-8"
								contentContainerStyle={{
									gap: 20,
								}}
							>
								{sneakers.map((sneaker) => (
									<SneakerCard
										key={sneaker.id}
										setModalVisible={() =>
											onSneakerPress(sneaker)
										}
										sneaker={sneaker}
										setSneaker={(s) => onSneakerPress(s)}
										setModalStep={setModalStep}
										showOwnerInfo={showOwnerInfo}
									/>
								))}
							</ScrollView>
						</View>
					);
				})}
			</View>
		</ScrollView>
	);
}
