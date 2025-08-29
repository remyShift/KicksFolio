import { useTranslation } from 'react-i18next';
import { Pressable, Text } from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';

export default function EditImagesButton({
	handleEditImages,
}: {
	handleEditImages: () => void;
}) {
	const { t } = useTranslation();

	return (
		<Pressable
			onPress={handleEditImages}
			className="flex-row items-center gap-2 bg-gray-50 px-3 py-1 rounded-md border border-primary"
		>
			<MaterialIcons name="edit" size={16} color="#F27329" />
			<Text className="font-open-sans-bold text-sm text-primary">
				{t('collection.modal.buttons.editImages')}
			</Text>
		</Pressable>
	);
}
