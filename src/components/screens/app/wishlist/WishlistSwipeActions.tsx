import { useCallback, useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

import useToast from '@/hooks/ui/useToast';
import { wishlist } from '@/services/wishlist';
import { Sneaker } from '@/types/sneaker';

interface WishlistSwipeActionsProps {
	sneaker: Sneaker;
	closeRow: () => void;
}

export default function WishlistSwipeActions({
	sneaker,
	closeRow,
}: WishlistSwipeActionsProps) {
	const { t } = useTranslation();
	const { showSuccessToast, showErrorToast } = useToast();

	const handleRemoveFromWishlist = useCallback(async () => {
		try {
			await wishlist.remove(sneaker.id);
			showSuccessToast(
				t('wishlist.messages.removed.title'),
				t('wishlist.messages.removed.description')
			);
			closeRow();
		} catch (error) {
			console.error('Failed to remove from wishlist:', error);
			showErrorToast(
				t('wishlist.messages.removeFailed.title'),
				t('wishlist.messages.removeFailed.description')
			);
		}
	}, [sneaker.id, showSuccessToast, showErrorToast, t, closeRow]);

	const actionButtonStyle = useMemo(
		() => ({
			justifyContent: 'center' as const,
			alignItems: 'center' as const,
			width: 80,
			height: '100%' as const,
		}),
		[]
	);

	const deleteButtonStyle = useMemo(
		() => ({
			...actionButtonStyle,
			backgroundColor: '#dc2626',
		}),
		[actionButtonStyle]
	);

	return (
		<View className="flex-row absolute top-0 left-0 right-0 bottom-0 justify-end items-center bg-[#f8f9fa] gap-1">
			<TouchableOpacity
				style={deleteButtonStyle}
				onPress={handleRemoveFromWishlist}
				activeOpacity={0.7}
			>
				<View className="items-center">
					<View className="w-6 h-6 bg-white rounded-full items-center justify-center mb-1">
						<Text className="text-red-600 text-sm font-bold">
							×
						</Text>
					</View>
					<Text className="text-white text-xs font-medium">
						{t('wishlist.remove')}
					</Text>
				</View>
			</TouchableOpacity>
		</View>
	);
}
