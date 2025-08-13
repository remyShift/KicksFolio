import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { Image } from 'expo-image';

import EmptySneakerImage from '@/components/ui/placeholders/EmptySneakerImage';
import SizeDisplay from '@/components/ui/text/SizeDisplay';
import { useSession } from '@/contexts/authContext';
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
	const { t } = useTranslation();
	const isOwner = sneaker.owner?.id === user?.id;

	return (
		<View className="bg-white py-2 px-4 border border-gray-100">
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
					<Text
						className="text-lg font-semibold text-gray-900"
						numberOfLines={1}
						ellipsizeMode="tail"
					>
						{String(sneaker.model || '')}
					</Text>
					<View className="flex-row items-center gap-2 mt-1">
						<Text className="text-sm text-gray-600">
							{String(sneaker.brand || '')}
						</Text>
						<SizeDisplay
							sneaker={sneaker}
							className="text-sm text-gray-500"
						/>
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
