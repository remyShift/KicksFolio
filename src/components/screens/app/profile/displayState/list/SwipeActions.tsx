import { useCallback, useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

import { useModalContext } from '@/components/ui/modals/SneakersModal/hooks/useModalContext';
import { Sneaker } from '@/types/sneaker';

interface SwipeActionsProps {
	sneaker: Sneaker;
	closeRow: () => void;
	userSneakers?: Sneaker[];
	isOwner?: boolean;
}

export default function SwipeActions({
	sneaker,
	closeRow,
	userSneakers,
	isOwner = false,
}: SwipeActionsProps) {
	const { t } = useTranslation();

	const { openSneakerModal } = useModalContext({
		contextSneakers: userSneakers,
	});

	const handleSneakerPress = useCallback(() => {
		openSneakerModal(sneaker);
		closeRow();
	}, [sneaker, openSneakerModal, closeRow]);

	const handleDelete = useCallback(() => {
		// todo: delete sneaker
		closeRow();
	}, [closeRow]);

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
			backgroundColor: '#ef4444',
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

	return (
		<View className="flex-row absolute top-0 left-0 right-0 bottom-0 justify-end items-center bg-[#f8f9fa] gap-2">
			{isOwner && (
				<TouchableOpacity
					style={deleteButtonStyle}
					onPress={handleDelete}
					activeOpacity={0.7}
				>
					<View className="items-center">
						<View className="w-6 h-6 bg-white rounded-full items-center justify-center mb-1">
							<View className="w-3 h-0.5 bg-red-500" />
						</View>
						<Text className="text-white text-xs font-medium">
							{t('collection.actions.delete')}
						</Text>
					</View>
				</TouchableOpacity>
			)}

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
