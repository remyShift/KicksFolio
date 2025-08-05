import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

import { Image } from 'expo-image';

import EmptySneakerImage from '@/components/ui/placeholders/EmptySneakerImage';
import SizeDisplay from '@/components/ui/text/SizeDisplay';
import { useSession } from '@/context/authContext';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { Sneaker } from '@/types/sneaker';

interface SneakerListItemProps {
	sneaker: Sneaker;
	onPress: (sneaker: Sneaker) => void;
	showOwnerInfo?: boolean;
}

export default function SneakerListItem({
	sneaker,
	onPress,
	showOwnerInfo = false,
}: SneakerListItemProps) {
	const { user } = useSession();
	const { formattedPrice } = useCurrencyStore();
	const { t } = useTranslation();

	return (
		<TouchableOpacity
			className="bg-white py-2 px-4 border border-gray-100 mb-1"
			onPress={() => onPress(sneaker)}
			activeOpacity={0.7}
			hitSlop={{
				top: 5,
				bottom: 5,
				left: 5,
				right: 5,
			}}
		>
			<View
				className="flex-row justify-between items-center gap-3"
				pointerEvents="none"
			>
				{sneaker.images?.[0]?.uri ? (
					<Image
						source={{
							uri: sneaker.images[0].uri,
						}}
						style={{
							width: 80,
							height: 80,
							borderRadius: 8,
							backgroundColor: 'transparent',
						}}
						contentFit="contain"
						cachePolicy="memory-disk"
						testID="sneaker-image"
					/>
				) : (
					<EmptySneakerImage />
				)}

				<View className="flex-1">
					<View className="flex-row items-center gap-1">
						<Text className="text-sm text-gray-600 mt-1">
							{sneaker.brand || ''}
						</Text>
						{sneaker.sku && (
							<View className="flex-row items-center gap-1 mt-1">
								<Text className="text-xs text-gray-600">|</Text>
								<Text className="text-xs text-gray-600">
									{sneaker.sku.toUpperCase()}
								</Text>
							</View>
						)}
					</View>
					<Text
						className="text-lg font-semibold text-gray-900"
						numberOfLines={1}
						ellipsizeMode="tail"
					>
						{sneaker.model || ''}
					</Text>

					<View className="flex-row items-center gap-4">
						<SizeDisplay
							sneaker={sneaker}
							className="text-sm text-gray-500"
						/>
						<Text className="text-sm text-gray-500">
							{t('collection.fields.condition')} :{' '}
							{sneaker.condition
								? `${sneaker.condition}/10`
								: 'N/A'}
						</Text>
						{sneaker.price_paid > 0 && (
							<Text className="text-sm font-medium text-green-600">
								{formattedPrice(sneaker.price_paid)}
							</Text>
						)}
					</View>

					{showOwnerInfo && sneaker.owner && (
						<View className="flex-row items-center mt-2 gap-1">
							<Text className="font-open-sans text-xs text-gray-600 uppercase">
								{t('collection.cards.ownedBy')}
							</Text>
							<Text className="font-open-sans text-sm text-primary pb-1">
								{sneaker.owner.username === user!.username
									? t('collection.cards.me')
									: `@${sneaker.owner.username}`}
							</Text>
						</View>
					)}
				</View>
			</View>
		</TouchableOpacity>
	);
}
