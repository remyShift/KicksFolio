import { Text, TouchableOpacity } from 'react-native';

interface FilterButtonProps {
	label: string;
	isActive: boolean;
	onPress: () => void;
}

export default function FilterButton({
	label,
	isActive,
	onPress,
}: FilterButtonProps) {
	return (
		<TouchableOpacity
			className={`px-3 py-2 rounded-lg mr-2 mb-2 ${isActive ? 'bg-primary' : 'bg-gray-100'}`}
			onPress={onPress}
		>
			<Text
				className={`text-sm ${isActive ? 'text-white' : 'text-gray-700'}`}
			>
				{label}
			</Text>
		</TouchableOpacity>
	);
}
