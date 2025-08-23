import { memo, useMemo } from 'react';

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

	const isOwner = useMemo(() => {
		return sneaker.owner?.id === user?.id;
	}, [sneaker.owner?.id, user?.id]);

	const formattedPrice = useMemo(() => {
		if (!sneaker.estimated_value) return null;
		return convertAndFormatdPrice(sneaker.estimated_value);
	}, [sneaker.estimated_value, convertAndFormatdPrice]);

	const ownerInfo = useMemo(() => {
		if (!sneaker.owner || !showOwnerInfo) return null;

		return (
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
		);
	}, [sneaker.owner, showOwnerInfo, isOwner, t]);

	const conditionText = useMemo(() => {
		return sneaker.condition ? `${sneaker.condition}/10` : 'N/A';
	}, [sneaker.condition]);

	const imageUri = useMemo(() => {
		return sneaker.images?.[0]?.uri;
	}, [sneaker.images]);

	return (
		<View className="bg-white py-2 px-4 border border-gray-100">
			<View
				className="flex-row justify-between items-center gap-3"
				pointerEvents="none"
			>
				<OptimizedSneakerImage
					imageUri={imageUri}
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
							{sneaker.brand?.name || 'Unknown'} -
						</Text>
						<SizeDisplay
							sneaker={sneaker}
							className="text-sm text-gray-500"
						/>
						{formattedPrice && (
							<Text className="text-sm text-gray-500">
								- {formattedPrice}
							</Text>
						)}
					</View>
					<Text className="text-sm text-gray-500">
						Condition: {conditionText}
					</Text>
					{ownerInfo}
				</View>
			</View>
		</View>
	);
}

export default memo(SneakerListItem, (prevProps, nextProps) => {
	if (prevProps.sneaker.id !== nextProps.sneaker.id) return false;
	if (prevProps.sneaker.model !== nextProps.sneaker.model) return false;
	if (prevProps.sneaker.brand !== nextProps.sneaker.brand) return false;
	if (prevProps.sneaker.estimated_value !== nextProps.sneaker.estimated_value)
		return false;
	if (prevProps.sneaker.condition !== nextProps.sneaker.condition)
		return false;
	if (
		prevProps.sneaker.images?.[0]?.uri !==
		nextProps.sneaker.images?.[0]?.uri
	)
		return false;
	if (prevProps.showOwnerInfo !== nextProps.showOwnerInfo) return false;

	return true;
});
