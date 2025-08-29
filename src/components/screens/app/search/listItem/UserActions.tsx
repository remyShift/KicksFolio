import { View } from 'react-native';

import { Feather } from '@expo/vector-icons';

export default function UserActions() {
	return (
		<View className="items-center">
			<Feather name="chevron-right" size={20} color="#666" />
		</View>
	);
}
