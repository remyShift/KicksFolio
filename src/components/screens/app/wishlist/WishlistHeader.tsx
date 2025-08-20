import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import ToggleDisplayState from '@/components/ui/buttons/ToggleDisplayState';
import Title from '@/components/ui/text/Title';
import { Sneaker } from '@/types/sneaker';

interface WishlistHeaderProps {
	wishlistSneakers: Sneaker[];
}

export default function WishlistHeader({
	wishlistSneakers,
}: WishlistHeaderProps) {
	const { t } = useTranslation();

	return (
		<View className="gap-8 pt-32">
			{wishlistSneakers && wishlistSneakers.length > 0 && (
				<View className="flex-row mb-8 items-center">
					<Title content={t('collection.pages.titles.wishlist')} />
					<ToggleDisplayState />
				</View>
			)}
		</View>
	);
}
