import { useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { Alert, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useModalContext } from '@/components/ui/modals/SneakersModal/hooks/useModalContext';
import { useSneakerAPI } from '@/components/ui/modals/SneakersModal/hooks/useSneakerAPI';
import { useSession } from '@/contexts/authContext';
import useToast from '@/hooks/ui/useToast';
import { Sneaker } from '@/types/sneaker';

interface SwipeActionsProps {
	sneaker: Sneaker;
	closeRow: () => void;
	userSneakers?: Sneaker[];
}

export default function SwipeActions({
	sneaker,
	closeRow,
	userSneakers,
}: SwipeActionsProps) {
	const { user } = useSession();
	const { handleSneakerDelete } = useSneakerAPI();
	const { t } = useTranslation();
	const { showInfoToast, showSuccessToast, showErrorToast } = useToast();
	const { openSneakerModal } = useModalContext({
		contextSneakers: userSneakers,
	});

	const isOwner = useMemo(() => {
		return !!user && user.id === sneaker.user_id;
	}, [user, sneaker.user_id]);

	const handleDelete = async () => {
		if (!isOwner || !sneaker.id) return;

		Alert.alert(
			t('alert.titles.deleteSneaker'),
			t('alert.descriptions.deleteSneaker'),
			[
				{
					text: t('alert.choices.cancel'),
					style: 'cancel',
				},
				{
					text: t('alert.choices.delete'),
					style: 'destructive',
					onPress: () => {
						showInfoToast(
							t('collection.messages.deleting.title'),
							t('collection.messages.deleting.description')
						);
						const idToDelete = sneaker?.id;
						if (!idToDelete) {
							throw new Error('Sneaker ID is required');
						}
						handleSneakerDelete(idToDelete)
							.then(() => {
								showSuccessToast(
									t('collection.messages.deleted.title'),
									t('collection.messages.deleted.description')
								);
							})
							.catch((error) => {
								showErrorToast(
									t(
										'collection.messages.deletionFailed.title'
									),
									t(
										'collection.messages.deletionFailed.description'
									)
								);
							});
					},
				},
			]
		);
	};

	const handleSneakerPress = (sneaker: Sneaker) => {
		openSneakerModal(sneaker);
		closeRow();
	};

	// Mémoriser les composants pour éviter les re-rendus
	const deleteButton = useMemo(() => {
		if (!isOwner) return null;

		return (
			<TouchableOpacity
				className="bg-red-500 justify-center items-center px-6 h-full"
				onPress={handleDelete}
				style={{ width: 80 }}
			>
				<Ionicons name="trash-outline" size={24} color="white" />
			</TouchableOpacity>
		);
	}, [isOwner, handleDelete]);

	const viewButton = useMemo(() => {
		return (
			<TouchableOpacity
				className="bg-blue-500 justify-center items-center px-6 h-full"
				onPress={() => handleSneakerPress(sneaker)}
				style={{ width: 80 }}
			>
				<Ionicons name="eye-outline" size={24} color="white" />
			</TouchableOpacity>
		);
	}, [sneaker, handleSneakerPress]);

	return (
		<View className="flex-row justify-end items-center">
			{deleteButton}
			{viewButton}
		</View>
	);
}
