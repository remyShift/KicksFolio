import { Pressable, Text, View } from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface AddPhotoSlideProps {
	width: number;
	height: number;
	onPress: () => void;
}

export const AddPhotoSlide = ({
	width,
	height,
	onPress,
}: AddPhotoSlideProps) => {
	return (
		<View style={{ height, width }}>
			<Pressable
				onPress={onPress}
				className="w-full h-full rounded-lg border-2 border-dashed border-gray-400 bg-gray-200 items-center justify-center"
			>
				<MaterialIcons name="add-a-photo" size={32} color="gray" />
				<Text className="text-sm text-gray-600 mt-2 font-open-sans">
					Add Photo
				</Text>
			</Pressable>
		</View>
	);
};
