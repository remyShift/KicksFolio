import { Pressable, Text } from 'react-native';

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
		<Pressable
			onPress={onPress}
			className={`px-3 py-2 rounded-full border ${
				isActive ? 'bg-black border-black' : 'bg-white border-gray-300'
			}`}
		>
			<Text
				className={`text-sm font-medium ${
					isActive ? 'text-white' : 'text-gray-700'
				}`}
			>
				{label}
			</Text>
		</Pressable>
	);
}
