import { memo } from 'react';

import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import OptimizedSneakerImage from '@/components/ui/images/OptimizedSneakerImage';
import SizeDisplay from '@/components/ui/text/SizeDisplay';
import { useSession } from '@/contexts/authContext';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { Sneaker } from '@/types/sneaker';

interface SneakerListItemProps {
	sneaker: Sneaker;
	showOwnerInfo?: boolean;
}

function SneakerListItem({
	sneaker,
	showOwnerInfo = false,
}: SneakerListItemProps) {
	const { user } = useSession();
	const { t } = useTranslation();
	const { convertAndFormatdPrice } = useCurrencyStore();
	const isOwner = sneaker.owner?.id === user?.id;

	return (
		<View className="bg-white py-2 px-4 border border-gray-100">
			<View
				className="flex-row justify-between items-center gap-3"
				pointerEvents="none"
			>
				<OptimizedSneakerImage
					imageUri={sneaker.images?.[0]?.uri}
					width={80}
					height={80}
					borderRadius={8}
					contentFit="contain"
					priority="low"
				/>

				<View className="flex-1">
					<Text
						className="text-lg font-semibold text-gray-900"
						numberOfLines={1}
						ellipsizeMode="tail"
					>
						{sneaker.model}
					</Text>
					<View className="flex-row items-center gap-1 mt-1">
						<Text className="text-sm text-gray-600">
							{sneaker.brand} -
						</Text>
						<SizeDisplay
							sneaker={sneaker}
							className="text-sm text-gray-500"
						/>
						{sneaker.estimated_value && (
							<Text className="text-sm text-gray-500">
								-{' '}
								{convertAndFormatdPrice(
									sneaker.estimated_value
								)}
							</Text>
						)}
					</View>
					<Text className="text-sm text-gray-500">
						Condition:{' '}
						{sneaker.condition ? `${sneaker.condition}/10` : 'N/A'}
					</Text>
					{sneaker.owner && showOwnerInfo && (
						<View className="flex-row items-center gap-1">
							<Text className="text-sm text-gray-500">
								{t('collection.cards.ownedBy')}
							</Text>
							<Text className="text-sm text-primary">
								{isOwner
									? t('collection.cards.me')
									: `@${sneaker.owner.username}`}
							</Text>
						</View>
					)}
				</View>
			</View>
		</View>
	);
}

export default memo(SneakerListItem, (prevProps, nextProps) => {
	return (
		prevProps.sneaker.id === nextProps.sneaker.id &&
		prevProps.sneaker.model === nextProps.sneaker.model &&
		prevProps.sneaker.brand === nextProps.sneaker.brand &&
		prevProps.sneaker.condition === nextProps.sneaker.condition &&
		prevProps.sneaker.images?.[0]?.uri ===
			nextProps.sneaker.images?.[0]?.uri &&
		prevProps.showOwnerInfo === nextProps.showOwnerInfo
	);
});
