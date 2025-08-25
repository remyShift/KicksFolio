import { Pressable } from 'react-native';

import Feather from '@expo/vector-icons/Feather';

interface ShareButtonProps {
	onPress: () => void;
	size?: number;
	color?: string;
}

export default function ShareButton({
	onPress,
	size = 20,
	color = 'black',
}: ShareButtonProps) {
	return (
		<Pressable onPress={onPress}>
			<Feather name="share" size={size} color={color} />
		</Pressable>
	);
}
