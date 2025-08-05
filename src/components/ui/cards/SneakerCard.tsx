import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { Image } from 'expo-image';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { ModalStep } from '@/components/ui/modals/SneakersModal/types';
import { useSession } from '@/contexts/authContext';
import { Sneaker } from '@/types/sneaker';

import SizeDisplay from '../text/SizeDisplay';

export default function SneakerCard({
	sneaker,
	setModalStep,
	setModalVisible,
	setSneaker,
	showOwnerInfo = false,
}: {
	sneaker: Sneaker;
	setModalStep: (step: ModalStep) => void;
	setModalVisible: (visible: boolean) => void;
	setSneaker: (sneaker: Sneaker) => void;
	showOwnerInfo?: boolean;
}) {
	const { user } = useSession();
	const { t } = useTranslation();

	return (
		<Pressable
			className="bg-white rounded-md p-3 gap-2 shadow-card w-80"
			onPress={() => {
				setSneaker(sneaker);
				setModalStep('view');
				setModalVisible(true);
			}}
			testID="sneaker-card"
			hitSlop={{
				top: 10,
				bottom: 10,
				left: 10,
				right: 10,
			}}
			android_ripple={{
				color: '#f3f4f6',
				borderless: false,
			}}
		>
			<View pointerEvents="none">
				{sneaker.images?.[0]?.uri ? (
					<Image
						source={{
							uri: sneaker.images[0].uri,
						}}
						style={{
							width: '100%',
							minHeight: 150,
							flex: 1,
							borderRadius: 8,
						}}
						contentFit="cover"
						contentPosition="center"
						cachePolicy="memory-disk"
						transition={200}
					/>
				) : (
					<View
						className="w-full h-45 bg-gray-200 rounded-lg flex items-center justify-center"
						style={{
							minHeight: 150,
						}}
					>
						<MaterialCommunityIcons
							name="shoe-sneaker"
							size={48}
							color="#9CA3AF"
						/>
						<Text className="text-gray-500 mt-2 text-sm">
							No image
						</Text>
					</View>
				)}

				<View className="flex flex-row justify-between items-center px-1">
					<Text
						className="font-open-sans-bold text-lg flex-1 mr-2 flex-shrink"
						numberOfLines={1}
						ellipsizeMode="tail"
					>
						{sneaker.model}
					</Text>
					<SizeDisplay
						sneaker={sneaker}
						className="text-primary font-open-sans-bold text-lg flex-shrink-0"
					/>
				</View>

				{showOwnerInfo && sneaker.owner && (
					<View className="flex-row items-center mt-2 gap-1">
						<Text className="font-open-sans text-xs text-gray-600 uppercase">
							{t('collection.cards.ownedBy')}
						</Text>
						<Text className="font-open-sans text-sm text-primary mb-1">
							{sneaker.owner.username === user!.username
								? 'me'
								: `@${sneaker.owner.username}`}
						</Text>
					</View>
				)}
			</View>
		</Pressable>
	);
}
