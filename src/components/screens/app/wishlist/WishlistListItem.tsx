import { memo, useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

import { Image } from 'expo-image';

import useToast from '@/hooks/ui/useToast';
import { wishlist } from '@/services/wishlist';
import { Sneaker } from '@/types/sneaker';
import { brandLogos } from '@/validation/utils';

interface WishlistListItemProps {
	sneaker: Sneaker;
}

function WishlistListItem({ sneaker }: WishlistListItemProps) {
	const { t } = useTranslation();
	const { showSuccessToast, showErrorToast } = useToast();

	const handleRemoveFromWishlist = useCallback(async () => {
		try {
			await wishlist.remove(sneaker.id);
			showSuccessToast(
				t('wishlist.messages.removed.title'),
				t('wishlist.messages.removed.description')
			);
		} catch (error) {
			console.error('Failed to remove from wishlist:', error);
			showErrorToast(
				t('wishlist.messages.removeFailed.title'),
				t('wishlist.messages.removeFailed.description')
			);
		}
	}, [sneaker.id, showSuccessToast, showErrorToast, t]);

	const brandLogo = brandLogos[sneaker.brand?.toLowerCase()];

	return (
		<View
			className="flex-row items-center py-3 px-4 bg-white border-b border-gray-100"
			style={{ backgroundColor: '#ffffff', minHeight: 80 }}
		>
			<View
				className="w-16 h-16 mr-4 rounded-lg overflow-hidden bg-gray-100"
				style={{
					width: 64,
					height: 64,
					backgroundColor: '#f3f4f6',
					borderRadius: 8,
					overflow: 'hidden',
				}}
			>
				{sneaker.images && sneaker.images.length > 0 ? (
					<Image
						source={{ uri: sneaker.images[0].uri }}
						className="w-full h-full"
						contentFit="cover"
						placeholder={require('@/assets/images/placeholder-sneaker.png')}
						placeholderContentFit="cover"
						onError={(error) => {
							console.error(
								`❌ WishlistListItem image error for ${sneaker.model}:`,
								error
							);
							console.error(
								'❌ Failed URI:',
								sneaker.images[0].uri
							);
							console.error(
								'❌ Full error details:',
								JSON.stringify(error, null, 2)
							);
						}}
						style={{
							width: '100%',
							height: '100%',
							backgroundColor: '#f3f4f6',
						}}
					/>
				) : (
					<Image
						source={require('@/assets/images/placeholder-sneaker.png')}
						className="w-full h-full"
						contentFit="cover"
					/>
				)}
			</View>

			<View className="flex-1 mr-4">
				<View className="flex-row items-center mb-1">
					{brandLogo && (
						<Image
							source={brandLogo}
							className="w-5 h-5 mr-2"
							contentFit="contain"
						/>
					)}
					<Text className="text-sm font-medium text-gray-600 capitalize">
						{sneaker.brand}
					</Text>
				</View>

				<Text className="text-base font-semibold text-gray-900 mb-1">
					{sneaker.model}
				</Text>

				{sneaker.sku && (
					<Text className="text-xs text-gray-500">
						SKU: {sneaker.sku}
					</Text>
				)}

				{sneaker.wishlist_added_at && (
					<Text className="text-xs text-gray-400 mt-1">
						{t('wishlist.addedOn', {
							date: new Date(
								sneaker.wishlist_added_at
							).toLocaleDateString(),
						})}
					</Text>
				)}
			</View>

			<TouchableOpacity
				onPress={handleRemoveFromWishlist}
				className="bg-red-500 px-3 py-2 rounded-md"
				activeOpacity={0.7}
			>
				<Text className="text-white text-xs font-medium">
					{t('wishlist.remove')}
				</Text>
			</TouchableOpacity>
		</View>
	);
}

export default memo(WishlistListItem);
