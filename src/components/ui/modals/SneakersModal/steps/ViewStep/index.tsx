import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';

import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { PhotoCarousel } from '@/components/ui/images/photoCaroussel/PhotoCarousel';
import { ConditionBar } from '@/components/ui/indicators/ConditionBar';
import LoveButton from '@/components/ui/modals/SneakersModal/steps/ViewStep/LoveButton';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import SizeDisplay from '@/components/ui/text/SizeDisplay';
import { useSession } from '@/contexts/authContext';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useModalStore } from '@/store/useModalStore';
import { sneakerStatusOptions } from '@/validation/utils';

export const ViewStep = () => {
	const { t } = useTranslation();
	const { currentSneaker } = useModalStore();
	const { user } = useSession();
	const [errorMsg, setErrorMsg] = useState('');
	const { convertAndFormatdPrice } = useCurrencyStore();

	const isAnonymous = !user || user.is_anonymous;

	if (!currentSneaker) {
		return null;
	}

	const photos =
		currentSneaker.images?.map((image, index) => ({
			id: `${currentSneaker.id || 'temp'}-${index}`,
			uri: image.uri,
			alt: `${currentSneaker.model} image ${index + 1}`,
		})) || [];

	const sneakerModel =
		currentSneaker.gender === 'women'
			? `${currentSneaker.model} - WMNS`
			: currentSneaker.model;

	const getStatusLabel = (statusId: number): string => {
		const statusOption = sneakerStatusOptions.find(
			(option) => parseInt(option.value) === statusId
		);
		return statusOption ? statusOption.label : 'Unknown';
	};

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
				<View className="flex gap-0">
					<View
						testID="sneaker-display-name"
						className="flex-row items-center gap-1 text-wrap w-[95%]"
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

						<FontAwesome6
							name="box-archive"
							size={15}
							color={currentSneaker.og_box ? '#F27329' : 'gray'}
						/>
					</View>
				</View>

				{!isAnonymous && <LoveButton sneaker={currentSneaker} />}
			</View>

			<View className="flex gap-2">
				<View className="flex-row items-center w-full border-t-2 border-gray-200">
					<View className="flex-col items-center p-2 gap-1 w-1/3 border-r-2 border-gray-200">
						<Text className="font-open-sans text-center text-sm text-gray-900">
							{t('collection.fields.size')}
						</Text>
						<View className="w-4/5">
							<SizeDisplay
								sneaker={currentSneaker}
								className="font-open-sans-bold text-lg text-center text-gray-900"
							/>
						</View>
					</View>

					<View className="flex-col items-center p-2 gap-1 w-1/3 border-r-2 border-gray-200">
						<Text className="font-open-sans text-center text-sm text-gray-900">
							{t('collection.fields.status')}
						</Text>
						<View className="w-4/5">
							<Text className="font-open-sans-bold text-lg text-center text-gray-900">
								{getStatusLabel(
									currentSneaker.status_id
								).toUpperCase()}
							</Text>
						</View>
					</View>

					<View className="flex-col items-center p-2 gap-1 w-1/3">
						<Text className="font-open-sans text-center text-sm text-gray-900">
							{t('collection.fields.value')}
						</Text>
						<View className="w-4/5">
							<Text className="font-open-sans-bold text-lg text-center text-gray-900">
								{currentSneaker.estimated_value
									? convertAndFormatdPrice(
											currentSneaker.estimated_value
										)
									: 'N/A'}
							</Text>
						</View>
					</View>
				</View>

				<ConditionBar sneaker={currentSneaker} />

				<View
					style={{
						height: 150,
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
			</View>
		</View>
	);
};
