import { Pressable } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

export default function BackButton({
	onPressAction,
	backgroundColor = 'bg-white',
}: {
	onPressAction: () => void;
	backgroundColor?: string;
}) {
	return (
		<Pressable
			className={`${backgroundColor} p-3 rounded-md flex items-center justify-center border border-gray-200`}
			onPress={() => {
				onPressAction();
			}}
			testID="back-button"
		>
			<Ionicons name="arrow-back" size={24} color="black" />
		</Pressable>
	);
}
