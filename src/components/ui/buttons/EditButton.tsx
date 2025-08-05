import { Pressable } from 'react-native';

import Feather from '@expo/vector-icons/Feather';

export default function EditButton({
	onPressAction,
	testID,
}: {
	onPressAction: () => void;
	testID?: string;
}) {
	return (
		<Pressable
			className="bg-white p-3 rounded-md flex items-center justify-center"
			onPress={onPressAction}
			testID={`${testID}`}
		>
			<Feather name="edit" size={20} color="black" />
		</Pressable>
	);
}
