import { Pressable } from 'react-native';

import Feather from '@expo/vector-icons/build/Feather';

export default function DeleteButton({
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
			testID={`${testID}-button`}
		>
			<Feather name="trash-2" size={24} color="red" />
		</Pressable>
	);
}
