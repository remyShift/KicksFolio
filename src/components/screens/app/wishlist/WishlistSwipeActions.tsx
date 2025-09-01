import { useCallback, useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

import Entypo from '@expo/vector-icons/build/Entypo';
import Feather from '@expo/vector-icons/build/Feather';

import { useModalContext } from '@/components/ui/modals/SneakersModal/hooks/useModalContext';
import useToast from '@/hooks/ui/useToast';
import { wishlist } from '@/services/wishlist';
import { Sneaker } from '@/types/sneaker';

interface WishlistSwipeActionsProps {
	sneaker: Sneaker;
	closeRow: () => void;
	userSneakers?: Sneaker[];
	isOwner?: boolean;
}

export default function WishlistSwipeActions({
	sneaker,
	closeRow,
	userSneakers,
}: WishlistSwipeActionsProps) {
	const { t } = useTranslation();
	const { showSuccessToast, showErrorToast } = useToast();

	const { openSneakerModal } = useModalContext({
		contextSneakers: userSneakers,
	});

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

	const handleDelete = useCallback(() => {
		Alert.alert(
			t('alert.titles.deleteWishlist'),
			t('alert.descriptions.deleteWishlist'),
			[
				{
					text: t('alert.choices.cancel'),
					style: 'cancel',
				},
				{
					text: t('alert.choices.delete'),
					style: 'destructive',
					onPress: handleRemoveFromWishlist,
				},
			]
		);
	}, [t, handleRemoveFromWishlist]);

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

	const viewButtonStyle = useMemo(
		() => ({
			...actionButtonStyle,
			backgroundColor: '#3b82f6',
		}),
		[actionButtonStyle]
	);

	const handleSneakerPress = useCallback(() => {
		openSneakerModal(sneaker);
		closeRow();
	}, [sneaker, openSneakerModal, closeRow]);

	return (
		<View className="flex-row absolute top-0 left-0 right-0 bottom-0 justify-end items-center bg-[#f8f9fa] gap-1">
			<TouchableOpacity
				style={deleteButtonStyle}
				onPress={handleDelete}
				activeOpacity={0.7}
			>
				<View className="items-center">
					<Feather name="trash-2" size={24} color="white" />
					<Text className="text-white text-xs font-medium">
						{t('collection.actions.delete')}
					</Text>
				</View>
			</TouchableOpacity>

			<TouchableOpacity
				style={viewButtonStyle}
				onPress={handleSneakerPress}
				activeOpacity={0.7}
			>
				<View className="items-center">
					<Entypo name="eye" size={24} color="white" />
					<Text className="text-white text-xs font-medium">
						{t('collection.actions.view')}
					</Text>
				</View>
			</TouchableOpacity>
		</View>
	);
}
