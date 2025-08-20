import { useMemo } from 'react';

import { ScrollView, View } from 'react-native';

import SneakerCard from '@/components/ui/cards/SneakerCard';
import BrandTitle from '@/components/ui/text/BrandTitle';
import { useLocalSneakerData } from '@/hooks/useLocalSneakerData';
import { useModalStore } from '@/store/useModalStore';
import { Sneaker } from '@/types/sneaker';
import { brandLogos } from '@/validation/utils';

interface SneakersCardByBrandProps {
	sneakers: Sneaker[];
	onSneakerPress: (sneaker: Sneaker) => void;
	showOwnerInfo?: boolean;
}

export default function SneakersCardByBrand({
	sneakers,
	onSneakerPress,
	showOwnerInfo = false,
}: SneakersCardByBrandProps) {
	const { setModalStep } = useModalStore();
	const { filteredAndSortedSneakers } = useLocalSneakerData(sneakers);

	const sneakersByBrand = useMemo(() => {
		if (
			!filteredAndSortedSneakers ||
			filteredAndSortedSneakers.length === 0
		) {
			return {};
		}

		const result = filteredAndSortedSneakers.reduce(
			(acc, sneaker) => {
				const normalizedBrand = sneaker.brand.toLowerCase().trim();

				if (!acc[normalizedBrand]) {
					acc[normalizedBrand] = [];
				}
				acc[normalizedBrand].push(sneaker);
				return acc;
			},
			{} as Record<string, Sneaker[]>
		);

		return result;
	}, [filteredAndSortedSneakers]);

	return (
		<View className="flex-1 gap-4 pb-4">
			{Object.entries(sneakersByBrand).map(
				([normalizedBrand, sneakers]) => {
					const originalBrandName =
						sneakers[0]?.brand || normalizedBrand;

					return (
						<View key={normalizedBrand} className="flex-1">
							<BrandTitle
								content={originalBrandName}
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
				}
			)}
		</View>
	);
}
