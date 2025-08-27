import { TouchableOpacity } from 'react-native';

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
		<TouchableOpacity
			onPress={onPress}
			className="p-4 absolute right-10 top-1  z-50"
		>
			<Feather name="share" size={size} color={color} />
		</TouchableOpacity>
	);
}
