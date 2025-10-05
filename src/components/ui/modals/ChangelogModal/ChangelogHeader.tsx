import { Text, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

interface ChangelogHeaderProps {
	version: string;
	onClose: () => void;
}

export default function ChangelogHeader({
	version,
	onClose,
}: ChangelogHeaderProps) {
	return (
		<View className="px-6 py-4 border-b border-gray-200">
			<View className="flex-row justify-between items-center">
				<Text className="text-sm font-open-sans-semibold text-gray-500">
					Version {version}
				</Text>
				<TouchableOpacity
					onPress={onClose}
					className="w-8 h-8 items-center justify-center"
				>
					<Ionicons name="close" size={24} color="#9ca3af" />
				</TouchableOpacity>
			</View>
		</View>
	);
}
