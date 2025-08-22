import { useCallback, useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

import { useModalStore } from '@/store/useModalStore';
import { Sneaker } from '@/types/sneaker';

interface WishlistSwipeActionsProps {
	sneaker: Sneaker;
}

export default function WishlistSwipeActions({
	sneaker,
}: WishlistSwipeActionsProps) {
	const { t } = useTranslation();
	const { setCurrentSneaker, setModalStep, setIsVisible } = useModalStore();

	const handleSneakerPress = useCallback(() => {
		setCurrentSneaker(sneaker);
		setModalStep('view');
		setIsVisible(true);
	}, [sneaker, setCurrentSneaker, setModalStep, setIsVisible]);

	const actionButtonStyle = useMemo(
		() => ({
			justifyContent: 'center' as const,
			alignItems: 'center' as const,
			width: 80,
			height: '100%' as const,
		}),
		[]
	);

	const viewButtonStyle = useMemo(
		() => ({
			...actionButtonStyle,
			backgroundColor: '#3b82f6',
		}),
		[actionButtonStyle]
	);

	return (
		<View className="flex-row absolute top-0 left-0 right-0 bottom-0 justify-end items-center bg-[#f8f9fa] gap-1">
			<TouchableOpacity
				style={viewButtonStyle}
				onPress={handleSneakerPress}
				activeOpacity={0.7}
			>
				<View className="items-center">
					<View className="w-6 h-6 bg-white rounded-full items-center justify-center mb-1">
						<View className="w-3 h-3 border-2 border-blue-500 rounded-sm" />
					</View>
					<Text className="text-white text-xs font-medium">
						{t('collection.actions.view')}
					</Text>
				</View>
			</TouchableOpacity>
		</View>
	);
}
