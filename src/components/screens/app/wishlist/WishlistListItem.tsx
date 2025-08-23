import { memo } from 'react';

import { Text, View } from 'react-native';

import OptimizedSneakerImage from '@/components/ui/images/OptimizedSneakerImage';
import { Sneaker } from '@/types/sneaker';

interface WishlistListItemProps {
	sneaker: Sneaker;
}

function WishlistListItem({ sneaker }: WishlistListItemProps) {
	return (
		<View className="bg-white py-2 px-4 border border-gray-100">
			<View
				className="flex-row justify-between items-center gap-3"
				pointerEvents="none"
			>
				<OptimizedSneakerImage
					imageUri={sneaker.images?.[0]?.uri || ''}
					width={80}
					height={80}
					borderRadius={8}
					contentFit="contain"
					priority="low"
				/>

				<View className="flex-1 mr-4">
					<Text className="text-base font-semibold text-gray-900 mb-1">
						{sneaker.brand?.name || 'Unknown'} - {sneaker.model}
					</Text>

					<Text className="text-xs text-gray-500">
						{sneaker.gender?.toUpperCase()}
					</Text>

					{sneaker.sku && (
						<Text className="text-xs text-gray-500">
							SKU: {sneaker.sku}
						</Text>
					)}
				</View>
			</View>
		</View>
	);
}

export default memo(WishlistListItem);
