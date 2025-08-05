import { ScrollView, View } from 'react-native';

import SneakerCard from '@/components/ui/cards/SneakerCard';
import BrandTitle from '@/components/ui/text/BrandTitle';
import { useModalStore } from '@/store/useModalStore';
import { Sneaker } from '@/types/sneaker';

const brandLogos: Record<string, any> = {
	nike: require('@/assets/images/brands/nike.png'),
	adidas: require('@/assets/images/brands/adidas.png'),
	jordan: require('@/assets/images/brands/jordan.png'),
	'new balance': require('@/assets/images/brands/newbalance.png'),
	asics: require('@/assets/images/brands/asics.png'),
	puma: require('@/assets/images/brands/puma.png'),
	reebok: require('@/assets/images/brands/reebok.png'),
	converse: require('@/assets/images/brands/converse.png'),
	vans: require('@/assets/images/brands/vans.png'),
};

interface SneakersCardByBrandProps {
	sneakersByBrand: Record<string, Sneaker[]>;
	onSneakerPress: (sneaker: Sneaker) => void;
	showOwnerInfo?: boolean;
}

export default function SneakersCardByBrand({
	sneakersByBrand,
	onSneakerPress,
	showOwnerInfo = false,
}: SneakersCardByBrandProps) {
	const { setModalStep } = useModalStore();

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
								className="p-2"
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
