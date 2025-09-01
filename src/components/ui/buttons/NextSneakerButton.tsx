import { Pressable } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

export default function NextSneakerButton({
	onPressAction,
}: {
	onPressAction: () => void;
}) {
	return (
		<Pressable
			className="bg-white p-3 rounded-md flex items-center justify-center border border-gray-200"
			onPress={() => {
				onPressAction();
			}}
			testID="next-sneaker-button"
		>
			<Ionicons name="arrow-forward" size={24} color="black" />
		</Pressable>
	);
}
