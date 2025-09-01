import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { PhotoCarousel } from '@/components/ui/images/photoCaroussel/PhotoCarousel';
import LoveButton from '@/components/ui/modals/SneakersModal/steps/ViewStep/LoveButton';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { useSession } from '@/contexts/authContext';
import { useModalStore } from '@/store/useModalStore';

export const WishlistViewStep = () => {
	const { t } = useTranslation();
	const { currentSneaker } = useModalStore();
	const { user } = useSession();
	const [errorMsg, setErrorMsg] = useState('');

	const isAnonymous = !user || user.is_anonymous;

	if (!currentSneaker) {
		return null;
	}

	const getPhotos = () => {
		if (!currentSneaker.images || currentSneaker.images.length === 0) {
			const singleImage = (currentSneaker as any).image;
			if (singleImage && singleImage.uri) {
				return [
					{
						id: `${currentSneaker.id}-0`,
						uri: singleImage.uri,
						alt: `${currentSneaker.model} image`,
					},
				];
			}
			return [];
		}

		return currentSneaker.images.map((image, index) => ({
			id: `${currentSneaker.id || 'temp'}-${index}`,
			uri: image.uri,
			alt: `${currentSneaker.model} image ${index + 1}`,
		}));
	};

	const photos = getPhotos();

	const sneakerModel =
		currentSneaker.gender === 'women'
			? `${currentSneaker.model} - WMNS`
			: currentSneaker.model;

	return (
		<View className="flex-1 gap-4">
			<ErrorMsg content={errorMsg} display={errorMsg !== ''} />

			{photos.length > 0 ? (
				<PhotoCarousel photos={photos} height={200} />
			) : (
				<View className="h-50 bg-gray-200 rounded-md flex items-center justify-center">
					<MaterialIcons name="image" size={48} color="gray" />
					<Text className="text-gray-500 mt-2">
						No images available
					</Text>
				</View>
			)}

			<View className="flex-row justify-between items-center">
				<View className="flex gap-0 w-[87%]">
					<View
						testID="sneaker-display-name"
						className="flex-row items-center gap-1 text-wrap"
					>
						<Text className="font-open-sans-bold text-lg text-gray-900">
							{sneakerModel}
						</Text>
					</View>
					<View className="flex-row items-center gap-2">
						<Text className="font-open-sans-bold-italic text-base text-gray-900">
							{currentSneaker.brand?.name?.toUpperCase() ||
								'Unknown'}
						</Text>

						{currentSneaker.sku && (
							<View className="flex-row items-center gap-1">
								<Text className="font-open-sans-bold text-sm text-gray-900">
									|
								</Text>
								<Text className="font-open-sans-bold text-sm text-gray-900">
									{currentSneaker.sku.toUpperCase()}
								</Text>
							</View>
						)}
					</View>
				</View>

				{!isAnonymous && <LoveButton sneaker={currentSneaker} />}
			</View>

			<View className="flex gap-2">
				<View
					style={{
						minHeight: 150,
					}}
					className="bg-white/60 rounded-md p-2 mt-2"
				>
					<Text className="font-open-sans-bold text-gray-900">
						{t('collection.fields.description')}
					</Text>
					<ScrollView
						style={{
							flex: 1,
							backgroundColor: 'white',
							marginTop: 8,
						}}
						showsVerticalScrollIndicator={true}
						indicatorStyle="black"
					>
						<Text className="font-open-sans text-sm text-gray-900">
							{currentSneaker.description ||
								'No description available'}
						</Text>
					</ScrollView>
				</View>

				<View className="bg-orange-100 rounded-md p-3 mt-2">
					<Text className="font-open-sans-bold text-orange-800 text-center">
						💫{' '}
						{t(
							'wishlist.viewNote',
							'This sneaker is in your wishlist'
						)}
					</Text>
				</View>
			</View>
		</View>
	);
};
